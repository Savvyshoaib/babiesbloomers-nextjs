import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductReview, ReviewsSliderSettings } from "@/lib/reviews";
import { DEFAULT_REVIEWS_SLIDER } from "@/lib/reviews";

type ReviewsState = {
  homepageReviews: ProductReview[];
  sliderSettings: ReviewsSliderSettings;
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: ReviewsState = {
  homepageReviews: [],
  sliderSettings: DEFAULT_REVIEWS_SLIDER,
  loading: false,
  error: null,
  initialized: false,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setReviewsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setHomepageReviews(
      state,
      action: PayloadAction<{
        reviews: ProductReview[];
        settings: ReviewsSliderSettings;
      }>,
    ) {
      state.homepageReviews = action.payload.reviews;
      state.sliderSettings = action.payload.settings;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    setReviewsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
      state.initialized = true;
    },
  },
});

export const { setReviewsLoading, setHomepageReviews, setReviewsError } =
  reviewsSlice.actions;

export default reviewsSlice.reducer;
