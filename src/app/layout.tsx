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
  // Force light UI chrome even when the device is in dark mode
  // (Android Chrome, Samsung Internet, WhatsApp in-app browser).
  colorScheme: "only light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
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
    // Opt out of Android Chrome / WebView "Auto Dark Mode" page inversion.
    other: {
      "color-scheme": "only light",
      "supported-color-schemes": "light",
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
      data-theme="light"
      className={`${fredoka.variable} ${poppins.variable} h-full antialiased`}
      style={{ colorScheme: "only light", backgroundColor: "#ffffff" }}
    >
      <head>
        {/* Earliest possible opt-out of Android Chrome / Samsung Auto Dark. */}
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html{color-scheme:only light!important;background-color:#fff!important}
body{background-color:#fff!important;color:#727272!important}
@media (prefers-color-scheme:dark){
  html,body{color-scheme:only light!important;background-color:#fff!important}
  body{color:#727272!important}
}
`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white"
        style={{ backgroundColor: "#ffffff", colorScheme: "light" }}
      >
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
