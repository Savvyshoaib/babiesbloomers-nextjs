"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { AdminCustomer } from "@/app/actions/admin";
import { formatPkrCheckout } from "@/lib/format";
import {
  AdminListToolbar,
  AdminPagination,
  useAdminList,
  type AdminFilterConfig,
} from "@/components/admin/admin-list-controls";

const filters: AdminFilterConfig[] = [
  {
    key: "role",
    label: "Role",
    options: [
      { value: "all", label: "All roles" },
      { value: "customer", label: "Customer" },
      { value: "shop_manager", label: "Shop Manager" },
      { value: "admin", label: "Admin" },
    ],
  },
];

export function AdminCustomersTable({
  customers,
}: {
  customers: AdminCustomer[];
}) {
  const [search, setSearch] = useState("");

  const matchSearch = useCallback((c: AdminCustomer, q: string) => {
    return [
      c.first_name ?? "",
      c.last_name ?? "",
      c.email ?? "",
      c.phone ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  }, []);

  const matchFilters = useCallback(
    (c: AdminCustomer, values: Record<string, string>) => {
      const role = values.role ?? "all";
      if (role !== "all" && c.role !== role) return false;
      return true;
    },
    [],
  );

  const list = useAdminList({
    items: customers,
    searchText: search,
    matchSearch,
    matchFilters,
  });

  if (customers.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No customers yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, phone…"
        filters={filters}
        filterValues={list.filterValues}
        onFilterChange={list.setFilter}
        onResetPage={list.resetPage}
      />

      {list.total === 0 ? (
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No customers match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-poppins text-[14px]">
            <thead>
              <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Orders</th>
                <th className="px-5 py-4 text-right">Spent</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {list.pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-[#fffdfb]">
                  <td className="px-5 py-4 font-semibold text-ink">
                    {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                      "—"}
                  </td>
                  <td className="px-5 py-4 text-body">{c.email ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                        c.role === "admin"
                          ? "bg-ink text-white"
                          : c.role === "shop_manager"
                            ? "bg-salmon/15 text-salmon"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.role === "shop_manager"
                        ? "Shop Manager"
                        : c.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-body">
                    {c.orders_count ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-ink">
                    {formatPkrCheckout(c.total_spent ?? 0)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-[#e0e0e0] px-3 text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon"
                    >
                      View
                    </Link>
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
