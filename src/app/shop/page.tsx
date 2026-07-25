import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { ShopView } from "@/components/site/shop-view";

export const metadata: Metadata = {
  title: "Shop – Babies Bloomers",
  description:
    "Browse Babies Bloomers baby essentials — bodysuits, sleepsuits, tees and more. Flat 50% off on everything.",
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Shop"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Shop" },
          ]}
        />
        <ShopView />
      </main>
      <Footer />
    </>
  );
}
