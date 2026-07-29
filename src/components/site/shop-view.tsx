"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  SHOP_PER_PAGE,
  shopCategories as staticShopCategories,
  shopProducts as staticShopProducts,
  shopSortOptions,
  type ShopSortValue,
} from "@/lib/site-data";
import { toShopProduct, type ShopCardProduct } from "@/lib/catalog-types";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveProducts,
  selectNewArrivals,
} from "@/store/catalog-slice";
import {
  ChevronRightIcon,
  CloseIcon,
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
  products?: ShopCardProduct[];
  source?: "all" | "new-arrivals";
  defaultView?: ViewMode;
  defaultSort?: ShopSortValue;
  perPage?: number;
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
      className={`relative mb-8 rounded-[15px] border border-[#d6d6d6] px-[15px] pb-[24px] pt-[38px] last:mb-0 sm:mb-[50px] sm:pb-[30px] ${className}`}
    >
      <h3 className="absolute left-5 top-[-15px] bg-white px-2.5 font-fredoka text-[20px] font-medium leading-[30px] text-[#111] sm:text-[22px]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function matchesCategory(product: ShopCardProduct, categorySlug: string) {
  const needle = categorySlug.toLowerCase();
  return product.categories.some((c) => c.toLowerCase() === needle);
}

export function ShopView({
  products: productsProp,
  source = "all",
  defaultView = "grid-3",
  defaultSort = "menu_order",
  perPage = SHOP_PER_PAGE,
  showFiveCol = false,
}: ShopViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogProducts = useAppSelector(selectActiveProducts);
  const catalogNewArrivals = useAppSelector(selectNewArrivals);
  const catalogCategories = useAppSelector((s) => s.catalog.categories);
  const catalogLoading = useAppSelector((s) => s.catalog.loading);
  const catalogInitialized = useAppSelector((s) => s.catalog.initialized);

  const products = useMemo(() => {
    if (productsProp) return productsProp;

    const fromCatalog =
      source === "new-arrivals" ? catalogNewArrivals : catalogProducts;

    if (fromCatalog.length > 0) {
      return fromCatalog.map(toShopProduct);
    }

    const fallback =
      source === "new-arrivals"
        ? staticShopProducts.filter((p) => p.badge === "new")
        : staticShopProducts;

    return fallback.map((p) => ({
      ...p,
      averageRating: 0,
      reviewsCount: 0,
    }));
  }, [
    productsProp,
    source,
    catalogProducts,
    catalogNewArrivals,
    catalogInitialized,
    catalogLoading,
  ]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 5000 };
    const values = products.map((p) => p.priceValue);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    return { min, max: max <= min ? min + 1 : max };
  }, [products]);

  const shopCategories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      p.categories.forEach((slug) => {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      });
    });

    if (catalogCategories.length > 0) {
      return catalogCategories
        .filter((c) => c.isActive)
        .map((c) => ({
          slug: c.slug,
          label: c.label,
          count: counts.get(c.slug) ?? c.count ?? 0,
        }));
    }

    return staticShopCategories.map((c) => ({
      ...c,
      count: counts.get(c.slug) ?? c.count,
    }));
  }, [catalogCategories, products]);

  const latestProducts = useMemo(() => products.slice(0, 5), [products]);

  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ShopSortValue>(defaultSort);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<ViewMode>(defaultView);
  const [page, setPage] = useState(1);
  const [priceMin, setPriceMin] = useState(priceBounds.min);
  const [priceMax, setPriceMax] = useState(priceBounds.max);
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(Number.POSITIVE_INFINITY);
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  // Keep category filter in sync with ?category= from mega menu / shared links.
  useEffect(() => {
    const fromUrl = searchParams.get("category")?.trim() || null;
    setCategory(fromUrl);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  function selectCategory(next: string | null) {
    setCategory(next);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("category", next);
    else params.delete("category");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Sync desktop/mobile once; open sidebar by default on desktop only.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Keep price sliders in sync when catalog loads.
  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
    setAppliedMin(0);
    setAppliedMax(Number.POSITIVE_INFINITY);
  }, [priceBounds.min, priceBounds.max]);

  // Lock body scroll when mobile filter drawer is open.
  useEffect(() => {
    if (isDesktop || !sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDesktop, sidebarOpen]);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => p.priceValue >= appliedMin && p.priceValue <= appliedMax,
    );
    if (category) {
      list = list.filter((p) => matchesCategory(p, category));
    }
    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery) ||
          p.slug.toLowerCase().includes(searchQuery) ||
          p.categories.some((c) => c.toLowerCase().includes(searchQuery)),
      );
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
        if (defaultSort === "menu_order") sorted.reverse();
        break;
      case "menu_order":
        if (defaultSort === "date") {
          sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
        break;
      case "popularity":
        sorted.sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
        break;
      case "rating":
        sorted.sort(
          (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [
    appliedMin,
    appliedMax,
    category,
    defaultSort,
    products,
    searchQuery,
    sort,
  ]);

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

  const hasActiveFilters =
    category !== null ||
    appliedMin > 0 ||
    appliedMax < Number.POSITIVE_INFINITY;

  const gridClass =
    view === "list"
      ? "grid grid-cols-1 gap-x-4 gap-y-6 sm:gap-x-[30px] sm:gap-y-[30px]"
      : view === "grid-2"
        ? "grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-[30px] sm:gap-y-[30px]"
        : view === "grid-5"
          ? "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-[20px] sm:gap-y-[30px] md:grid-cols-4 min-[1201px]:grid-cols-5"
          : "grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-[30px] sm:gap-y-[30px] min-[1025px]:grid-cols-3";

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

  function applyPriceFilter() {
    setAppliedMin(priceMin);
    setAppliedMax(priceMax);
    setPage(1);
    if (!isDesktop) setSidebarOpen(false);
  }

  function clearFilters() {
    selectCategory(null);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
    setAppliedMin(0);
    setAppliedMax(Number.POSITIVE_INFINITY);
  }

  const filtersPanel = (
    <>
      <SidebarWidget title="Categories">
        <ul>
          <li>
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`flex w-full cursor-pointer items-baseline gap-1 border-b border-[#d6d6d6] py-3 text-left font-poppins text-[14px] leading-6 ${
                category === null
                  ? "font-semibold text-ink"
                  : "text-body hover:text-salmon"
              }`}
            >
              <span>All categories</span>
              <span className="text-body">({products.length})</span>
            </button>
          </li>
          {shopCategories.map((cat) => {
            const active = category === cat.slug;
            return (
              <li key={cat.slug}>
                <button
                  type="button"
                  onClick={() =>
                    selectCategory(category === cat.slug ? null : cat.slug)
                  }
                  className={`flex w-full cursor-pointer items-baseline gap-1 border-b border-[#d6d6d6] py-3 text-left font-poppins text-[14px] leading-6 last:border-b-0 ${
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
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between font-poppins text-[13px] text-body">
              <span>Min</span>
              <span className="font-medium text-ink">{formatPkr(priceMin)}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              value={priceMin}
              aria-label="Minimum price"
              onChange={(e) => {
                const next = Math.min(Number(e.target.value), priceMax - 1);
                setPriceMin(next);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-salmon-soft [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-salmon-soft [&::-webkit-slider-thumb]:shadow"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between font-poppins text-[13px] text-body">
              <span>Max</span>
              <span className="font-medium text-ink">{formatPkr(priceMax)}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              value={priceMax}
              aria-label="Maximum price"
              onChange={(e) => {
                const next = Math.max(Number(e.target.value), priceMin + 1);
                setPriceMax(next);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8e8] accent-salmon-soft [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-salmon-soft [&::-webkit-slider-thumb]:shadow"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-poppins text-[14px] leading-6 text-body">
            {formatPkr(priceMin)} — {formatPkr(priceMax)}
          </p>
          <button
            type="button"
            onClick={applyPriceFilter}
            className="cursor-pointer rounded-[40px] bg-gradient-to-b from-salmon-soft to-[#f7baad] px-[25px] py-[10px] font-poppins text-[16px] font-semibold uppercase leading-6 text-white transition-opacity hover:opacity-90"
          >
            Filter
          </button>
        </div>
      </SidebarWidget>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearFilters}
          className="mb-6 w-full cursor-pointer rounded-lg border border-[#e0e0e0] py-2.5 font-poppins text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon"
        >
          Clear all filters
        </button>
      ) : null}

      <SidebarWidget title="Latest products">
        <ul className="space-y-5">
          {latestProducts.map((product) => (
            <li key={product.slug} className="flex gap-3">
              <Link
                href={`/product/${product.slug}`}
                className="relative size-[70px] shrink-0 overflow-hidden rounded-[10px] bg-thumb"
                onClick={() => {
                  if (!isDesktop) setSidebarOpen(false);
                }}
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
                    onClick={() => {
                      if (!isDesktop) setSidebarOpen(false);
                    }}
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
    </>
  );

  return (
    <div className="shell pb-[80px] pt-[30px] max-[880px]:pb-[50px]">
      {/* Toolbar */}
      <div className="relative z-30 mb-4 flex min-h-[56px] flex-col gap-3 rounded-[10px] border border-[#d6d6d6] px-3 py-3 sm:mb-[30px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 font-poppins text-[13px] font-medium leading-6 text-[#898989] transition-colors hover:text-ink sm:text-[14px]"
          >
            <FilterLinesIcon className="size-5 shrink-0 text-[#898989] sm:size-6" />
            <span>
              {sidebarOpen
                ? isDesktop
                  ? "Hide Sidebar"
                  : "Hide Filters"
                : isDesktop
                  ? "Show Sidebar"
                  : "Show Filters"}
            </span>
          </button>

          <div className="relative min-w-0 flex-1 sm:flex-none">
            <button
              type="button"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              onClick={() => setSortOpen((v) => !v)}
              className="flex w-full max-w-full cursor-pointer items-center gap-2 font-poppins text-[13px] font-medium leading-6 text-[#898989] transition-colors hover:text-ink sm:w-auto sm:text-[14px]"
            >
              <SortLinesIcon className="size-5 shrink-0 text-[#898989] sm:size-6" />
              <span className="truncate">{sortLabel}</span>
            </button>
            {sortOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close sorting menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setSortOpen(false)}
                />
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,280px)] rounded-[10px] border border-[#d6d6d6] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:min-w-[240px]"
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
                        className={`block w-full cursor-pointer px-4 py-2.5 text-left font-poppins text-[14px] leading-6 transition-colors hover:bg-thumb hover:text-salmon ${
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

        <div className="flex items-center justify-end gap-2 text-[#898989] sm:gap-3">
          {viewOptions.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors sm:size-8 ${
                view === mode
                  ? "bg-[#fff5f2] text-salmon"
                  : "hover:text-ink"
              }`}
            >
              <Icon className="size-6 sm:size-7" />
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {category ? (
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fff5f2] px-3 py-1 font-poppins text-[12px] font-medium text-salmon"
            >
              {shopCategories.find((c) => c.slug === category)?.label ?? category}
              <CloseIcon className="size-3" />
            </button>
          ) : null}
          {appliedMin > 0 || appliedMax < Number.POSITIVE_INFINITY ? (
            <button
              type="button"
              onClick={() => {
                setAppliedMin(0);
                setAppliedMax(Number.POSITIVE_INFINITY);
                setPriceMin(priceBounds.min);
                setPriceMax(priceBounds.max);
                setPage(1);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fff5f2] px-3 py-1 font-poppins text-[12px] font-medium text-salmon"
            >
              {formatPkr(appliedMin || priceBounds.min)} –{" "}
              {formatPkr(
                Number.isFinite(appliedMax) ? appliedMax : priceBounds.max,
              )}
              <CloseIcon className="size-3" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer font-poppins text-[12px] font-medium text-body underline hover:text-salmon"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <p
        className="mb-6 text-left font-poppins text-[13px] leading-6 text-body sm:text-right sm:text-[14px]"
        role="status"
      >
        Showing {from}–{to} of {filtered.length} results
      </p>

      <div
        className={`grid items-start gap-x-[30px] gap-y-10 ${
          sidebarOpen && isDesktop ? "lg:grid-cols-[338fr_1072fr]" : ""
        }`}
      >
        {/* Desktop sidebar */}
        {sidebarOpen && isDesktop ? (
          <aside aria-label="Shop filters" className="hidden min-w-0 lg:block">
            {filtersPanel}
          </aside>
        ) : null}

        {/* Mobile filter drawer */}
        {!isDesktop && sidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              aria-label="Shop filters"
              className="absolute inset-y-0 left-0 flex w-[min(100%,360px)] flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#f0ece8] px-4 py-4">
                <h2 className="font-poppins text-[16px] font-semibold text-ink">
                  Filters
                </h2>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setSidebarOpen(false)}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-thumb"
                >
                  <CloseIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                {filtersPanel}
              </div>
              <div className="border-t border-[#f0ece8] p-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-salmon font-poppins text-[14px] font-semibold text-white hover:bg-salmon-soft"
                >
                  Show {filtered.length} results
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="min-w-0">
          {pageItems.length > 0 ? (
            <div className={gridClass}>
              {pageItems.map((product) => (
                <ShopCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-poppins text-[16px] text-body">
                No products were found matching your selection.
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 cursor-pointer font-poppins text-[14px] font-semibold text-salmon hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Product pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
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
                    className={`flex size-[42px] cursor-pointer items-center justify-center rounded-[5px] font-poppins text-[15px] font-medium leading-none transition-colors sm:size-[46px] sm:text-[16px] ${
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
                  className="flex size-[42px] cursor-pointer items-center justify-center rounded-[5px] text-ink transition-colors hover:bg-thumb sm:size-[46px]"
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
