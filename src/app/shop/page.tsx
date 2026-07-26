import type { Metadata } from "next";
import { Suspense } from "react";
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
        <Suspense
          fallback={
            <div className="shell py-16">
              <div className="h-64 animate-pulse rounded-2xl bg-[#f0ece8]" />
            </div>
          }
        >
          <ShopView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
