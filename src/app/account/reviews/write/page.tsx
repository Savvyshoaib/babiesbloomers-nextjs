import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOrder } from "@/app/actions/orders";
import { getMyReviewForProduct } from "@/app/actions/reviews";
import { getSession } from "@/lib/session";
import { WriteReviewForm } from "@/components/site/write-review-form";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    product?: string;
    order?: string;
    item?: string;
  }>;
}

export default async function WriteReviewPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const productSlug = String(params.product || "").trim();
  const orderId = String(params.order || "").trim();
  const itemId = String(params.item || "").trim();

  if (!productSlug) notFound();

  const existing = await getMyReviewForProduct(productSlug);
  if (existing?.status === "approved" || existing?.status === "pending") {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="font-fredoka text-[28px] font-semibold text-ink">
          Review already submitted
        </h1>
        <p className="font-poppins text-[14px] text-body">
          Status: <strong className="capitalize">{existing.status}</strong>.
          {existing.status === "pending"
            ? " Waiting for admin approval."
            : " It is live on the storefront."}
        </p>
        <Link
          href="/account/reviews"
          className="inline-flex h-10 items-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white"
        >
          View my reviews
        </Link>
      </div>
    );
  }

  let productTitle = productSlug;
  let productImage = "/images/products/placeholder.jpg";
  let orderItemId = itemId || undefined;

  if (orderId) {
    const order = await getOrder(orderId);
    if (!order || order.status !== "delivered") {
      notFound();
    }
    const line = order.order_items?.find(
      (i) => i.product_slug === productSlug || i.id === itemId,
    );
    if (!line) notFound();
    productTitle = line.title;
    productImage = line.image || productImage;
    orderItemId = line.id;
  } else {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select("title, image, slug")
      .eq("slug", productSlug)
      .maybeSingle();
    if (!product) notFound();
    productTitle = product.title;
    productImage = product.image || productImage;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", session.userId)
    .maybeSingle();

  const defaultName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <Link
          href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
          className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mt-2 font-fredoka text-[28px] font-semibold text-ink">
          Write a review
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Share a rating and short description. Admin approval is required
          before it appears on the website.
        </p>
      </div>

      <WriteReviewForm
        productSlug={productSlug}
        productTitle={productTitle}
        productImage={productImage}
        orderId={orderId || undefined}
        orderItemId={orderItemId}
        defaultName={defaultName || undefined}
      />
    </div>
  );
}
