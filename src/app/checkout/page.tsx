import type { Metadata } from "next";
import { CheckoutView } from "@/components/site/checkout-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";

export const metadata: Metadata = {
  title: "Checkout – Babies Bloomers",
  description: "Secure checkout for Babies Bloomers orders.",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Checkout"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
