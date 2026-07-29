"use client";

import { CartDrawer } from "@/components/site/cart-drawer";
import { CartInit } from "@/components/site/cart-init";
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
      <SavedProductsProvider>
        <AuthInit />
        <CatalogInit />
        <SiteContentInit />
        <CartInit />
        {children}
        <CartDrawer />
        <AppToaster />
      </SavedProductsProvider>
    </ReduxProvider>
  );
}
