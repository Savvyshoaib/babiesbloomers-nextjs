"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteReview,
  moderateReview,
  saveReviewsSliderSettings,
} from "@/app/actions/reviews";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { RatingStars } from "@/components/site/rating-stars";
import type { ProductReview, ReviewsSliderSettings } from "@/lib/reviews";

export function ReviewsAdminClient({
  initial,
  slider,
}: {
  initial: ProductReview[];
  slider: ReviewsSliderSettings;
}) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending",
  );
  const [pending, startTransition] = useTransition();
  const moderateAction = useAdminAction(moderateReview);
  const sliderAction = useAdminAction(saveReviewsSliderSettings);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [filter, reviews]);

  function onModerate(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("status", status);
      fd.set("featured", "true");
      const res = await moderateReview(undefined, fd);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                featured: status === "approved",
                reviewed_at: new Date().toISOString(),
              }
            : r,
        ),
      );
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this review permanently?")) return;
    startTransition(async () => {
      const res = await deleteReview(id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Homepage slider settings
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Controls “Customers are saying” autoplay, speed, arrows and dots.
        </p>
        <form action={sliderAction.formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Section title
            </label>
            <input
              name="title"
              defaultValue={slider.title}
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Autoplay interval (ms)
            </label>
            <input
              name="intervalMs"
              type="number"
              min={2000}
              step={500}
              defaultValue={slider.intervalMs}
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Cards on desktop
            </label>
            <input
              name="visibleDesktop"
              type="number"
              min={3}
              max={8}
              defaultValue={slider.visibleDesktop}
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div className="flex flex-wrap items-end gap-4 pb-1">
            <label className="flex items-center gap-2 font-poppins text-[13px]">
              <input
                type="checkbox"
                name="autoplay"
                defaultChecked={slider.autoplay}
                className="size-4 accent-salmon"
              />
              Autoplay
            </label>
            <label className="flex items-center gap-2 font-poppins text-[13px]">
              <input
                type="checkbox"
                name="showArrows"
                defaultChecked={slider.showArrows}
                className="size-4 accent-salmon"
              />
              Arrows
            </label>
            <label className="flex items-center gap-2 font-poppins text-[13px]">
              <input
                type="checkbox"
                name="showDots"
                defaultChecked={slider.showDots}
                className="size-4 accent-salmon"
              />
              Dots
            </label>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <AdminSubmitButton
              pending={sliderAction.pending}
              label="Save slider settings"
            />
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`h-9 rounded-full px-4 font-poppins text-[12px] font-semibold capitalize ${
              filter === key
                ? "bg-salmon text-white"
                : "border border-[#e0e0e0] bg-white text-ink hover:border-salmon"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#e8e2dc] bg-white p-10 text-center font-poppins text-[14px] text-body">
            No {filter === "all" ? "" : filter} reviews yet.
          </div>
        ) : (
          filtered.map((review) => (
            <article
              key={review.id}
              className="grid gap-4 rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f5f5]">
                <Image
                  src={review.image_url || "/images/products/placeholder.jpg"}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
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
                <p className="mt-2 font-poppins text-[13px] text-body">
                  <span className="font-semibold text-ink">
                    {review.customer_name}
                  </span>{" "}
                  ·{" "}
                  <Link
                    href={`/product/${review.product_slug}`}
                    className="text-salmon hover:underline"
                  >
                    {review.product_title}
                  </Link>
                </p>
                <p className="mt-1 font-poppins text-[12px] text-body">
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-stretch">
                {review.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={pending || moderateAction.pending}
                    onClick={() => onModerate(review.id, "approved")}
                    className="h-9 rounded-lg bg-emerald-600 px-3 font-poppins text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                ) : null}
                {review.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={pending || moderateAction.pending}
                    onClick={() => onModerate(review.id, "rejected")}
                    className="h-9 rounded-lg bg-red-500 px-3 font-poppins text-[12px] font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onDelete(review.id)}
                  className="h-9 rounded-lg border border-[#ddd] px-3 font-poppins text-[12px] font-semibold text-ink hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
