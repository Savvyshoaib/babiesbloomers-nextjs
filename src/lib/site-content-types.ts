import { testimonials as staticTestimonials } from "@/lib/site-data";

export type SiteBranding = {
  logo: string;
  footerLogo: string;
  favicon: string;
};

export type SiteHeroSlide = {
  id: string;
  image: string;
  href: string;
  alt: string;
};

export type SiteHeroEffect = "fade" | "slide";

export type SiteHero = {
  /** Legacy single-banner fields (kept for backward compatibility). */
  image: string;
  href: string;
  alt: string;
  slides: SiteHeroSlide[];
  autoplay: boolean;
  intervalMs: number;
  effect: SiteHeroEffect;
  showDots: boolean;
  showArrows: boolean;
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

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "pinterest"
  | "twitter"
  | "youtube"
  | "whatsapp";

export const SOCIAL_NETWORKS: { value: SocialNetwork; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "pinterest", label: "Pinterest" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
];

export type SiteSocialLink = {
  id: string;
  network: SocialNetwork;
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

export type SiteDreamwear = {
  backgroundImage: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  phone: string;
  /** Optional custom link (tel:, https://wa.me/…). Empty = auto tel: from phone. */
  phoneHref: string;
  phoneLabel: string;
};

export type SiteContact = {
  mapEnabled: boolean;
  mapEmbedUrl: string;
  mapTitle: string;
  locations: string[];
  phone: string;
  phoneHref: string;
  hotline: string;
  hotlineHref: string;
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
  dreamwear: SiteDreamwear;
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
    slides: [
      {
        id: "hero-1",
        image: "/images/banner.jpg",
        href: "/shop",
        alt: "Flat 50% off on the entire website at Babies Bloomers",
      },
    ],
    autoplay: true,
    intervalMs: 5000,
    effect: "fade",
    showDots: true,
    showArrows: true,
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
    {
      id: "facebook",
      network: "facebook",
      href: "https://facebook.com",
      enabled: true,
    },
    {
      id: "instagram",
      network: "instagram",
      href: "https://instagram.com",
      enabled: true,
    },
    {
      id: "pinterest",
      network: "pinterest",
      href: "https://pinterest.com",
      enabled: true,
    },
    {
      id: "twitter",
      network: "twitter",
      href: "https://twitter.com",
      enabled: true,
    },
  ],
  testimonials: staticTestimonials.map((t) => ({ ...t })),
  vision: {
    title: "Our Vision",
    body: "At Babies Bloomers, our vision is to create a world where every baby is wrapped in comfort, quality, and love. We are dedicated to designing thoughtfully crafted baby essentials that combine premium fabrics, timeless style, and everyday practicality, giving parents confidence while ensuring little ones feel safe, cozy, and happy through every precious milestone.",
  },
  dreamwear: {
    backgroundImage: "/images/Babies Bloomers Dreamwear.jpg",
    image: "/images/sample-image-2.png",
    imageAlt:
      "Smiling girl resting her head on her hands in Babies Bloomers sleepwear",
    title: "Babies Bloomers Dreamwear",
    description:
      "Wrap your little ones in cloud-like comfort with the Babies Bloomers sleepwear collection. Thoughtfully crafted with ultra-soft fabrics for peaceful nights, cozy mornings, and all-day comfort.",
    features: [
      "Ultra Soft",
      "Gentle Comfort",
      "Breathable Fabric",
      "All-Day Cozy",
    ],
    ctaLabel: "Explore",
    ctaHref: "/contact",
    phone: "+92 347 8563067",
    phoneHref: "tel:+923478563067",
    phoneLabel: "Online 24/7",
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
    phoneHref: "",
    hotline: "+1-541-651-4228",
    hotlineHref: "",
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
    hero: mergeHero(partial.hero),
    promoBanners:
      partial.promoBanners?.length === 2
        ? partial.promoBanners
        : DEFAULT_SITE_CONTENT.promoBanners,
    newArrivalsBanner: {
      ...DEFAULT_SITE_CONTENT.newArrivalsBanner,
      ...partial.newArrivalsBanner,
    },
    socialLinks: mergeSocialLinks(partial.socialLinks),
    testimonials:
      partial.testimonials?.length
        ? partial.testimonials
        : DEFAULT_SITE_CONTENT.testimonials,
    vision: { ...DEFAULT_SITE_CONTENT.vision, ...partial.vision },
    dreamwear: mergeDreamwear(partial.dreamwear),
    contact: {
      ...DEFAULT_SITE_CONTENT.contact,
      ...contactPartial,
      mapEnabled: Boolean(
        contactPartial.mapEnabled ?? DEFAULT_SITE_CONTENT.contact.mapEnabled,
      ),
      mapEmbedUrl: extractMapEmbedUrl(
        contactPartial.mapEmbedUrl ?? DEFAULT_SITE_CONTENT.contact.mapEmbedUrl,
      ),
      phoneHref: String(
        contactPartial.phoneHref ?? DEFAULT_SITE_CONTENT.contact.phoneHref,
      ),
      hotlineHref: String(
        contactPartial.hotlineHref ?? DEFAULT_SITE_CONTENT.contact.hotlineHref,
      ),
      locations,
    },
  };
}

function mergeHero(partial: Partial<SiteHero> | null | undefined): SiteHero {
  const base = DEFAULT_SITE_CONTENT.hero;
  if (!partial) return base;

  const image = String(partial.image ?? base.image);
  const href = String(partial.href ?? base.href);
  const alt = String(partial.alt ?? base.alt);

  let slides: SiteHeroSlide[] = [];
  if (Array.isArray(partial.slides) && partial.slides.length > 0) {
    slides = partial.slides
      .map((row, index) => {
        const r = row as Partial<SiteHeroSlide>;
        return {
          id:
            String(r.id ?? "").trim() ||
            `hero-${index}-${Math.random().toString(36).slice(2, 6)}`,
          image: String(r.image ?? image).trim() || image,
          href: String(r.href ?? href).trim() || href,
          alt: String(r.alt ?? alt).trim() || alt,
        };
      })
      .filter((s) => s.image)
      .slice(0, 10);
  }

  if (slides.length === 0) {
    slides = [{ id: "hero-1", image, href, alt }];
  }

  const intervalMs = Number(partial.intervalMs ?? base.intervalMs);
  const effect =
    partial.effect === "slide" || partial.effect === "fade"
      ? partial.effect
      : base.effect;

  return {
    image: slides[0]!.image,
    href: slides[0]!.href,
    alt: slides[0]!.alt,
    slides,
    autoplay: Boolean(partial.autoplay ?? base.autoplay),
    intervalMs:
      Number.isFinite(intervalMs) && intervalMs >= 2000
        ? Math.min(20000, intervalMs)
        : base.intervalMs,
    effect,
    showDots: Boolean(partial.showDots ?? base.showDots),
    showArrows: Boolean(partial.showArrows ?? base.showArrows),
  };
}

const SOCIAL_NETWORK_VALUES = SOCIAL_NETWORKS.map((n) => n.value);

function isSocialNetwork(value: string): value is SocialNetwork {
  return (SOCIAL_NETWORK_VALUES as string[]).includes(value);
}

function mergeSocialLinks(
  partial: SiteSocialLink[] | Partial<SiteSocialLink>[] | null | undefined,
): SiteSocialLink[] {
  if (!Array.isArray(partial) || partial.length === 0) {
    return DEFAULT_SITE_CONTENT.socialLinks;
  }

  return partial
    .map((row, index) => {
      const networkRaw = String(row.network ?? "facebook");
      const network = isSocialNetwork(networkRaw) ? networkRaw : "facebook";
      const id =
        String(row.id ?? "").trim() ||
        `${network}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      return {
        id,
        network,
        href: String(row.href ?? "").trim(),
        enabled: Boolean(row.enabled ?? true),
      };
    })
    .slice(0, 12);
}

/** Build a clickable phone URL from display number and optional custom link. */
export function resolvePhoneHref(
  phone: string,
  phoneHref?: string | null,
): string {
  const custom = String(phoneHref ?? "").trim();
  if (custom) return custom;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

function mergeDreamwear(
  partial: Partial<SiteDreamwear> | null | undefined,
): SiteDreamwear {
  const base = DEFAULT_SITE_CONTENT.dreamwear;
  if (!partial) return base;
  const features = Array.isArray(partial.features)
    ? partial.features
        .map((f) => String(f ?? "").trim())
        .filter(Boolean)
    : base.features;
  return {
    ...base,
    ...partial,
    features: features.length > 0 ? features.slice(0, 8) : base.features,
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
