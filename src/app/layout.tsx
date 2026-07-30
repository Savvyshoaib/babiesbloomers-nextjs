import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import { Providers } from "@/components/site/providers";
import { SiteScriptsInject } from "@/components/site/site-scripts-inject";
import { FaviconSync } from "@/components/site/favicon-sync";
import { getSiteScripts } from "@/lib/site-scripts";
import { fetchSiteContent } from "@/lib/site-content";
import "./globals.css";

// Keep root layout/scripts/metadata fresh for every request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    // darkreader-lock: tells Dark Reader extension not to invert this site.
    other: {
      "color-scheme": "only light",
      "supported-color-schemes": "light",
      "darkreader-lock": "true",
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
        {/* Dark Reader extension: official lock — keeps storefront light. */}
        <meta name="darkreader-lock" />
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
        {/* Re-assert Dark Reader lock if the extension injects before hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!document.querySelector('meta[name="darkreader-lock"]')){var m=document.createElement('meta');m.name='darkreader-lock';document.head.appendChild(m);}}catch(e){}})();`,
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
