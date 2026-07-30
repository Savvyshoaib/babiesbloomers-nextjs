"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProductReview } from "@/lib/reviews";
import type { ReviewsSliderSettings } from "@/lib/reviews";
import { useAppSelector } from "@/store/hooks";
import { RatingStars } from "./rating-stars";
import { ReviewDetailModal, VerifiedBadge } from "./review-shared";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export function CustomersSaying({
  reviews: initialReviews,
  settings: initialSettings,
}: {
  reviews: ProductReview[];
  settings: ReviewsSliderSettings;
}) {
  // Prefer live Redux data (kept fresh in real time by ReviewsInit) once
  // it's loaded; fall back to server-rendered props for the first paint.
  const liveReviews = useAppSelector((s) => s.reviews.homepageReviews);
  const liveSettings = useAppSelector((s) => s.reviews.sliderSettings);
  const initialized = useAppSelector((s) => s.reviews.initialized);
  const reviews = initialized ? liveReviews : initialReviews;
  const settings = initialized ? liveSettings : initialSettings;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(settings.visibleDesktop);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setVisible(1);
      else if (w < 900) setVisible(2);
      else if (w < 1200) setVisible(3);
      else if (w < 1400) setVisible(4);
      else setVisible(Math.min(settings.visibleDesktop, 5));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [settings.visibleDesktop]);

  const maxStart = Math.max(0, reviews.length - visible);
  const safeIndex = Math.min(index, maxStart);
  const needsSlider = reviews.length > visible;

  useEffect(() => {
    setIndex(0);
  }, [reviews.length, visible]);

  useEffect(() => {
    if (!needsSlider || !settings.autoplay || reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i >= maxStart ? 0 : i + 1));
    }, settings.intervalMs);
    return () => window.clearInterval(timer);
  }, [
    needsSlider,
    settings.autoplay,
    settings.intervalMs,
    maxStart,
    reviews.length,
  ]);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return { avg: 0, count: 0 };
    }
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return {
      avg: Number((sum / reviews.length).toFixed(2)),
      count: reviews.length,
    };
  }, [reviews]);

  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(
    null,
  );

  if (reviews.length === 0) {
    return null;
  }

  function go(delta: number) {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return maxStart;
      if (next > maxStart) return 0;
      return next;
    });
  }

  return (
    <section
      className="mt-[80px] pb-[80px] max-[880px]:mt-[40px] max-[880px]:pb-[40px]"
      aria-labelledby="customers-saying-heading"
    >
      <div className="shell">
        <div className="text-center">
          <h2
            id="customers-saying-heading"
            className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]"
          >
            {settings.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 font-poppins text-[14px] text-ink">
            <RatingStars value={summary.avg} size="md" />
            <span className="font-semibold">{summary.avg.toFixed(2)}</span>
            <span className="inline-flex items-center gap-1 text-body">
              <span className="text-amber">★</span>({summary.count.toLocaleString()})
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] px-2.5 py-1 text-[12px] font-semibold text-[#0f766e]">
              <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          </div>
        </div>

        <div className="relative mt-10">
          {needsSlider && settings.showArrows ? (
            <>
              <button
                type="button"
                aria-label="Previous reviews"
                onClick={() => go(-1)}
                className="absolute -left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e2dc] bg-white text-ink shadow-sm transition hover:border-salmon hover:text-salmon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salmon/40 sm:-left-4 lg:-left-6"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next reviews"
                onClick={() => go(1)}
                className="absolute -right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e2dc] bg-white text-ink shadow-sm transition hover:border-salmon hover:text-salmon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salmon/40 sm:-right-4 lg:-right-6"
              >
                <Chevron dir="right" />
              </button>
            </>
          ) : null}

          <div className="overflow-hidden px-1">
            <div
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${safeIndex * (100 / visible)}%)`,
              }}
            >
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${(visible - 1) * 16}px) / ${visible})` }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`View review by ${review.customer_name || "Anonymous"}`}
                    onClick={() => setSelectedReview(review)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedReview(review);
                      }
                    }}
                    className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#eee] bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salmon/40"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f5f5]">
                      <Image
                        src={review.image_url || "/images/products/placeholder.jpg"}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 90vw, 220px"
                        className="object-cover"
                        unoptimized={review.image_url.startsWith("http")}
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-5 pt-4 text-center">
                      <p className="line-clamp-3 min-h-[60px] font-poppins text-[13px] leading-5 text-body">
                        {review.review_text}
                      </p>
                      <div className="mt-3 flex justify-center">
                        <RatingStars value={review.rating} />
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        <p className="font-poppins text-[14px] font-semibold text-ink">
                          {review.customer_name || "Anonymous"}
                        </p>
                        <VerifiedBadge />
                      </div>
                      <Link
                        href={`/product/${review.product_slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 truncate font-poppins text-[11px] uppercase tracking-wide text-body transition-colors hover:text-salmon"
                      >
                        {review.product_title}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {needsSlider && settings.showDots ? (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: maxStart + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to review set ${i + 1}`}
                  aria-current={i === safeIndex}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === safeIndex
                      ? "w-6 bg-salmon"
                      : "w-2.5 bg-[#ddd] hover:bg-[#bbb]"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </section>
  );
}
