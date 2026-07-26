import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog-types";

type CatalogState = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: CatalogState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  initialized: false,
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setCatalogLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCatalog(
      state,
      action: PayloadAction<{
        products: CatalogProduct[];
        categories: CatalogCategory[];
      }>,
    ) {
      state.products = action.payload.products;
      state.categories = action.payload.categories;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    setCatalogError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
      state.initialized = true;
    },
  },
});

export const { setCatalogLoading, setCatalog, setCatalogError } =
  catalogSlice.actions;

export default catalogSlice.reducer;

export const selectActiveProducts = (state: { catalog: CatalogState }) =>
  state.catalog.products.filter((p) => p.status === "active");

export const selectNewArrivals = (state: { catalog: CatalogState }) => {
  const active = selectActiveProducts(state);
  const tagged = active.filter((p) => p.isNewArrival || p.badge === "new");
  return tagged.length > 0 ? tagged : active.slice(0, 12);
};

export const selectFeaturedProducts = (state: { catalog: CatalogState }) => {
  const active = selectActiveProducts(state);
  return active.slice(0, 10);
};

export const selectLatestProducts =
  (limit: number) => (state: { catalog: CatalogState }) =>
    selectActiveProducts(state).slice(0, limit);

export const selectProductBySlug =
  (slug: string) => (state: { catalog: CatalogState }) =>
    state.catalog.products.find((p) => p.slug === slug);
