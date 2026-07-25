import type { Metadata } from "next";
import { CartPageView } from "@/components/site/cart-page-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";

export const metadata: Metadata = {
  title: "Cart – Babies Bloomers",
  description: "Review items in your Babies Bloomers shopping cart.",
};

export default function CartPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Cart"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />
        <CartPageView />
      </main>
      <Footer />
    </>
  );
}
