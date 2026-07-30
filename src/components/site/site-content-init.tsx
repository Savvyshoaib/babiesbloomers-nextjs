"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setSiteContent,
  setSiteContentLoading,
} from "@/store/site-content-slice";
import { createClient } from "@/lib/supabase/client";
import type { AppDispatch } from "@/store";

async function loadSiteContent(dispatch: AppDispatch) {
  dispatch(setSiteContentLoading(true));
  try {
    const res = await fetch("/api/site-content", { cache: "no-store" });
    const json = await res.json();
    if (json.success && json.data) {
      dispatch(setSiteContent(json.data));
    }
  } catch (err) {
    console.error("[site-content] client load failed", err);
  } finally {
    dispatch(setSiteContentLoading(false));
  }
}

export function SiteContentInit() {
  const dispatch = useAppDispatch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSiteContent(dispatch);
  }, [dispatch]);

  // Live-sync with admin panel: branding/banners/pages/scripts edits in
  // site_settings refetch and update the storefront instantly.
  useEffect(() => {
    const supabase = createClient();

    function scheduleReload() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        loadSiteContent(dispatch);
      }, 400);
    }

    const channel = supabase
      .channel("site-content-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
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
