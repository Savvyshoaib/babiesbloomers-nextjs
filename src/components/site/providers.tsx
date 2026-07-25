"use client";

import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
