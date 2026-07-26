"use client";

import { useCallback, useState } from "react";
import type { AdminCategory } from "@/app/actions/admin";
import { CategoryRow } from "@/components/admin/category-forms";
import {
  AdminListToolbar,
  AdminPagination,
  useAdminList,
  type AdminFilterConfig,
} from "@/components/admin/admin-list-controls";

const filters: AdminFilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

export function AdminCategoriesTable({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const [search, setSearch] = useState("");

  const matchSearch = useCallback((c: AdminCategory, q: string) => {
    return [c.label, c.slug].join(" ").toLowerCase().includes(q);
  }, []);

  const matchFilters = useCallback(
    (c: AdminCategory, values: Record<string, string>) => {
      const status = values.status ?? "all";
      if (status === "active") return c.is_active;
      if (status === "inactive") return !c.is_active;
      return true;
    },
    [],
  );

  const list = useAdminList({
    items: categories,
    searchText: search,
    matchSearch,
    matchFilters,
  });

  if (categories.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No categories yet. Add one above or import catalog from Products.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories…"
        filters={filters}
        filterValues={list.filterValues}
        onFilterChange={list.setFilter}
        onResetPage={list.resetPage}
      />

      {list.total === 0 ? (
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No categories match your search or filters.
        </p>
      ) : (
        <table className="w-full">
          <tbody className="divide-y divide-[#f5f5f5]">
            {list.pageItems.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </tbody>
        </table>
      )}

      <AdminPagination
        page={list.page}
        totalPages={list.totalPages}
        from={list.from}
        to={list.to}
        total={list.total}
        onPageChange={list.setPage}
      />
    </div>
  );
}
