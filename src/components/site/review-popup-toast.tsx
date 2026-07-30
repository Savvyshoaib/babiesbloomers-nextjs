"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import type { ProductReview } from "@/lib/reviews";
import { clampRating } from "@/lib/reviews";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { CloseIcon, StarIcon } from "./icons";
import { ReviewDetailModal } from "./review-shared";

const HOLD_MS = 3000;
const GAP_MS = 6000;
const FADE_MS = 380;

type Phase = "hidden" | "entering" | "visible" | "leaving";

function truncate(text: string, max = 110) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function PopupStars({ rating }: { rating: number }) {
  const filled = Math.round(clampRating(rating));
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="inline-flex"
          style={
            { color: i < filled ? "#e53935" : "#e0e0e0" } satisfies CSSProperties
          }
        >
          <StarIcon className="size-[14px]" />
        </span>
      ))}
    </div>
  );
}

/**
 * Nest-style bottom-left social-proof toast.
 * Left product photo is required and always rendered via a plain <img>
 * (Next/Image fill inside <button> was collapsing the photo).
 */
export function ReviewPopupToast() {
  const pathname = usePathname();
  const reviews = useAppSelector((s) => s.reviews.homepageReviews);
  const initialized = useAppSelector((s) => s.reviews.initialized);
  const products = useAppSelector((s) => s.catalog.products);
  const { branding } = useAppSelector(selectSiteContent);

  const brandName = "Babies Bloomers";
  const disabled =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/checkout");

  const queue = useMemo(() => {
    const list = reviews.filter(
      (r) => r.status === "approved" && r.review_text.trim().length > 0,
    );
    return [...list].sort((a, b) => {
      const ai = a.image_url ? 0 : 1;
      const bi = b.image_url ? 0 : 1;
      return ai - bi;
    });
  }, [reviews]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(
    null,
  );
  const [imgBroken, setImgBroken] = useState(false);
  const timers = useRef<number[]>([]);
  const queueLenRef = useRef(0);
  const modalOpenRef = useRef(false);

  queueLenRef.current = queue.length;
  modalOpenRef.current = Boolean(selectedReview);

  const current: ProductReview | null =
    queue.length > 0 ? queue[index % queue.length]! : null;

  function resolveImage(review: ProductReview | null) {
    if (!review) return branding.logo || "/images/logo.png";
    const fromReview = review.image_url?.trim();
    if (fromReview) return fromReview;
    const product = products.find((p) => p.slug === review.product_slug);
    return (
      product?.image ||
      product?.galleryImages?.[0] ||
      branding.logo ||
      "/images/logo.png"
    );
  }

  const imageSrc = resolveImage(current);
  const displaySrc = imgBroken
    ? branding.logo || "/images/logo.png"
    : imageSrc;

  useEffect(() => {
    setImgBroken(false);
  }, [imageSrc, index]);

  const modalReview = useMemo(() => {
    if (!selectedReview) return null;
    const img = resolveImage(selectedReview);
    if (selectedReview.image_url === img) return selectedReview;
    return { ...selectedReview, image_url: img };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReview, products, branding.logo]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function advanceIndex() {
    const len = queueLenRef.current;
    if (len === 0) return;
    setIndex((i) => (i + 1) % len);
  }

  function startShow() {
    if (queueLenRef.current === 0 || modalOpenRef.current) return;
    setPhase("entering");
    schedule(() => setPhase("visible"), 30);
    schedule(() => {
      if (modalOpenRef.current) return;
      setPhase("leaving");
    }, HOLD_MS);
    schedule(() => {
      if (modalOpenRef.current) return;
      setPhase("hidden");
      advanceIndex();
      schedule(() => startShow(), GAP_MS);
    }, HOLD_MS + FADE_MS);
  }

  function handleDismissToast() {
    clearTimers();
    setPhase("leaving");
    schedule(() => {
      setPhase("hidden");
      advanceIndex();
      schedule(() => startShow(), GAP_MS);
    }, FADE_MS);
  }

  function handleOpenModal() {
    if (!current) return;
    clearTimers();
    setPhase("hidden");
    setSelectedReview(current);
  }

  function handleCloseModal() {
    setSelectedReview(null);
    clearTimers();
    advanceIndex();
    schedule(() => startShow(), GAP_MS);
  }

  useEffect(() => {
    clearTimers();
    setPhase("hidden");
    if (disabled || !initialized || queue.length === 0) return;
    if (selectedReview) return;

    schedule(() => startShow(), 1200);
    return clearTimers;
  }, [disabled, initialized, queue.length, pathname, selectedReview]);

  const showToast =
    !disabled && current && phase !== "hidden" && !selectedReview;
  const onScreen = phase === "visible";
  const fadingOut = phase === "leaving";

  return (
    <>
      {showToast ? (
        <div
          style={{
            position: "fixed",
            left: 16,
            bottom: 28,
            zIndex: 100,
            width: 320,
            maxWidth: "calc(100vw - 2rem)",
            pointerEvents: "none",
          }}
          aria-live="polite"
        >
          <div
            className={`relative transition-[transform,opacity] duration-[380ms] ease-out motion-reduce:transition-none ${
              fadingOut
                ? "translate-x-0 opacity-0"
                : onScreen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
            }`}
            style={{ pointerEvents: "auto" }}
            role="status"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleOpenModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenModal();
                }
              }}
              aria-label={`Open review for ${current.product_title || "product"}`}
              style={{
                display: "flex",
                width: "100%",
                overflow: "hidden",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 10px 28px rgba(18,27,40,0.18)",
                border: "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* Product photo — plain img so it never collapses */}
              <div
                style={{
                  width: 104,
                  minWidth: 104,
                  height: 112,
                  flexShrink: 0,
                  background: "#f0f0f0",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displaySrc}
                  alt={current.product_title || "Product"}
                  width={104}
                  height={112}
                  onError={() => setImgBroken(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 36px 10px 12px",
                }}
              >
                <PopupStars rating={current.rating} />
                <p
                  className="line-clamp-3 font-poppins"
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    lineHeight: "17px",
                    color: "#333",
                  }}
                >
                  {truncate(current.review_text)}
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    borderTop: "1px solid #ececec",
                    paddingTop: 6,
                  }}
                >
                  <p
                    className="font-poppins"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {brandName}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissToast();
              }}
              aria-label="Dismiss review"
              className="absolute -right-2 -top-2 z-10 flex size-7 items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-colors hover:bg-[#f7f7f7]"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <ReviewDetailModal review={modalReview} onClose={handleCloseModal} />
    </>
  );
}
