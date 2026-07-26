import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_EXCLUSIVE_OFFERS,
  DEFAULT_SIZES,
  formatPriceLabel,
  toShopProduct,
  type CatalogAdditionalInfo,
  type CatalogCategory,
  type CatalogOffer,
  type CatalogProduct,
} from "@/lib/catalog-types";
import {
  shopCategories,
  shopProducts,
  type ShopProduct,
} from "@/lib/site-data";

export { toShopProduct, formatPriceLabel };

type DbProduct = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: string;
  old_price: string | null;
  price_value: number;
  badge: string | null;
  categories: string[] | null;
  tabs: string[] | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  status: "active" | "draft" | "archived";
  stock: number;
  product_code?: string | null;
  sizes?: string[] | null;
  gallery_images?: string[] | null;
  exclusive_offers?: CatalogOffer[] | null;
  description?: string | null;
  additional_info?: CatalogAdditionalInfo | null;
  reviews_count?: number | null;
};

export function mapDbProduct(row: DbProduct): CatalogProduct {
  const image = row.image || "/images/products/placeholder.jpg";
  const gallery = (row.gallery_images ?? []).filter(Boolean);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    image,
    oldPrice: row.old_price || "",
    price: row.price,
    priceValue: Number(row.price_value) || 0,
    badge: row.badge || undefined,
    categories: row.categories ?? [],
    tabs: row.tabs ?? [],
    isFeatured: Boolean(row.is_featured),
    isNewArrival: Boolean(row.is_new_arrival),
    status: row.status,
    stock: row.stock ?? 0,
    productCode: row.product_code || row.slug.slice(0, 8).toUpperCase(),
    sizes: row.sizes?.length ? row.sizes : [...DEFAULT_SIZES],
    galleryImages: gallery.length ? gallery : [image, image, image, image],
    exclusiveOffers:
      row.exclusive_offers && row.exclusive_offers.length > 0
        ? row.exclusive_offers
        : DEFAULT_EXCLUSIVE_OFFERS,
    description: row.description || "",
    additionalInfo: row.additional_info || {
      material: "Premium cotton blend",
      care: "Machine wash gentle, tumble dry low",
      origin: "Pakistan",
    },
    reviewsCount: row.reviews_count ?? 0,
  };
}

function mapStaticProduct(p: ShopProduct, index: number): CatalogProduct {
  return {
    id: `static-${p.slug}`,
    slug: p.slug,
    title: p.title,
    image: p.image,
    oldPrice: p.oldPrice,
    price: p.price,
    priceValue: p.priceValue,
    badge: p.badge,
    categories: p.categories,
    tabs: [],
    isFeatured: index < 6,
    isNewArrival: p.badge === "new",
    status: "active",
    stock: 100,
    productCode: p.slug.slice(0, 8).toUpperCase(),
    sizes: [...DEFAULT_SIZES],
    galleryImages: [p.image, p.image, p.image, p.image],
    exclusiveOffers: DEFAULT_EXCLUSIVE_OFFERS,
    description: "",
    additionalInfo: {
      material: "Premium cotton blend",
      care: "Machine wash gentle, tumble dry low",
      origin: "Pakistan",
    },
    reviewsCount: 0,
  };
}

export async function fetchCatalogProducts(opts?: {
  includeDrafts?: boolean;
}): Promise<CatalogProduct[]> {
  try {
    const admin = createAdminClient();
    let query = admin.from("products").select("*").order("created_at", {
      ascending: false,
    });
    if (!opts?.includeDrafts) {
      query = query.eq("status", "active");
    }
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      return (data as DbProduct[]).map(mapDbProduct);
    }
  } catch (err) {
    console.error("[catalog] DB fetch failed, using static fallback", err);
  }

  return shopProducts.map(mapStaticProduct);
}

export async function fetchCatalogProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    if (data) return mapDbProduct(data as DbProduct);
  } catch (err) {
    console.error("[catalog] product by slug failed", err);
  }

  const staticProduct = shopProducts.find((p) => p.slug === slug);
  return staticProduct ? mapStaticProduct(staticProduct, 0) : null;
}

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const admin = createAdminClient();
    const [{ data: cats }, { data: products }] = await Promise.all([
      admin
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      admin.from("products").select("categories").eq("status", "active"),
    ]);

    if (cats && cats.length > 0) {
      const counts = new Map<string, number>();
      (products ?? []).forEach((p) => {
        (p.categories as string[] | null)?.forEach((slug) => {
          counts.set(slug, (counts.get(slug) ?? 0) + 1);
        });
      });

      return cats.map((c) => ({
        id: c.id,
        slug: c.slug,
        label: c.label,
        sortOrder: c.sort_order,
        isActive: c.is_active,
        count: counts.get(c.slug) ?? 0,
      }));
    }
  } catch (err) {
    console.error("[catalog] categories fetch failed", err);
  }

  return shopCategories.map((c, i) => ({
    id: `static-${c.slug}`,
    slug: c.slug,
    label: c.label,
    sortOrder: i,
    isActive: true,
    count: c.count,
  }));
}
