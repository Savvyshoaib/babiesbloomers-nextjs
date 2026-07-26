import { testimonials as staticTestimonials } from "@/lib/site-data";

export type SiteBranding = {
  logo: string;
  footerLogo: string;
  favicon: string;
};

export type SiteHero = {
  image: string;
  href: string;
  alt: string;
};

export type SitePromoBanner = {
  href: string;
  src: string;
  alt: string;
  label: string;
};

export type SiteNewArrivalsBanner = {
  image: string;
  alt: string;
};

export type SiteSocialLink = {
  network: "facebook" | "instagram" | "pinterest" | "twitter";
  href: string;
  enabled: boolean;
};

export type SiteTestimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export type SiteVision = {
  title: string;
  body: string;
};

export type SiteContact = {
  mapEnabled: boolean;
  mapEmbedUrl: string;
  mapTitle: string;
  locations: string[];
  phone: string;
  hotline: string;
  email: string;
  hours: string;
};

export type SiteContent = {
  branding: SiteBranding;
  hero: SiteHero;
  promoBanners: SitePromoBanner[];
  newArrivalsBanner: SiteNewArrivalsBanner;
  socialLinks: SiteSocialLink[];
  testimonials: SiteTestimonial[];
  vision: SiteVision;
  contact: SiteContact;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  branding: {
    logo: "/images/logo.png",
    footerLogo: "/images/footer-logo.png",
    favicon: "/favicon.ico",
  },
  hero: {
    image: "/images/banner.jpg",
    href: "/shop",
    alt: "Flat 50% off on the entire website at Babies Bloomers",
  },
  promoBanners: [
    {
      label: "Kids Wear",
      href: "/shop",
      src: "/images/small-banner-1.jpg",
      alt: "Kids wear sale — visit our shop and get up to 35% off",
    },
    {
      label: "Summer Collection",
      href: "/shop",
      src: "/images/small-banner-2.jpg",
      alt: "New summer collection — good style for kids",
    },
  ],
  newArrivalsBanner: {
    image: "/images/sample-image.jpg",
    alt: "Two children wearing the new arrivals collection",
  },
  socialLinks: [
    { network: "facebook", href: "https://facebook.com", enabled: true },
    { network: "instagram", href: "https://instagram.com", enabled: true },
    { network: "pinterest", href: "https://pinterest.com", enabled: true },
    { network: "twitter", href: "https://twitter.com", enabled: true },
  ],
  testimonials: staticTestimonials.map((t) => ({ ...t })),
  vision: {
    title: "Our Vision",
    body: "At Babies Bloomers, our vision is to create a world where every baby is wrapped in comfort, quality, and love. We are dedicated to designing thoughtfully crafted baby essentials that combine premium fabrics, timeless style, and everyday practicality, giving parents confidence while ensuring little ones feel safe, cozy, and happy through every precious milestone.",
  },
  contact: {
    mapEnabled: true,
    mapEmbedUrl:
      "https://maps.google.com/maps?q=London%20Eye%2C%20London%2C%20United%20Kingdom&t=m&z=14&output=embed&iwloc=near",
    mapTitle: "London Eye, London, United Kingdom",
    locations: [
      "Store 1: 25 West 21th Street, Miami FL, US",
      "Store 2: 76 East Houston Street New York City",
      "Store 3: 102 West 16th Street, Miami FL, USA",
    ],
    phone: "+1-541-754-3010",
    hotline: "+1-541-651-4228",
    email: "kidxtore@elysa.com",
    hours: "Monday – Sunday: 8:00 am – 10:00pm",
  },
};

export function mergeSiteContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  if (!partial) return DEFAULT_SITE_CONTENT;
  const contactPartial = (partial.contact ?? {}) as Partial<SiteContact>;
  const locations = Array.isArray(contactPartial.locations)
    ? contactPartial.locations
        .map((line: string) => String(line ?? "").trim())
        .filter(Boolean)
    : DEFAULT_SITE_CONTENT.contact.locations;

  return {
    branding: { ...DEFAULT_SITE_CONTENT.branding, ...partial.branding },
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...partial.hero },
    promoBanners:
      partial.promoBanners?.length === 2
        ? partial.promoBanners
        : DEFAULT_SITE_CONTENT.promoBanners,
    newArrivalsBanner: {
      ...DEFAULT_SITE_CONTENT.newArrivalsBanner,
      ...partial.newArrivalsBanner,
    },
    socialLinks:
      partial.socialLinks?.length
        ? partial.socialLinks
        : DEFAULT_SITE_CONTENT.socialLinks,
    testimonials:
      partial.testimonials?.length
        ? partial.testimonials
        : DEFAULT_SITE_CONTENT.testimonials,
    vision: { ...DEFAULT_SITE_CONTENT.vision, ...partial.vision },
    contact: {
      ...DEFAULT_SITE_CONTENT.contact,
      ...contactPartial,
      mapEnabled: Boolean(
        contactPartial.mapEnabled ?? DEFAULT_SITE_CONTENT.contact.mapEnabled,
      ),
      mapEmbedUrl: extractMapEmbedUrl(
        contactPartial.mapEmbedUrl ?? DEFAULT_SITE_CONTENT.contact.mapEmbedUrl,
      ),
      locations,
    },
  };
}

/**
 * Accepts either a raw Google Maps embed URL or a full `<iframe …>` snippet
 * (as copied from Google Maps → Share → Embed a map) and returns the `src` URL.
 */
export function extractMapEmbedUrl(input: string | null | undefined): string {
  const value = String(input ?? "").trim();
  if (!value) return "";
  if (/<iframe/i.test(value)) {
    const match = value.match(/src\s*=\s*["']([^"']+)["']/i);
    return match?.[1]?.trim() ?? "";
  }
  return value;
}

/** Returns an error message when contact CMS data is invalid. */
export function validateSiteContact(contact: SiteContact): string | null {
  if (contact.mapEnabled) {
    const url = contact.mapEmbedUrl.trim();
    if (!url) return "Map embed URL is required when the map is enabled.";
    if (!isAllowedMapEmbedUrl(url)) {
      return "Map embed URL must be a secure Google Maps embed link (https).";
    }
  } else if (
    contact.mapEmbedUrl.trim() &&
    !isAllowedMapEmbedUrl(contact.mapEmbedUrl.trim())
  ) {
    return "Map embed URL must be a secure Google Maps embed link (https).";
  }

  if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return "Contact email is invalid.";
  }

  if (contact.locations.length === 0) {
    return "Add at least one store location.";
  }

  return null;
}

function isAllowedMapEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "maps.google.com" ||
      host === "www.google.com" ||
      host === "google.com" ||
      host.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}
