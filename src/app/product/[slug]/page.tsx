import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageBanner } from "@/components/site/page-banner";
import { ProductDetail } from "@/components/site/product-detail";
import {
  getCategoryLabel,
  getShopProduct,
  shopProducts,
} from "@/lib/site-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return shopProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getShopProduct(slug);
  if (!product) return { title: "Product – Babies Bloomers" };
  return {
    title: `${product.title} – Babies Bloomers`,
    description: `Shop ${product.title} at Babies Bloomers. ${product.price}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getShopProduct(slug);
  if (!product) notFound();

  const categorySlug = product.categories[0];
  const categoryLabel = categorySlug
    ? getCategoryLabel(categorySlug)
    : "Shop";

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
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  );
}
