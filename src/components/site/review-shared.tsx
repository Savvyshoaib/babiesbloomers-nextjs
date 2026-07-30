"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ProductReview } from "@/lib/reviews";
import { RatingStars } from "./rating-stars";
import { CloseIcon } from "./icons";

export function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function VerifiedBadge() {
  return (
    <span
      className="inline-flex size-[16px] items-center justify-center rounded-full bg-ink text-white"
      title="Verified buyer"
      aria-label="Verified buyer"
    >
      <svg viewBox="0 0 20 20" className="size-[10px]" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export function ReviewDetailModal({
  review,
  onClose,
}: {
  review: ProductReview | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(review);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!review) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Review by ${review.customer_name || "Anonymous"}`}
    >
      <button
        type="button"
        aria-label="Close review"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <button
          ref={closeRef}
          type="button"
          aria-label="Close review"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
        >
          <CloseIcon className="size-4" />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f5f5f5]">
          <Image
            src={review.image_url || "/images/products/placeholder.jpg"}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-cover"
            unoptimized={review.image_url.startsWith("http")}
          />
        </div>

        <div className="px-6 py-5">
          <div className="flex justify-center">
            <RatingStars value={review.rating} size="md" />
          </div>
          <p className="mt-4 whitespace-pre-line text-center font-poppins text-[15px] leading-6 text-body">
            {review.review_text}
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <p className="font-poppins text-[15px] font-semibold text-ink">
              {review.customer_name || "Anonymous"}
            </p>
            <VerifiedBadge />
          </div>
          {review.created_at ? (
            <p className="mt-1 text-center font-poppins text-[12px] text-body">
              {formatReviewDate(review.created_at)}
            </p>
          ) : null}
          <div className="mt-4 text-center">
            <Link
              href={`/product/${review.product_slug}`}
              onClick={onClose}
              className="font-poppins text-[13px] font-semibold uppercase tracking-wide text-salmon hover:underline"
            >
              {review.product_title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
