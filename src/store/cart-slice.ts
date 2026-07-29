import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  /** Unique line key: `${slug}::${size}` */
  id: string;
  slug: string;
  title: string;
  image: string;
  price: string;
  priceValue: number;
  size: string;
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  /** False until localStorage has been read (avoids badge hydration mismatch). */
  ready: boolean;
};

const initialState: CartState = {
  items: [],
  drawerOpen: false,
  ready: false,
};

export function cartLineId(slug: string, size: string) {
  return `${slug}::${size}`;
}

export function selectCartItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.ready = true;
    },
    setCartReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
    /** Full replace — used for cross-tab / storage sync. */
    replaceCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addCartItem(state, action: PayloadAction<AddCartItemInput>) {
      const item = action.payload;
      const id = cartLineId(item.slug, item.size);
      const qty = item.quantity ?? 1;
      const existing = state.items.find((p) => p.id === id);
      if (existing) {
        existing.quantity += qty;
      } else {
        state.items.push({ ...item, id, quantity: qty });
      }
      state.drawerOpen = true;
    },
    removeCartItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) {
      const { id, quantity } = action.payload;
      if (quantity < 1) {
        state.items = state.items.filter((p) => p.id !== id);
        return;
      }
      const line = state.items.find((p) => p.id === id);
      if (line) line.quantity = quantity;
    },
    clearCart(state) {
      state.items = [];
    },
    openCartDrawer(state) {
      state.drawerOpen = true;
    },
    closeCartDrawer(state) {
      state.drawerOpen = false;
    },
  },
});

export const {
  hydrateCart,
  setCartReady,
  replaceCartItems,
  addCartItem,
  removeCartItem,
  updateCartQuantity,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
