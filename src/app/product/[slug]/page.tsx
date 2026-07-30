import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { ProductDetail } from "@/components/site/product-detail";
import {
  fetchCatalogCategories,
  fetchCatalogProductBySlug,
} from "@/lib/catalog";
import { getProductApprovedReviews } from "@/app/actions/reviews";

type Props = { params: Promise<{ slug: string }> };

// Always fetch latest product data (no static HTML stale cache).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchCatalogProductBySlug(slug);
  if (!product) return { title: "Product – Babies Bloomers" };
  return {
    title: `${product.title} – Babies Bloomers`,
    description: `Shop ${product.title} at Babies Bloomers. ${product.price}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    fetchCatalogProductBySlug(slug),
    fetchCatalogCategories(),
  ]);
  if (!product) notFound();

  const initialReviews = await getProductApprovedReviews(slug);

  const categorySlug = product.categories[0];
  const categoryLabel =
    categories.find((c) => c.slug === categorySlug)?.label ??
    categorySlug ??
    "Shop";

  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="Product"
          crumbs={[
            { label: "Home", href: "/" },
            { label: categoryLabel, href: "/shop" },
            { label: product.title },
          ]}
        />
        <ProductDetail
          product={product}
          categoryLabel={categoryLabel}
          initialReviews={initialReviews}
        />
      </main>
      <Footer />
    </>
  );
}
