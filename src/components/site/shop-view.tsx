"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SHOP_PER_PAGE,
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  latestProducts,
  shopCategories,
  shopProducts,
  shopSortOptions,
  type ShopProduct,
  type ShopSortValue,
} from "@/lib/site-data";
import {
  ChevronRightIcon,
  FilterLinesIcon,
  Grid2ViewIcon,
  Grid3ViewIcon,
  Grid5ViewIcon,
  ListViewIcon,
  SortLinesIcon,
} from "./icons";
import { ShopCard } from "./product-card";

type ViewMode = "list" | "grid-2" | "grid-3" | "grid-5";

type ShopViewProps = {
  products?: ShopProduct[];
  /** Default grid density. New Arrivals uses 5-up. */
  defaultView?: ViewMode;
  defaultSort?: ShopSortValue;
  perPage?: number;
  /** When true, include the 5-column view toggle (New Arrivals). */
  showFiveCol?: boolean;
};

function formatPkr(value: number) {
  return `₨${Math.round(value).toLocaleString("en-PK")}`;
}

function SidebarWidget({
  title,
  children,
  className = "",
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mb-[50px] rounded-[15px] border border-[#d6d6d6] px-[15px] pb-[30px] pt-[38px] last:mb-0 ${className}`}
    >
      <h3 className="absolute left-5 top-[-15px] bg-white px-2.5 font-fredoka text-[22px] font-medium leading-[30px] text-[#111]">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ShopView({
  products = shopProducts,
  defaultView = "grid-3",
  defaultSort = "menu_order",
  perPage = SHOP_PER_PAGE,
  showFiveCol = false,
}: ShopViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ShopSortValue>(defaultSort);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<ViewMode>(defaultView);
  const [page, setPage] = useState(1);
  const [priceMin, setPriceMin] = useState(SHOP_PRICE_MIN);
  const [priceMax, setPriceMax] = useState(SHOP_PRICE_MAX);
  /* Archive shows full catalogue until Filter is submitted. */
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(Number.POSITIVE_INFINITY);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => p.priceValue >= appliedMin && p.priceValue <= appliedMax,
    );
    if (category) {
      list = list.filter((p) => p.categories.includes(category));
    }
    const sorted = [...list];
    switch (sort) {
      case "price":
        sorted.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "date":
        /* `products` is already newest-first for New Arrivals; shop A–Z flips. */
        if (defaultSort === "menu_order") sorted.reverse();
        break;
      case "menu_order":
        if (defaultSort === "date") {
          sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
        break;
      default:
        break;
    }
    return sorted;
  }, [appliedMin, appliedMax, category, defaultSort, products, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, filtered.length);
  const sortLabel =
    shopSortOptions.find((o) => o.value === sort)?.label ?? "Default sorting";

  const range = SHOP_PRICE_MAX - SHOP_PRICE_MIN;
  const leftPct = ((priceMin - SHOP_PRICE_MIN) / range) * 100;
  const rightPct = ((priceMax - SHOP_PRICE_MIN) / range) * 100;

  const gridClass =
    view === "list"
      ? "grid grid-cols-1 gap-x-[30px] gap-y-[30px]"
      : view === "grid-2"
        ? "grid grid-cols-2 gap-x-[30px] gap-y-[30px]"
        : view === "grid-5"
          ? "grid grid-cols-2 gap-x-[20px] gap-y-[30px] sm:grid-cols-3 md:grid-cols-4 min-[1201px]:grid-cols-5"
          : "grid grid-cols-2 gap-x-[30px] gap-y-[30px] min-[1025px]:grid-cols-3";

  const viewOptions = [
    { mode: "list" as const, label: "List view", Icon: ListViewIcon },
    { mode: "grid-2" as const, label: "2 column grid", Icon: Grid2ViewIcon },
    { mode: "grid-3" as const, label: "3 column grid", Icon: Grid3ViewIcon },
    ...(showFiveCol
      ? [
          {
            mode: "grid-5" as const,
            label: "5 column grid",
            Icon: Grid5ViewIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="shell pb-[80px] pt-[30px] max-[880px]:pb-[50px]">
      {/* Toolbar */}
      <div className="relative z-20 mb-[30px] flex min-h-[56px] flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#d6d6d6] px-4 py-2 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 font-poppins text-[14px] font-medium leading-6 text-[#898989] transition-colors hover:text-ink"
          >
            <span>{sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}</span>
            <FilterLinesIcon className="size-6 text-[#898989]" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 font-poppins text-[14px] font-medium leading-6 text-[#898989] transition-colors hover:text-ink"
            >
              <span>{sortLabel}</span>
              <SortLinesIcon className="size-6 text-[#898989]" />
            </button>
            {sortOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close sorting menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setSortOpen(false)}
                />
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-[10px] border border-[#d6d6d6] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {shopSortOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={sort === option.value}
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                          setPage(1);
                        }}
                        className={`block w-full px-4 py-2 text-left font-poppins text-[14px] leading-6 transition-colors hover:bg-thumb hover:text-salmon ${
                          sort === option.value
                            ? "font-semibold text-ink"
                            : "text-body"
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#898989]">
          {viewOptions.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`flex size-8 items-center justify-center transition-colors ${
                view === mode ? "text-salmon" : "hover:text-ink"
              }`}
            >
              <Icon className="size-7" />
            </button>
          ))}
        </div>
      </div>

      <p
        className="mb-6 text-right font-poppins text-[14px] leading-6 text-body"
        role="status"
      >
        Showing {from}–{to} of {filtered.length} results
      </p>

      <div
        className={`grid items-start gap-x-[30px] gap-y-10 ${
          sidebarOpen ? "lg:grid-cols-[338fr_1072fr]" : ""
        }`}
      >
        {sidebarOpen ? (
          <aside aria-label="Shop filters" className="min-w-0">
            <SidebarWidget title="Categories">
              <ul>
                {shopCategories.map((cat) => {
                  const active = category === cat.slug;
                  return (
                    <li key={cat.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategory((prev) =>
                            prev === cat.slug ? null : cat.slug,
                          );
                          setPage(1);
                        }}
                        className={`flex w-full items-baseline gap-1 border-b border-[#d6d6d6] py-3 text-left font-poppins text-[14px] leading-6 last:border-b-0 ${
                          active
                            ? "font-semibold text-ink"
                            : "text-body hover:text-salmon"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-body">({cat.count})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SidebarWidget>

            <SidebarWidget title="Filter by price">
              <div className="relative mt-1 h-[6px] rounded-full bg-[#e8e8e8]">
                <div
                  className="absolute top-0 h-full rounded-full bg-salmon-soft"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0, rightPct - leftPct)}%`,
                  }}
                />
                <input
                  type="range"
                  min={SHOP_PRICE_MIN}
                  max={SHOP_PRICE_MAX}
                  value={priceMin}
                  aria-label="Minimum price"
                  onChange={(e) => {
                    const next = Math.min(Number(e.target.value), priceMax - 1);
                    setPriceMin(next);
                  }}
                  className="pointer-events-none absolute inset-0 z-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-salmon-soft [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-salmon-soft"
                />
                <input
                  type="range"
                  min={SHOP_PRICE_MIN}
                  max={SHOP_PRICE_MAX}
                  value={priceMax}
                  aria-label="Maximum price"
                  onChange={(e) => {
                    const next = Math.max(Number(e.target.value), priceMin + 1);
                    setPriceMax(next);
                  }}
                  className="pointer-events-none absolute inset-0 z-20 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-salmon-soft [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-salmon-soft"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-poppins text-[14px] leading-6 text-body">
                  {formatPkr(priceMin)} — {formatPkr(priceMax)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedMin(priceMin);
                    setAppliedMax(priceMax);
                    setPage(1);
                  }}
                  className="rounded-[40px] bg-gradient-to-b from-salmon-soft to-[#f7baad] px-[25px] py-[10px] font-poppins text-[16px] font-semibold uppercase leading-6 text-white transition-opacity hover:opacity-90"
                >
                  Filter
                </button>
              </div>
            </SidebarWidget>

            <SidebarWidget title="Rating" className="min-h-[48px]" />

            <SidebarWidget title="Brand" className="min-h-[48px] pb-[10px]" />

            <SidebarWidget title="Latest products">
              <ul className="space-y-5">
                {latestProducts.map((product) => (
                  <li key={product.slug} className="flex gap-3">
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative size-[70px] shrink-0 overflow-hidden rounded-[10px] bg-thumb"
                    >
                      <Image
                        src={product.image}
                        alt=""
                        width={200}
                        height={200}
                        className="size-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0">
                      <h4 className="font-poppins text-[14px] font-medium capitalize leading-5 text-[#111]">
                        <Link
                          href={`/product/${product.slug}`}
                          className="line-clamp-2 transition-colors hover:text-salmon"
                        >
                          {product.title}
                        </Link>
                      </h4>
                      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[13px] leading-5">
                        <del className="text-body">{product.oldPrice}</del>
                        <span className="font-medium text-salmon-soft">
                          {product.price}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </SidebarWidget>
          </aside>
        ) : null}

        <div className="min-w-0">
          {pageItems.length > 0 ? (
            <div className={gridClass}>
              {pageItems.map((product) => (
                <ShopCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center font-poppins text-[16px] text-body">
              No products were found matching your selection.
            </p>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Product pagination"
              className="mt-10 flex items-center justify-center gap-2"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex size-[46px] items-center justify-center rounded-[5px] font-poppins text-[16px] font-medium leading-none transition-colors ${
                      pageNum === currentPage
                        ? "bg-salmon-soft text-white"
                        : "bg-transparent text-ink hover:bg-thumb"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
              {currentPage < totalPages ? (
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex size-[46px] items-center justify-center rounded-[5px] text-ink transition-colors hover:bg-thumb"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
