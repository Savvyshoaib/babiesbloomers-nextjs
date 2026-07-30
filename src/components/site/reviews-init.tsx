"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setHomepageReviews,
  setReviewsError,
  setReviewsLoading,
} from "@/store/reviews-slice";
import { createClient } from "@/lib/supabase/client";
import type { AppDispatch } from "@/store";

async function loadReviews(dispatch: AppDispatch) {
  dispatch(setReviewsLoading(true));
  try {
    const res = await fetch("/api/reviews", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to load reviews");
    }
    dispatch(
      setHomepageReviews({
        reviews: json.data.reviews,
        settings: json.data.settings,
      }),
    );
  } catch (err) {
    dispatch(
      setReviewsError(
        err instanceof Error ? err.message : "Reviews load failed",
      ),
    );
  }
}

export function ReviewsInit() {
  const dispatch = useAppDispatch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadReviews(dispatch);
  }, [dispatch]);

  // Live-sync with admin panel: approve/reject/delete/feature a review, or
  // change the homepage slider settings, refetches and updates instantly.
  useEffect(() => {
    const supabase = createClient();

    function scheduleReload() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        loadReviews(dispatch);
      }, 400);
    }

    const channel = supabase
      .channel("reviews-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_reviews" },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
          filter: "key=eq.reviews_slider",
        },
        scheduleReload,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [dispatch]);

  return null;
}
