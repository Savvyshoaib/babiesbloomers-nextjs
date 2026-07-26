import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { WishlistView } from "@/components/site/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist – Babies Bloomers",
  description: "Your saved Babies Bloomers products.",
};

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Wishlist"
          crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        />
        <div className="shell py-10 lg:py-[60px]">
          <WishlistView />
        </div>
      </main>
      <Footer />
    </>
  );
}
