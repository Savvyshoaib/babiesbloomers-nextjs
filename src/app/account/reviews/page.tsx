import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyReviews } from "@/app/actions/reviews";
import { getSession } from "@/lib/session";
import { RatingStars } from "@/components/site/rating-stars";

export const revalidate = 0;

export default async function MyReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const reviews = await getMyReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink">
          My Reviews
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Reviews go live on the homepage and product pages only after admin
          approval.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-10 text-center shadow-sm">
          <p className="font-poppins text-[14px] text-body">
            You have not submitted any reviews yet.
          </p>
          <Link
            href="/account/orders"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white"
          >
            Review from delivered orders
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="grid gap-4 rounded-2xl border border-[#f0ece8] bg-white p-4 shadow-sm sm:grid-cols-[96px_1fr]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f5f5]">
                <Image
                  src={review.image_url || "/images/products/placeholder.jpg"}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={review.image_url.startsWith("http")}
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <RatingStars value={review.rating} />
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-poppins text-[11px] font-semibold uppercase ${
                      review.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : review.status === "rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
                <p className="mt-2 font-poppins text-[14px] text-ink">
                  {review.review_text}
                </p>
                <Link
                  href={`/product/${review.product_slug}`}
                  className="mt-2 inline-block font-poppins text-[13px] text-salmon hover:underline"
                >
                  {review.product_title}
                </Link>
                {review.status === "rejected" ? (
                  <div className="mt-3">
                    <Link
                      href={`/account/reviews/write?product=${encodeURIComponent(review.product_slug)}`}
                      className="font-poppins text-[13px] font-semibold text-ink underline"
                    >
                      Resubmit review
                    </Link>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
