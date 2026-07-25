import type { Metadata } from "next";
import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";

export const metadata: Metadata = {
  title: "Contact – Babies Bloomers",
  description:
    "Get in touch with Babies Bloomers — store locations, phone, email, and a message form.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Contact"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
        />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
