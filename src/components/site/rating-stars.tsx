"use client";

import { StarIcon } from "./icons";
import { clampRating } from "@/lib/reviews";

/** Filled / empty star row for product cards and reviews. */
export function RatingStars({
  value = 0,
  count,
  className = "",
  size = "sm",
  showCount = false,
}: {
  value?: number;
  count?: number;
  className?: string;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  const rating = clampRating(value);
  const filled = Math.round(rating);
  const starSize = size === "md" ? "size-[15px]" : "size-[13px]";
  const label =
    rating > 0
      ? `${rating.toFixed(1)} out of 5 stars${
          typeof count === "number" ? `, ${count} reviews` : ""
        }`
      : "No rating yet";

  return (
    <div
      className={`inline-flex items-center gap-[6px] ${className}`}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={`${starSize} ${
            i < filled ? "text-amber" : "text-[#d9d9d9]"
          }`}
        />
      ))}
      {showCount && typeof count === "number" && count > 0 ? (
        <span className="font-poppins text-[12px] text-body">({count})</span>
      ) : null}
    </div>
  );
}
