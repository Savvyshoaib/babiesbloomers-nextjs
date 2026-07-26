import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { CompareView } from "@/components/site/compare-view";

export const metadata: Metadata = {
  title: "Compare – Babies Bloomers",
  description: "Compare Babies Bloomers products side by side.",
};

export default function ComparePage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Compare"
          crumbs={[{ label: "Home", href: "/" }, { label: "Compare" }]}
        />
        <div className="shell py-10 lg:py-[60px]">
          <CompareView />
        </div>
      </main>
      <Footer />
    </>
  );
}
