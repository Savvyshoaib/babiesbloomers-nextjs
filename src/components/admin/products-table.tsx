"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { AdminCategory, AdminProduct } from "@/app/actions/admin";
import { formatPkrCheckout } from "@/lib/format";
import {
  AdminListToolbar,
  AdminPagination,
  useAdminList,
  type AdminFilterConfig,
} from "@/components/admin/admin-list-controls";
import { StatusBadge } from "@/components/admin/admin-forms";
import { DeleteProductButton } from "@/components/admin/product-forms";

export function AdminProductsTable({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
}) {
  const [search, setSearch] = useState("");

  const filters: AdminFilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "all", label: "All categories" },
        ...categories.map((c) => ({ value: c.slug, label: c.label })),
      ],
    },
  ];

  const matchSearch = useCallback((p: AdminProduct, q: string) => {
    return [p.title, p.slug, p.product_code ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  }, []);

  const matchFilters = useCallback(
    (p: AdminProduct, values: Record<string, string>) => {
      const status = values.status ?? "all";
      const category = values.category ?? "all";
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && !(p.categories ?? []).includes(category)) {
        return false;
      }
      return true;
    },
    [],
  );

  const list = useAdminList({
    items: products,
    searchText: search,
    matchSearch,
    matchFilters,
  });

  if (products.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <div className="py-16 text-center">
          <p className="font-poppins text-[14px] text-body">
            No products in the database yet. Import the current catalog or add
            one manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, code, slug…"
        filters={filters}
        filterValues={list.filterValues}
        onFilterChange={list.setFilter}
        onResetPage={list.resetPage}
      />

      {list.total === 0 ? (
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No products match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-poppins text-[14px]">
            <thead>
              <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {list.pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-[#fffdfb]">
                  <td className="px-5 py-4">
                    <p className="max-w-[320px] truncate font-semibold text-ink">
                      {p.title}
                    </p>
                    <p className="mt-0.5 font-poppins text-[12px] text-body">
                      {p.product_code || p.slug}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-ink">
                    {formatPkrCheckout(Number(p.price_value))}
                  </td>
                  <td className="px-5 py-4 text-body">{p.stock}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-[#e0e0e0] px-3 text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
