import { getAdminCategories } from "@/app/actions/admin";
import { CategoryCreateForm } from "@/components/admin/category-forms";
import { AdminCategoriesTable } from "@/components/admin/categories-table";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink">
          Categories
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Add and manage shop categories used on products and filters.
        </p>
      </div>

      <CategoryCreateForm />

      <AdminCategoriesTable categories={categories} />
    </div>
  );
}
