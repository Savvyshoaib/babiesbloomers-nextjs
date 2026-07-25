import type { Metadata } from "next";
import { CheckoutView } from "@/components/site/checkout-view";

export const metadata: Metadata = {
  title: "Checkout – Babies Bloomers",
  description: "Secure checkout for Babies Bloomers orders.",
};

export default function CheckoutPage() {
  return (
    <main>
      <CheckoutView />
    </main>
  );
}
