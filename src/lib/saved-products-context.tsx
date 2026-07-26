"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type SavedProduct = {
  slug: string;
  title: string;
  image: string;
  price: string;
  oldPrice?: string;
  priceValue?: number;
};

type SavedProductsValue = {
  wishlist: SavedProduct[];
  compare: SavedProduct[];
  ready: boolean;
  wishlistCount: number;
  compareCount: number;
  isWishlisted: (slug: string) => boolean;
  isCompared: (slug: string) => boolean;
  toggleWishlist: (item: SavedProduct) => void;
  toggleCompare: (item: SavedProduct) => void;
  removeWishlist: (slug: string) => void;
  removeCompare: (slug: string) => void;
  clearWishlist: () => void;
  clearCompare: () => void;
};

const SavedProductsContext = createContext<SavedProductsValue | null>(null);

const WISHLIST_KEY = "babies-bloomers-wishlist";
const COMPARE_KEY = "babies-bloomers-compare";
const COMPARE_LIMIT = 4;

function readStore(key: string): SavedProduct[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedProduct[];
    return Array.isArray(parsed) ? parsed.filter((p) => p && p.slug) : [];
  } catch {
    return [];
  }
}

export function SavedProductsProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<SavedProduct[]>([]);
  const [compare, setCompare] = useState<SavedProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const allowPersist = useRef(false);

  useEffect(() => {
    setWishlist(readStore(WISHLIST_KEY));
    setCompare(readStore(COMPARE_KEY));
    allowPersist.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !allowPersist.current) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore quota errors */
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated || !allowPersist.current) return;
    try {
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(compare));
    } catch {
      /* ignore quota errors */
    }
  }, [compare, hydrated]);

  const isWishlisted = useCallback(
    (slug: string) => wishlist.some((p) => p.slug === slug),
    [wishlist],
  );

  const isCompared = useCallback(
    (slug: string) => compare.some((p) => p.slug === slug),
    [compare],
  );

  const toggleWishlist = useCallback((item: SavedProduct) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.slug === item.slug)) {
        toast.success("Removed from wishlist");
        return prev.filter((p) => p.slug !== item.slug);
      }
      toast.success("Added to wishlist");
      return [item, ...prev];
    });
  }, []);

  const toggleCompare = useCallback((item: SavedProduct) => {
    setCompare((prev) => {
      if (prev.some((p) => p.slug === item.slug)) {
        toast.success("Removed from compare");
        return prev.filter((p) => p.slug !== item.slug);
      }
      if (prev.length >= COMPARE_LIMIT) {
        toast.error(`You can compare up to ${COMPARE_LIMIT} products`);
        return prev;
      }
      toast.success("Added to compare");
      return [...prev, item];
    });
  }, []);

  const removeWishlist = useCallback((slug: string) => {
    setWishlist((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const removeCompare = useCallback((slug: string) => {
    setCompare((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);
  const clearCompare = useCallback(() => setCompare([]), []);

  const value = useMemo<SavedProductsValue>(
    () => ({
      wishlist,
      compare,
      ready: hydrated,
      wishlistCount: wishlist.length,
      compareCount: compare.length,
      isWishlisted,
      isCompared,
      toggleWishlist,
      toggleCompare,
      removeWishlist,
      removeCompare,
      clearWishlist,
      clearCompare,
    }),
    [
      wishlist,
      compare,
      hydrated,
      isWishlisted,
      isCompared,
      toggleWishlist,
      toggleCompare,
      removeWishlist,
      removeCompare,
      clearWishlist,
      clearCompare,
    ],
  );

  return (
    <SavedProductsContext.Provider value={value}>
      {children}
    </SavedProductsContext.Provider>
  );
}

export function useSavedProducts() {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) {
    throw new Error(
      "useSavedProducts must be used within SavedProductsProvider",
    );
  }
  return ctx;
}
