import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { ShopView } from "@/components/site/shop-view";

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
        <Suspense
          fallback={
            <div className="shell py-16">
              <div className="h-64 animate-pulse rounded-2xl bg-[#f0ece8]" />
            </div>
          }
        >
          <ShopView
            source="new-arrivals"
            defaultView="grid-5"
            defaultSort="date"
            perPage={10}
            showFiveCol
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
