"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import type { ProductReview } from "@/lib/reviews";
import { clampRating } from "@/lib/reviews";
import { useAppSelector } from "@/store/hooks";
import { CloseIcon, StarIcon } from "./icons";
import { formatReviewDate } from "./review-shared";

const PER_PAGE = 6;

function RedStars({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const filled = Math.round(clampRating(value));
  const starSize =
    size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-[14px]";
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="inline-flex"
          style={{ color: i < filled ? "#e53935" : "#d5d5d5" }}
        >
          <StarIcon className={starSize} />
        </span>
      ))}
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function buildSummary(reviews: ProductReview[]) {
  const total = reviews.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  for (const r of reviews) {
    const rating = Math.max(1, Math.min(5, Math.round(clampRating(r.rating))));
    counts[rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += clampRating(r.rating);
  }
  return {
    total,
    counts,
    average: total > 0 ? sum / total : 0,
    photos: reviews
      .map((r) => r.image_url)
      .filter((u): u is string => Boolean(u?.trim())),
  };
}

function pageWindow(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

function formatCount(n: number) {
  return n.toLocaleString("en-PK");
}

export function AllReviewsModal() {
  const pathname = usePathname();
  const titleId = useId();
  const catalogProducts = useAppSelector((s) => s.catalog.products);
  const cartDrawerOpen = useAppSelector((s) => s.cart.drawerOpen);

  const hidden =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/checkout");

  const hideFloatingChrome =
    pathname === "/cart" || pathname.startsWith("/cart/");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [showTop, setShowTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => tabRef.current?.focus());
  }, []);

  const loadAll = useCallback(
    async (force = false) => {
      if ((!force && loaded) || loading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reviews?scope=all", { cache: "no-store" });
        const json = await res.json();
        if (res.ok && json.success) {
          setReviews((json.data?.reviews as ProductReview[]) ?? []);
          setLoaded(true);
        } else {
          setError("Couldn’t load reviews. Please try again.");
        }
      } catch {
        setError("Couldn’t load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loaded, loading],
  );

  useEffect(() => {
    if (open) void loadAll();
  }, [open, loadAll]);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeModal]);

  const summary = useMemo(() => buildSummary(reviews), [reviews]);
  const totalPages = Math.max(1, Math.ceil(reviews.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageReviews = reviews.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  function productImage(review: ProductReview) {
    const p = catalogProducts.find((x) => x.slug === review.product_slug);
    return p?.image || "/images/logo.png";
  }

  function goToPage(next: number) {
    setPage(next);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (hidden) return null;

  const hideChrome = open || cartDrawerOpen || hideFloatingChrome;
  const showSideTab = !hideChrome && !isMobile;
  const showMobileReviewsFab = !hideChrome && isMobile;
  const showScrollTop = !hideChrome && showTop;
  /** Space reserved for third-party WhatsApp float + safe gap */
  const fabStackBottom = 88;

  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 130,
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    padding: isMobile ? 0 : 16,
  };

  const panelStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 860,
    height: isMobile ? "94vh" : "88vh",
    maxHeight: isMobile ? "94vh" : "88vh",
    overflow: "hidden",
    borderRadius: isMobile ? "20px 20px 0 0" : 16,
    backgroundColor: "#ffffff",
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
  };

  const fabBtnStyle: CSSProperties = {
    display: "flex",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: 9999,
    background: "#f3aa9b",
    color: "#fff",
    boxShadow: "0 6px 20px rgba(243,170,155,0.45)",
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <>
      {showSideTab ? (
        <button
          ref={tabRef}
          type="button"
          onClick={() => {
            setPage(1);
            setOpen(true);
          }}
          aria-label="Open customer reviews"
          style={{
            position: "fixed",
            right: 0,
            top: "50%",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 9px",
            border: 0,
            borderRadius: "6px 0 0 6px",
            background: "#f3aa9b",
            color: "#fff",
            boxShadow: "-2px 4px 14px rgba(243,170,155,0.4)",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "block",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontFamily: "var(--font-poppins)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              userSelect: "none",
              lineHeight: 1.2,
            }}
          >
            ★ Reviews
          </span>
        </button>
      ) : null}

      {!hideChrome && (showScrollTop || showMobileReviewsFab) ? (
        <div
          className="site-fab-stack"
          style={{
            position: "fixed",
            right: 16,
            bottom: fabStackBottom,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {showScrollTop ? (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
              style={fabBtnStyle}
            >
              <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          ) : null}

          {showMobileReviewsFab ? (
            <button
              ref={tabRef}
              type="button"
              onClick={() => {
                setPage(1);
                setOpen(true);
              }}
              aria-label="Open customer reviews"
              style={{
                ...fabBtnStyle,
                fontFamily: "var(--font-poppins)",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div
          style={overlayStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-qa="reviews-modal-v2"
        >
          <button
            type="button"
            aria-label="Close reviews"
            onClick={closeModal}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              border: 0,
              background: "rgba(18, 27, 40, 0.55)",
              cursor: "pointer",
            }}
          />

          <div style={panelStyle}>
            <div
              className="relative shrink-0 border-b border-[#eee]"
              style={{ padding: isMobile ? "16px 16px 12px" : "20px 28px 14px" }}
            >
              <button
                ref={closeRef}
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-ink text-white sm:right-4 sm:top-4"
              >
                <CloseIcon className="size-4" />
              </button>

              <h2
                id={titleId}
                className="pr-12 text-center font-fredoka text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]"
              >
                Customer reviews
              </h2>
            </div>

            <div
              ref={listRef}
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflowX: "hidden",
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                padding: isMobile ? "0 16px 16px" : "0 28px 20px",
              }}
            >
              <div className="grid gap-4 border-b border-[#eee] py-4 sm:grid-cols-[minmax(0,1fr)_minmax(160px,200px)] sm:items-start sm:gap-6">
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <p className="font-fredoka text-[36px] font-semibold leading-none text-ink sm:text-[42px]">
                      {summary.average > 0
                        ? summary.average.toFixed(1)
                        : loaded
                          ? "—"
                          : "…"}
                    </p>
                    <div>
                      <RedStars value={summary.average} size="lg" />
                      <p className="mt-1 font-poppins text-[13px] text-body">
                        {loaded
                          ? `${formatCount(summary.total)} ${summary.total === 1 ? "review" : "reviews"}`
                          : "Loading…"}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                      const count = summary.counts[star];
                      const pct =
                        summary.total > 0
                          ? Math.round((count / summary.total) * 100)
                          : 0;
                      return (
                        <li
                          key={star}
                          className="grid grid-cols-[56px_1fr_32px] items-center gap-2"
                        >
                          <span className="inline-flex items-center gap-1 font-poppins text-[12px] text-body">
                            {star}
                            <span
                              style={{ color: "#e53935" }}
                              className="inline-flex"
                            >
                              <StarIcon className="size-3" />
                            </span>
                          </span>
                          <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
                            <div
                              className="h-full rounded-full bg-[#e53935]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-right font-poppins text-[12px] tabular-nums text-body">
                            {formatCount(count)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {summary.photos.length > 0 ? (
                  <div className="mx-auto grid w-full max-w-[200px] grid-cols-4 gap-1.5 sm:mx-0">
                    {summary.photos.slice(0, 8).map((src, i) => {
                      const more =
                        i === 7 && summary.photos.length > 8
                          ? summary.photos.length - 7
                          : 0;
                      return (
                        <div
                          key={`${src}-${i}`}
                          className="relative aspect-square overflow-hidden rounded-md bg-[#f5f5f5]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="size-full object-cover"
                          />
                          {more > 0 ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink/45 font-poppins text-[13px] font-semibold text-white">
                              +{more}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <p className="mt-3 inline-block border-b-2 border-ink pb-2 font-poppins text-[13px] font-semibold text-ink sm:text-[14px]">
                Product and store reviews ({formatCount(summary.total)})
              </p>

              {loading && !loaded ? (
                <p className="py-10 text-center font-poppins text-[14px] text-body">
                  Loading reviews…
                </p>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="font-poppins text-[14px] text-body">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadAll(true)}
                    className="inline-flex h-10 items-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white"
                  >
                    Try again
                  </button>
                </div>
              ) : pageReviews.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-fredoka text-[18px] font-semibold text-ink">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#eee]">
                  {pageReviews.map((review) => {
                    const name = review.customer_name || "Anonymous";
                    const thumb = productImage(review);
                    const photo = review.image_url?.trim() || null;
                    return (
                      <li key={review.id} className="py-5 sm:py-6">
                        <RedStars value={review.rating} />
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f3aa9b]/25 font-poppins text-[12px] font-semibold text-ink">
                            {initials(name)}
                          </span>
                          <p className="font-poppins text-[14px] font-semibold text-ink">
                            {name}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#d8d8d8] px-2 py-[3px] font-poppins text-[10px] font-medium text-[#555]">
                            Verified
                          </span>
                        </div>
                        <p className="mt-2.5 whitespace-pre-line font-poppins text-[14px] leading-6 text-[#2a2a2a] sm:text-[15px]">
                          {review.review_text}
                        </p>
                        {photo ? (
                          <div className="mt-3 overflow-hidden rounded-lg bg-[#f7f7f7]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt=""
                                className="max-h-28 w-auto max-w-[140px] object-cover sm:max-h-32"
                            />
                          </div>
                        ) : null}
                        {review.created_at ? (
                          <p className="mt-2 font-poppins text-[11px] text-body">
                            {formatReviewDate(review.created_at)}
                          </p>
                        ) : null}
                        <Link
                          href={`/product/${encodeURIComponent(review.product_slug)}`}
                          onClick={closeModal}
                          className="mt-3 flex items-center gap-3 rounded-lg bg-[#fff5f2] px-3 py-2.5"
                        >
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-[#f0e0db]">
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized={thumb.startsWith("http")}
                            />
                          </span>
                          <span className="min-w-0 font-poppins text-[13px] leading-5 text-body">
                            Review for{" "}
                            <span className="font-semibold text-[#2b6cb0] underline">
                              {review.product_title || review.product_slug}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {totalPages > 1 && loaded && !error ? (
              <nav
                aria-label="Reviews pagination"
                className="shrink-0 border-t border-[#eee] bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(Math.max(1, safePage - 1))}
                    className="flex size-9 items-center justify-center rounded-full text-ink disabled:opacity-35"
                  >
                    ‹
                  </button>
                  {pageWindow(safePage, totalPages).map((item, i) =>
                    item === "…" ? (
                      <span key={`e-${i}`} className="px-1 text-body">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        aria-current={item === safePage ? "page" : undefined}
                        onClick={() => goToPage(item)}
                        className={`flex size-9 items-center justify-center rounded-full font-poppins text-[13px] font-semibold ${
                          item === safePage
                            ? "bg-[#e53935] text-white"
                            : "text-ink hover:bg-[#f5f5f5]"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      goToPage(Math.min(totalPages, safePage + 1))
                    }
                    className="flex size-9 items-center justify-center rounded-full text-ink disabled:opacity-35"
                  >
                    ›
                  </button>
                </div>
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
