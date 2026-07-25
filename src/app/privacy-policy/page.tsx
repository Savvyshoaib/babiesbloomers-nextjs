import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { LegalPage } from "@/components/site/legal-page";
import { privacyPolicy } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Privacy Policy – Babies Bloomers",
  description: privacyPolicy.description,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalPage page={privacyPolicy} />
      </main>
      <Footer />
    </>
  );
}
