export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductReview = {
  id: string;
  product_id: string;
  product_slug: string;
  product_title: string;
  user_id: string;
  order_id: string | null;
  order_item_id: string | null;
  rating: number;
  review_text: string;
  image_url: string;
  customer_name: string;
  status: ReviewStatus;
  featured: boolean;
  admin_note: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

export type ReviewsSliderSettings = {
  title: string;
  autoplay: boolean;
  intervalMs: number;
  showArrows: boolean;
  showDots: boolean;
  visibleDesktop: number;
};

export const DEFAULT_REVIEWS_SLIDER: ReviewsSliderSettings = {
  title: "Customers are saying",
  autoplay: true,
  intervalMs: 4500,
  showArrows: true,
  showDots: true,
  visibleDesktop: 5,
};

export function mergeReviewsSliderSettings(
  raw: unknown,
): ReviewsSliderSettings {
  const partial =
    raw && typeof raw === "object"
      ? (raw as Partial<ReviewsSliderSettings>)
      : {};
  const interval = Number(partial.intervalMs ?? DEFAULT_REVIEWS_SLIDER.intervalMs);
  const visible = Number(
    partial.visibleDesktop ?? DEFAULT_REVIEWS_SLIDER.visibleDesktop,
  );
  return {
    title:
      String(partial.title ?? DEFAULT_REVIEWS_SLIDER.title).trim() ||
      DEFAULT_REVIEWS_SLIDER.title,
    autoplay: Boolean(partial.autoplay ?? DEFAULT_REVIEWS_SLIDER.autoplay),
    intervalMs:
      Number.isFinite(interval) && interval >= 2000
        ? Math.min(20000, interval)
        : DEFAULT_REVIEWS_SLIDER.intervalMs,
    showArrows: Boolean(
      partial.showArrows ?? DEFAULT_REVIEWS_SLIDER.showArrows,
    ),
    showDots: Boolean(partial.showDots ?? DEFAULT_REVIEWS_SLIDER.showDots),
    visibleDesktop:
      Number.isFinite(visible) && visible >= 1
        ? Math.min(8, Math.round(visible))
        : DEFAULT_REVIEWS_SLIDER.visibleDesktop,
  };
}

export function clampRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(5, value));
}
