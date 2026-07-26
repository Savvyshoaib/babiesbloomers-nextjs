import Link from "next/link";
import { getAdminCategories } from "@/app/actions/admin";
import { ProductForm } from "@/components/admin/product-forms";

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
        >
          ← Back to products
        </Link>
        <h1 className="mt-2 font-fredoka text-[28px] font-semibold text-ink">
          Add product
        </h1>
      </div>
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
