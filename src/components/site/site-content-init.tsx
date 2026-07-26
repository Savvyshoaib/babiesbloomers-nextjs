"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setSiteContent,
  setSiteContentLoading,
} from "@/store/site-content-slice";

export function SiteContentInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      dispatch(setSiteContentLoading(true));
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success && json.data) {
          dispatch(setSiteContent(json.data));
        }
      } catch (err) {
        console.error("[site-content] client load failed", err);
      } finally {
        if (!cancelled) dispatch(setSiteContentLoading(false));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
