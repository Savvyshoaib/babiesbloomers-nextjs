"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  hydrateCart,
  replaceCartItems,
  setCartReady,
  type CartItem,
} from "@/store/cart-slice";

export const CART_STORAGE_KEY = "babies-bloomers-cart";

function readCartStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCartStorage(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Hydrates Redux cart from localStorage, persists changes, and keeps
 * other tabs in sync via the `storage` event.
 */
export function CartInit() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const ready = useAppSelector((s) => s.cart.ready);
  const allowPersist = useRef(false);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    dispatch(hydrateCart(readCartStorage()));
    allowPersist.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!ready || !allowPersist.current) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    writeCartStorage(items);
  }, [items, ready]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== CART_STORAGE_KEY || e.storageArea !== localStorage) return;
      skipNextPersist.current = true;
      try {
        if (!e.newValue) {
          dispatch(replaceCartItems([]));
          return;
        }
        const parsed = JSON.parse(e.newValue) as CartItem[];
        dispatch(replaceCartItems(Array.isArray(parsed) ? parsed : []));
      } catch {
        dispatch(replaceCartItems([]));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  // Safety: if hydrate somehow never ran, still mark ready so UI unblocks.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!ready) dispatch(setCartReady(true));
    }, 2500);
    return () => window.clearTimeout(t);
  }, [dispatch, ready]);

  return null;
}
