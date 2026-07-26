import type { Metadata } from "next";
import { CategoriesPageView } from "@/components/site/categories-page-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";

export const metadata: Metadata = {
  title: "Categories – Babies Bloomers",
  description: "Browse Babies Bloomers products by category.",
};

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Categories"
          crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
        />
        <CategoriesPageView />
      </main>
      <Footer />
    </>
  );
}
