import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategories, getAdminProduct } from "@/app/actions/admin";
import {
  DeleteProductButton,
  ProductForm,
} from "@/components/admin/product-forms";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            ← Back to products
          </Link>
          <h1 className="mt-2 font-fredoka text-[28px] font-semibold text-ink">
            Edit product
          </h1>
        </div>
        <DeleteProductButton id={product.id} />
      </div>
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-6 shadow-sm">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
