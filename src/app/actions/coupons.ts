"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/admin";
import { fail, ok, type ApiResponse } from "@/lib/api-response";
import {
  normalizeCouponCode,
  validateCouponAgainstCart,
  type CouponRow,
} from "@/lib/coupons";

function parseOptionalDate(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function listCoupons(): Promise<CouponRow[]> {
  await requirePermission("coupons");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listCoupons:", error.message);
    return [];
  }
  return (data ?? []) as CouponRow[];
}

export async function saveCoupon(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("coupons");

  const id = String(formData.get("id") ?? "").trim();
  const code = normalizeCouponCode(String(formData.get("code") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const discountType = String(formData.get("discount_type") ?? "percent");
  const discountValue = Number(formData.get("discount_value") ?? 0);
  const minSubtotal = Number(formData.get("min_subtotal") ?? 0);
  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const maxUses = maxUsesRaw === "" ? null : Number(maxUsesRaw);
  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const startsAt = parseOptionalDate(formData.get("starts_at"));
  const endsAt = parseOptionalDate(formData.get("ends_at"));

  if (!code || code.length < 3) {
    return fail("Coupon code must be at least 3 characters.");
  }
  if (discountType !== "percent" && discountType !== "fixed") {
    return fail("Invalid discount type.");
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return fail("Discount value must be greater than 0.");
  }
  if (discountType === "percent" && discountValue > 100) {
    return fail("Percent discount cannot exceed 100.");
  }
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
    return fail("Minimum subtotal is invalid.");
  }
  if (maxUses != null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    return fail("Max uses must be empty or at least 1.");
  }
  if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
    return fail("Start date must be before end date.");
  }

  const row = {
    code,
    description,
    discount_type: discountType,
    discount_value: discountValue,
    min_subtotal: minSubtotal,
    max_uses: maxUses,
    starts_at: startsAt,
    ends_at: endsAt,
    active,
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();

  if (id) {
    const { error } = await admin.from("coupons").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") return fail("A coupon with this code already exists.");
      return fail("Could not update coupon.", error.message);
    }
  } else {
    const { error } = await admin.from("coupons").insert(row);
    if (error) {
      if (error.code === "23505") return fail("A coupon with this code already exists.");
      return fail("Could not create coupon.", error.message);
    }
  }

  revalidatePath("/admin/coupons");
  return ok(id ? "Coupon updated." : "Coupon created.");
}

export async function setCouponActive(
  id: string,
  active: boolean,
): Promise<ApiResponse> {
  await requirePermission("coupons");
  if (!id) return fail("Coupon id is required.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("coupons")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return fail("Could not update coupon status.", error.message);
  revalidatePath("/admin/coupons");
  return ok(active ? "Coupon activated." : "Coupon deactivated.");
}

export async function deleteCoupon(id: string): Promise<ApiResponse> {
  await requirePermission("coupons");
  if (!id) return fail("Coupon id is required.");

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) return fail("Could not delete coupon.", error.message);
  revalidatePath("/admin/coupons");
  return ok("Coupon deleted.");
}

export async function applyCouponCode(
  code: string,
  subtotal: number,
): Promise<
  ApiResponse<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
    description: string;
  }>
> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return fail("Enter a coupon code.");
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return fail("Invalid cart subtotal.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return fail("Server configuration error.");
  }

  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (error || !data) {
    return fail("Coupon code not found.");
  }

  const result = validateCouponAgainstCart(data as CouponRow, subtotal);
  if (!result.ok) return fail(result.message);

  return ok("Coupon applied.", {
    code: result.code,
    discountAmount: result.discountAmount,
    discountType: result.discountType,
    discountValue: result.discountValue,
    description: result.description,
  });
}
