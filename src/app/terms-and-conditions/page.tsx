import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { LegalPage } from "@/components/site/legal-page";
import { termsAndConditions } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Terms & Conditions – Babies Bloomers",
  description: termsAndConditions.description,
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Header />
      <main>
        <LegalPage page={termsAndConditions} />
      </main>
      <Footer />
    </>
  );
}
