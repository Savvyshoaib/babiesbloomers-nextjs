"use client";

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addCartItem,
  clearCart as clearCartAction,
  closeCartDrawer,
  openCartDrawer,
  removeCartItem,
  selectCartItemCount,
  selectCartSubtotal,
  updateCartQuantity,
  type AddCartItemInput,
  type CartItem,
} from "@/store/cart-slice";

export type { CartItem, AddCartItemInput };

type CartApi = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  drawerOpen: boolean;
  /** False until localStorage has been read (avoids badge hydration mismatch). */
  ready: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

/**
 * Redux-backed cart API — same surface as before so cart / checkout / drawer
 * / header all stay in sync from one store.
 */
export function useCart(): CartApi {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const drawerOpen = useAppSelector((s) => s.cart.drawerOpen);
  const ready = useAppSelector((s) => s.cart.ready);

  const openDrawer = useCallback(() => {
    dispatch(openCartDrawer());
  }, [dispatch]);

  const closeDrawer = useCallback(() => {
    dispatch(closeCartDrawer());
  }, [dispatch]);

  const addItem = useCallback(
    (item: AddCartItemInput) => {
      dispatch(addCartItem(item));
    },
    [dispatch],
  );

  const removeItem = useCallback(
    (id: string) => {
      dispatch(removeCartItem(id));
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(updateCartQuantity({ id, quantity }));
    },
    [dispatch],
  );

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const itemCount = useMemo(() => selectCartItemCount(items), [items]);
  const subtotal = useMemo(() => selectCartSubtotal(items), [items]);

  return {
    items,
    itemCount,
    subtotal,
    drawerOpen,
    ready,
    openDrawer,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
