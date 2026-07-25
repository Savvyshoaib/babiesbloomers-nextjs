"use client";

import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import { ReduxProvider } from "@/components/site/redux-provider";
import { AuthInit } from "@/components/site/auth-init";
import { AppToaster } from "@/components/site/toaster";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <CartProvider>
        <AuthInit />
        {children}
        <CartDrawer />
        <AppToaster />
      </CartProvider>
    </ReduxProvider>
  );
}
