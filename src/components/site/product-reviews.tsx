"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProductReview } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/client";
import { RatingStars } from "./rating-stars";
import { ReviewDetailModal, VerifiedBadge, formatReviewDate } from "./review-shared";

function initialsFor(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  return trimmed
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function ProductReviews({
  productSlug,
  initialReviews,
}: {
  productSlug: string;
  initialReviews: ProductReview[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(
    null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live-sync with admin panel: approving/rejecting/deleting a review for
  // this product updates the list instantly, no page reload needed.
  useEffect(() => {
    const supabase = createClient();

    async function reload() {
      try {
        const res = await fetch(
          `/api/reviews?productSlug=${encodeURIComponent(productSlug)}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (res.ok && json.success) {
          setReviews(json.data.reviews);
        }
      } catch {
        // keep showing the last known list on transient failures
      }
    }

    function scheduleReload() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(reload, 400);
    }

    const channel = supabase
      .channel(`product-reviews-${productSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_reviews",
          filter: `product_slug=eq.${productSlug}`,
        },
        scheduleReload,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [productSlug]);

  if (reviews.length === 0) {
    return <p>There are no reviews yet. Be the first to review this product.</p>;
  }

  return (
    <>
      <ul className="max-w-2xl divide-y divide-[#eee]">
        {reviews.map((review) => (
          <li key={review.id} className="flex gap-3 py-5 first:pt-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-salmon-soft font-poppins text-[13px] font-semibold text-ink">
              {initialsFor(review.customer_name || "Anonymous")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-poppins text-[14px] font-semibold text-ink">
                  {review.customer_name || "Anonymous"}
                </p>
                <VerifiedBadge />
                {review.created_at ? (
                  <span className="font-poppins text-[12px] text-body">
                    · {formatReviewDate(review.created_at)}
                  </span>
                ) : null}
              </div>
              <div className="mt-1">
                <RatingStars value={review.rating} />
              </div>
              <p className="mt-2 whitespace-pre-line font-poppins text-[14px] leading-6 text-body">
                {review.review_text}
              </p>
              {review.image_url ? (
                <button
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  aria-label="View review photo"
                  className="relative mt-3 size-16 overflow-hidden rounded-lg border border-[#eee] transition-opacity hover:opacity-80"
                >
                  <Image
                    src={review.image_url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={review.image_url.startsWith("http")}
                  />
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </>
  );
}
