export type CatalogOffer = {
  title: string;
  icon: "truck" | "tag" | "shield" | "return";
};

export type CatalogAdditionalInfo = {
  material?: string;
  care?: string;
  origin?: string;
  [key: string]: string | undefined;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  priceValue: number;
  badge?: string;
  categories: string[];
  tabs: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  status: "active" | "draft" | "archived";
  stock: number;
  productCode: string;
  sizes: string[];
  galleryImages: string[];
  exclusiveOffers: CatalogOffer[];
  description: string;
  additionalInfo: CatalogAdditionalInfo;
  reviewsCount: number;
  averageRating: number;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  count?: number;
};

export const DEFAULT_SIZES = [
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
];

export const DEFAULT_EXCLUSIVE_OFFERS: CatalogOffer[] = [
  { title: "Free shipping orders from $199", icon: "truck" },
  { title: "Membership offers 10%, 15%, 20% off", icon: "tag" },
  { title: "100% safe for kid", icon: "shield" },
  { title: "Returns within 30 days", icon: "return" },
];

export function formatPriceLabel(value: number): string {
  return `₨ ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parsePriceInput(raw: string): number {
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Client-safe subset used by shop cards / filters. */
export type ShopCardProduct = {
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  badge?: string;
  slug: string;
  categories: string[];
  priceValue: number;
  reviewsCount?: number;
  averageRating?: number;
};

export function toShopProduct(p: CatalogProduct): ShopCardProduct {
  return {
    title: p.title,
    image: p.image,
    oldPrice: p.oldPrice,
    price: p.price,
    badge: p.badge,
    slug: p.slug,
    categories: p.categories,
    priceValue: p.priceValue,
    reviewsCount: p.reviewsCount,
    averageRating: p.averageRating,
  };
}
