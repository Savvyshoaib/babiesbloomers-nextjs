"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { shopCategories as staticShopCategories } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import { ChevronDownIcon } from "./icons";

export type NavCategory = {
  slug: string;
  label: string;
  count?: number;
};

export function useNavCategories(): NavCategory[] {
  const catalogCategories = useAppSelector((s) => s.catalog.categories);

  return useMemo(() => {
    const fromCatalog = catalogCategories
      .filter((c) => c.isActive !== false)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
      .map((c) => ({
        slug: c.slug,
        label: c.label,
        count: c.count,
      }));

    if (fromCatalog.length > 0) return fromCatalog;

    return staticShopCategories.map((c) => ({
      slug: c.slug,
      label: c.label,
      count: c.count,
    }));
  }, [catalogCategories]);
}

function categoryHref(slug: string) {
  return `/shop?category=${encodeURIComponent(slug)}`;
}

/** Desktop mega menu — hover + click, full-width under nav. */
export function CategoriesDesktopMegaMenu({
  active,
}: {
  active?: boolean;
}) {
  const categories = useNavCategories();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      clearCloseTimer();
    };
  }, []);

  return (
    <li
      ref={wrapRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="categories-mega-menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-[35px] py-5 font-poppins text-[20px] leading-[28px] text-white transition-colors hover:text-salmon ${
          active || open ? "font-semibold text-salmon" : "font-medium"
        }`}
      >
        Categories
        <ChevronDownIcon
          className={`size-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id="categories-mega-menu"
        role="region"
        aria-label="Shop categories"
        className={`absolute left-1/2 top-full z-50 w-[min(920px,92vw)] -translate-x-1/2 pt-0 transition-[opacity,visibility,transform] duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden rounded-b-2xl border border-t-0 border-[#e8e2dc] bg-white shadow-[0_18px_40px_rgba(19,27,41,0.18)]">
          <div className="flex items-center justify-between border-b border-[#f0ece8] px-5 py-3">
            <p className="font-poppins text-[13px] font-semibold uppercase tracking-wide text-body">
              Shop by category
            </p>
            <Link
              href="/categories"
              onClick={() => setOpen(false)}
              className="font-poppins text-[13px] font-medium text-salmon transition-colors hover:text-salmon-soft"
            >
              View all
            </Link>
          </div>

          <ul className="grid max-h-[min(420px,60vh)] grid-cols-2 gap-x-2 gap-y-0.5 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={categoryHref(cat.slug)}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 font-poppins text-[14px] font-medium text-ink transition-colors hover:bg-[#fff5f2] hover:text-salmon"
                >
                  <span className="truncate">{cat.label}</span>
                  {typeof cat.count === "number" ? (
                    <span className="shrink-0 text-[12px] text-body">
                      {cat.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#f0ece8] bg-[#faf9f7] px-5 py-3">
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="inline-flex font-poppins text-[13px] font-semibold text-ink transition-colors hover:text-salmon"
            >
              Browse all products →
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Mobile accordion inside the drawer. */
export function CategoriesMobileAccordion({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const categories = useNavCategories();
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 font-poppins text-[18px] font-medium leading-[28px] text-white"
      >
        Categories
        <ChevronDownIcon
          className={`size-5 text-white/80 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="mb-2 max-h-[50vh] space-y-0.5 overflow-y-auto rounded-xl bg-white/5 p-2">
          <li>
            <Link
              href="/categories"
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2.5 font-poppins text-[15px] font-semibold text-salmon"
            >
              All categories
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={categoryHref(cat.slug)}
                onClick={onNavigate}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 font-poppins text-[15px] text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>{cat.label}</span>
                {typeof cat.count === "number" ? (
                  <span className="text-[12px] text-white/50">{cat.count}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
