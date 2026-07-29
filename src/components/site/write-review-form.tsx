"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { submitProductReview } from "@/app/actions/reviews";
import { StarIcon } from "@/components/site/icons";

export function WriteReviewForm({
  productSlug,
  productTitle,
  productImage,
  orderId,
  orderItemId,
  defaultName,
}: {
  productSlug: string;
  productTitle: string;
  productImage: string;
  orderId?: string;
  orderItemId?: string;
  defaultName?: string;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const action = useAdminAction(submitProductReview);

  return (
    <div className="rounded-2xl border border-[#f0ece8] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f5]">
          <Image
            src={productImage || "/images/products/placeholder.jpg"}
            alt={productTitle}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0">
          <p className="font-poppins text-[12px] uppercase tracking-wide text-body">
            Reviewing
          </p>
          <h2 className="mt-1 font-poppins text-[16px] font-semibold text-ink">
            {productTitle}
          </h2>
          <Link
            href={`/product/${productSlug}`}
            className="mt-1 inline-block font-poppins text-[13px] text-salmon hover:underline"
          >
            View product
          </Link>
        </div>
      </div>

      <form action={action.formAction} className="space-y-4">
        <input type="hidden" name="productSlug" value={productSlug} />
        <input type="hidden" name="orderId" value={orderId || ""} />
        <input type="hidden" name="orderItemId" value={orderItemId || ""} />
        <input type="hidden" name="rating" value={rating} />

        <div>
          <p className="mb-2 font-poppins text-[13px] font-medium text-ink">
            Your rating
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = value <= (hover || rating);
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(value)}
                  className="p-1"
                >
                  <StarIcon
                    className={`size-7 transition-colors ${
                      active ? "text-amber" : "text-[#d9d9d9]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Your name
          </label>
          <input
            name="customerName"
            required
            defaultValue={defaultName || ""}
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Review
          </label>
          <textarea
            name="reviewText"
            required
            minLength={10}
            rows={4}
            placeholder="Share fabric quality, fit, and how your little one liked it…"
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[14px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Photo (optional)
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="block w-full font-poppins text-[13px] text-body file:mr-3 file:rounded-lg file:border-0 file:bg-[#fff5f2] file:px-3 file:py-2 file:font-semibold file:text-salmon"
          />
          <p className="mt-1 font-poppins text-[12px] text-body">
            If no photo is uploaded, the product image is used on the homepage.
          </p>
        </div>

        <AdminSubmitButton
          pending={action.pending}
          label="Submit for approval"
          pendingLabel="Submitting…"
        />
        <p className="font-poppins text-[12px] text-body">
          Your review stays private until an admin approves it.
        </p>
      </form>
    </div>
  );
}
