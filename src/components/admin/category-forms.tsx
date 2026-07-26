"use client";

import {
  deleteCategory,
  upsertCategory,
  type AdminCategory,
} from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function CategoryCreateForm() {
  const { formAction, pending } = useAdminAction(upsertCategory);

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h2 className="font-poppins text-[15px] font-semibold text-ink">
          Add category
        </h2>
      </div>
      <input
        name="label"
        required
        placeholder="Category name"
        className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
      />
      <input
        name="slug"
        placeholder="slug (optional)"
        className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
      />
      <input
        name="sortOrder"
        type="number"
        defaultValue={0}
        placeholder="Sort order"
        className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
      />
      <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="size-4 accent-salmon"
        />
        Active
      </label>
      <div className="sm:col-span-2">
        <AdminSubmitButton pending={pending} label="Add category" />
      </div>
    </form>
  );
}

export function CategoryRow({ category }: { category: AdminCategory }) {
  const update = useAdminAction(upsertCategory);
  const remove = useAdminAction(deleteCategory);

  return (
    <tr className="hover:bg-[#fffdfb]">
      <td className="px-5 py-4" colSpan={5}>
        <form
          action={update.formAction}
          className="flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <input type="hidden" name="id" value={category.id} />
          <input
            name="label"
            defaultValue={category.label}
            className="h-10 flex-1 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
          />
          <input
            name="slug"
            defaultValue={category.slug}
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink lg:w-44"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={category.sort_order}
            className="h-10 w-24 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
          />
          <label className="flex items-center gap-2 whitespace-nowrap font-poppins text-[12px] text-ink">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.is_active}
              className="size-4 accent-salmon"
            />
            Active
          </label>
          <AdminSubmitButton
            pending={update.pending}
            label="Save"
            variant="outline"
          />
        </form>
        <form
          action={remove.formAction}
          className="mt-2"
          onSubmit={(e) => {
            if (!confirm("Delete this category?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <AdminSubmitButton
            pending={remove.pending}
            label="Delete"
            pendingLabel="…"
            variant="danger"
          />
        </form>
      </td>
    </tr>
  );
}
