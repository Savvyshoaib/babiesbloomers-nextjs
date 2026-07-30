import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import { Providers } from "@/components/site/providers";
import { SiteScriptsInject } from "@/components/site/site-scripts-inject";
import { FaviconSync } from "@/components/site/favicon-sync";
import { getSiteScripts } from "@/lib/site-scripts";
import { fetchSiteContent } from "@/lib/site-content";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchSiteContent();
  return {
    title: "Babies Bloomers – Made for little moments",
    description:
      "Thoughtfully crafted baby essentials combining premium fabrics, timeless style and everyday practicality. Flat 50% off on everything.",
    icons: {
      icon: content.branding.favicon || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scripts = await getSiteScripts();

  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteScriptsInject html={scripts.header} target="head" />
        <Providers>
          <FaviconSync />
          {children}
        </Providers>
        <SiteScriptsInject html={scripts.footer} target="body" />
      </body>
    </html>
  );
}
