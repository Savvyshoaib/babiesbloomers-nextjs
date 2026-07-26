import Link from "next/link";
import { getAdminCategories, getAdminProducts } from "@/app/actions/admin";
import {
  SeedCatalogButton,
} from "@/components/admin/product-forms";
import { AdminProductsTable } from "@/components/admin/products-table";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-fredoka text-[28px] font-semibold text-ink">
            Products
          </h1>
          <p className="mt-1 font-poppins text-[14px] text-body">
            Manage catalog — updates appear on Shop, New Arrivals and Home.
            {categories.length === 0
              ? " Tip: import catalog or add categories first."
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SeedCatalogButton />
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white hover:bg-salmon-soft"
          >
            Add product
          </Link>
        </div>
      </div>

      <AdminProductsTable products={products} categories={categories} />
    </div>
  );
}
