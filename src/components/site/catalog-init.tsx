"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setCatalog,
  setCatalogError,
  setCatalogLoading,
} from "@/store/catalog-slice";

export function CatalogInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      dispatch(setCatalogLoading(true));
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load catalog");
        }
        if (!cancelled) {
          dispatch(
            setCatalog({
              products: json.data.products,
              categories: json.data.categories,
            }),
          );
        }
      } catch (err) {
        if (!cancelled) {
          dispatch(
            setCatalogError(
              err instanceof Error ? err.message : "Catalog load failed",
            ),
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
