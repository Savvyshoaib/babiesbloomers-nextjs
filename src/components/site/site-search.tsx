"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { shopProducts as staticShopProducts } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import { selectActiveProducts } from "@/store/catalog-slice";
import { SearchIcon } from "./icons";

type Suggestion = {
  slug: string;
  title: string;
  image: string;
  price: string;
};

const MAX_SUGGESTIONS = 6;

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query);
}

export function SiteSearch({
  variant = "desktop",
  onNavigate,
  className = "",
  inputClassName = "",
  buttonClassName = "",
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const catalogProducts = useAppSelector(selectActiveProducts);

  const source = useMemo<Suggestion[]>(() => {
    if (catalogProducts.length > 0) {
      return catalogProducts.map((p) => ({
        slug: p.slug,
        title: p.title,
        image: p.image,
        price: p.price,
      }));
    }
    return staticShopProducts.map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.image,
      price: p.price,
    }));
  }, [catalogProducts]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return source
      .filter(
        (p) =>
          matchesQuery(p.title, q) ||
          matchesQuery(p.slug, q) ||
          matchesQuery(p.price, q),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [query, source]);

  useEffect(() => {
    setActiveIndex(-1);
    setOpen(query.trim().length > 0);
  }, [query]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function goToShop(q: string) {
    const trimmed = q.trim();
    const href = trimmed
      ? `/shop?q=${encodeURIComponent(trimmed)}`
      : "/shop";
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function goToProduct(slug: string) {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(`/product/${slug}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex]!.slug);
      return;
    }
    goToShop(query);
  }

  const showPanel = open && query.trim().length > 0;
  const inputId =
    variant === "mobile" ? "mobile-site-search" : "site-search";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={onSubmit}
        className={
          variant === "desktop"
            ? "flex h-[42px] w-full items-center rounded-[20px] border border-dashed border-[#d6d6d6] bg-white"
            : "flex h-10 w-full items-center rounded-[20px] bg-white"
        }
      >
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Enter key to search"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!showPanel) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) =>
                Math.min(i + 1, Math.max(suggestions.length - 1, 0)),
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          className={
            inputClassName ||
            "h-full min-w-0 flex-1 rounded-l-[20px] bg-transparent px-[15px] text-[14px] text-body placeholder:text-body focus:outline-none"
          }
        />
        <button
          type="submit"
          aria-label="Search"
          className={
            buttonClassName ||
            (variant === "desktop"
              ? "flex h-full w-[50px] shrink-0 items-center justify-center rounded-r-[20px] text-[#454545]"
              : "flex size-10 items-center justify-center text-ink")
          }
        >
          <SearchIcon className="size-[18px]" />
        </button>
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className={`absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[#ebe5e0] bg-white shadow-[0_12px_40px_rgba(18,27,40,0.14)] ${
            variant === "mobile" ? "min-w-[240px]" : ""
          }`}
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 font-poppins text-[13px] text-body">
              No products match “{query.trim()}”
            </p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto py-1">
              {suggestions.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <li key={item.slug} role="option" aria-selected={active}>
                    <button
                      type="button"
                      id={`${listId}-option-${index}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToProduct(item.slug)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-[#fff5f2]" : "hover:bg-[#faf9f7]"
                      }`}
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                          unoptimized={item.image.startsWith("http")}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-poppins text-[13px] font-medium text-ink">
                          {item.title}
                        </span>
                        <span className="block font-poppins text-[12px] text-body">
                          {item.price}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={
              query.trim()
                ? `/shop?q=${encodeURIComponent(query.trim())}`
                : "/shop"
            }
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="block border-t border-[#f0ece8] px-4 py-2.5 font-poppins text-[12px] font-semibold text-salmon hover:bg-[#fff5f2]"
          >
            View all results for “{query.trim()}”
          </Link>
        </div>
      ) : null}
    </div>
  );
}
