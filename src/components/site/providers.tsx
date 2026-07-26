"use client";

import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import { SavedProductsProvider } from "@/lib/saved-products-context";
import { ReduxProvider } from "@/components/site/redux-provider";
import { AuthInit } from "@/components/site/auth-init";
import { CatalogInit } from "@/components/site/catalog-init";
import { SiteContentInit } from "@/components/site/site-content-init";
import { AppToaster } from "@/components/site/toaster";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <CartProvider>
        <SavedProductsProvider>
          <AuthInit />
          <CatalogInit />
          <SiteContentInit />
          {children}
          <CartDrawer />
          <AppToaster />
        </SavedProductsProvider>
      </CartProvider>
    </ReduxProvider>
  );
}
