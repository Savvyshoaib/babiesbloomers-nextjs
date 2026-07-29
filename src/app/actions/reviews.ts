"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/admin";
import { fail, ok, type ApiResponse } from "@/lib/api-response";
import {
  mergeReviewsSliderSettings,
  type ProductReview,
  type ReviewStatus,
  type ReviewsSliderSettings,
} from "@/lib/reviews";

async function uploadReviewImage(file: File, userId: string) {
  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." as string, url: null };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be under 5MB." as string, url: null };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from("review-images").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { error: error.message, url: null };
  }

  const { data } = admin.storage.from("review-images").getPublicUrl(path);
  return { error: null, url: data.publicUrl };
}

export async function submitProductReview(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await getSession();
  if (!session) return fail("Please sign in to submit a review.");

  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const orderId = String(formData.get("orderId") ?? "").trim() || null;
  const orderItemId = String(formData.get("orderItemId") ?? "").trim() || null;
  const rating = Number(formData.get("rating") ?? 0);
  const reviewText = String(formData.get("reviewText") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const imageFile = formData.get("image");

  if (!productSlug) return fail("Product is required.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail("Please choose a rating from 1 to 5 stars.");
  }
  if (reviewText.length < 10) {
    return fail("Please write at least 10 characters about the product.");
  }
  if (!customerName) return fail("Please enter your name.");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return fail("Server configuration error.");
  }

  const { data: product } = await admin
    .from("products")
    .select("id, slug, title, image")
    .eq("slug", productSlug)
    .maybeSingle();

  if (!product) return fail("Product not found.");

  // Prefer delivered order ownership when order is provided
  if (orderId) {
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status, shipping_email")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return fail("Order not found.");
    if (order.user_id !== session.userId) {
      return fail("You can only review products from your own orders.");
    }
    if (order.status !== "delivered") {
      return fail("You can review products after the order is delivered.");
    }

    const { data: line } = await admin
      .from("order_items")
      .select("id, product_slug")
      .eq("order_id", orderId)
      .eq("product_slug", productSlug)
      .maybeSingle();

    if (!line) {
      return fail("This product was not part of that order.");
    }
  }

  let imageUrl = "";
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadReviewImage(imageFile, session.userId);
    if (uploaded.error || !uploaded.url) {
      return fail(uploaded.error || "Could not upload image.");
    }
    imageUrl = uploaded.url;
  } else {
    // Fall back to product image so homepage cards always have media
    imageUrl = product.image || "";
  }

  const { data: existing } = await admin
    .from("product_reviews")
    .select("id, status")
    .eq("user_id", session.userId)
    .eq("product_id", product.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "approved") {
      return fail("You already reviewed this product.");
    }
    if (existing.status === "pending") {
      return fail("Your review is already waiting for admin approval.");
    }
    // Allow resubmit after reject
    const { error } = await admin
      .from("product_reviews")
      .update({
        rating,
        review_text: reviewText,
        image_url: imageUrl,
        customer_name: customerName,
        order_id: orderId,
        order_item_id: orderItemId,
        status: "pending",
        featured: true,
        admin_note: "",
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return fail("Could not resubmit review.", error.message);
  } else {
    const { error } = await admin.from("product_reviews").insert({
      product_id: product.id,
      product_slug: product.slug,
      product_title: product.title,
      user_id: session.userId,
      order_id: orderId,
      order_item_id: orderItemId,
      rating,
      review_text: reviewText,
      image_url: imageUrl,
      customer_name: customerName,
      status: "pending",
      featured: true,
    });

    if (error) {
      if (error.code === "23505") {
        return fail("You already submitted a review for this product.");
      }
      return fail("Could not submit review.", error.message);
    }
  }

  revalidatePath("/account/reviews");
  revalidatePath(`/account/orders/${orderId || ""}`);
  revalidatePath("/admin/reviews");
  return ok("Review submitted. It will appear after admin approval.");
}

export async function getMyReviews(): Promise<ProductReview[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ProductReview[];
}

export async function getMyReviewForProduct(
  productSlug: string,
): Promise<ProductReview | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("user_id", session.userId)
    .eq("product_slug", productSlug)
    .maybeSingle();

  return (data as ProductReview) ?? null;
}

export async function listAdminReviews(
  status?: ReviewStatus | "all",
): Promise<ProductReview[]> {
  await requirePermission("reviews");
  const admin = createAdminClient();
  let query = admin
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listAdminReviews:", error.message);
    return [];
  }
  return (data ?? []) as ProductReview[];
}

export async function moderateReview(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("reviews");

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as ReviewStatus;
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!id) return fail("Review id is required.");
  if (!["approved", "rejected", "pending"].includes(status)) {
    return fail("Invalid status.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_reviews")
    .update({
      status,
      featured: status === "approved" ? featured : false,
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return fail("Could not update review.", error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/api/catalog");
  return ok(
    status === "approved"
      ? "Review approved and published."
      : status === "rejected"
        ? "Review rejected."
        : "Review set back to pending.",
  );
}

export async function deleteReview(id: string): Promise<ApiResponse> {
  await requirePermission("reviews");
  if (!id) return fail("Review id is required.");

  const admin = createAdminClient();
  const { error } = await admin.from("product_reviews").delete().eq("id", id);
  if (error) return fail("Could not delete review.", error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return ok("Review deleted.");
}

export async function getReviewsSliderSettings(): Promise<ReviewsSliderSettings> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "reviews_slider")
      .maybeSingle();
    return mergeReviewsSliderSettings(data?.value);
  } catch {
    return mergeReviewsSliderSettings(null);
  }
}

export async function saveReviewsSliderSettings(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("reviews");

  const settings = mergeReviewsSliderSettings({
    title: String(formData.get("title") ?? ""),
    autoplay: formData.get("autoplay") === "on",
    intervalMs: Number(formData.get("intervalMs") ?? 4500),
    showArrows: formData.get("showArrows") === "on",
    showDots: formData.get("showDots") === "on",
    visibleDesktop: Number(formData.get("visibleDesktop") ?? 5),
  });

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key: "reviews_slider",
    value: settings,
    updated_at: new Date().toISOString(),
  });

  if (error) return fail("Could not save slider settings.", error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return ok("Slider settings saved.");
}

export async function getApprovedHomepageReviews(
  limit = 24,
): Promise<ProductReview[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("product_reviews")
      .select("*")
      .eq("status", "approved")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getApprovedHomepageReviews:", error.message);
      return [];
    }
    return (data ?? []) as ProductReview[];
  } catch {
    return [];
  }
}

export async function getProductApprovedReviews(
  productSlug: string,
): Promise<ProductReview[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("product_reviews")
      .select("*")
      .eq("product_slug", productSlug)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []) as ProductReview[];
  } catch {
    return [];
  }
}
