import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { ShopView } from "@/components/site/shop-view";
import { recentProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Recent Products – Babies Bloomers",
  description:
    "Browse the latest arrivals from Babies Bloomers — fresh baby essentials, just landed.",
};

export default function NewArrivalsPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Recent Products"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Recent Products" },
          ]}
        />
        <ShopView
          products={recentProducts}
          defaultView="grid-5"
          defaultSort="date"
          perPage={10}
          showFiveCol
        />
      </main>
      <Footer />
    </>
  );
}
