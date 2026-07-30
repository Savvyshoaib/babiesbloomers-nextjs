import { NextResponse, type NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import {
  getApprovedHomepageReviews,
  getProductApprovedReviews,
  getReviewsSliderSettings,
} from "@/app/actions/reviews";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const productSlug = request.nextUrl.searchParams.get("productSlug");

    if (productSlug) {
      const reviews = await getProductApprovedReviews(productSlug);
      return NextResponse.json(ok("Reviews loaded.", { reviews }));
    }

    const [reviews, settings] = await Promise.all([
      getApprovedHomepageReviews(24),
      getReviewsSliderSettings(),
    ]);
    return NextResponse.json(ok("Reviews loaded.", { reviews, settings }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(fail("Could not load reviews.", message), {
      status: 500,
    });
  }
}
