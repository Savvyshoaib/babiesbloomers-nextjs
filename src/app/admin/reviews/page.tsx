import {
  getReviewsSliderSettings,
  listAdminReviews,
} from "@/app/actions/reviews";
import { requirePermission } from "@/lib/admin";
import { ReviewsAdminClient } from "./reviews-client";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  await requirePermission("reviews");
  const [reviews, slider] = await Promise.all([
    listAdminReviews("all"),
    getReviewsSliderSettings(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Reviews
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Approve customer reviews to publish them on the homepage and update
          product ratings. Rejected reviews stay hidden.
        </p>
      </div>
      <ReviewsAdminClient initial={reviews} slider={slider} />
    </div>
  );
}
