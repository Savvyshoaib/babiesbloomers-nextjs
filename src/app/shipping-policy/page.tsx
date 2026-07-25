import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { LegalPage } from "@/components/site/legal-page";
import { shippingPolicy } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Shipping Policy – Babies Bloomers",
  description: shippingPolicy.description,
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalPage page={shippingPolicy} />
      </main>
      <Footer />
    </>
  );
}
