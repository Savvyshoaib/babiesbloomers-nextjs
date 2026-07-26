"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatPkrCheckout } from "@/lib/format";
import { StatusBadge } from "@/components/admin/admin-forms";
import {
  AdminListToolbar,
  AdminPagination,
  useAdminList,
  type AdminFilterConfig,
} from "@/components/admin/admin-list-controls";

export type AdminOrderRow = {
  id: string;
  invoice_number: string | number;
  shipping_email: string | null;
  created_at: string;
  items_count: number;
  status: string;
  total: number | string;
};

const filters: AdminFilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All statuses" },
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export function AdminOrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [search, setSearch] = useState("");

  const matchSearch = useCallback((order: AdminOrderRow, q: string) => {
    return [String(order.invoice_number), order.shipping_email ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  }, []);

  const matchFilters = useCallback(
    (order: AdminOrderRow, values: Record<string, string>) => {
      const status = values.status ?? "all";
      if (status !== "all" && order.status !== status) return false;
      return true;
    },
    [],
  );

  const list = useAdminList({
    items: orders,
    searchText: search,
    matchSearch,
    matchFilters,
  });

  if (orders.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice or email…"
        filters={filters}
        filterValues={list.filterValues}
        onFilterChange={list.setFilter}
        onResetPage={list.resetPage}
      />

      {list.total === 0 ? (
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No orders match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-poppins text-[14px]">
            <thead>
              <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                <th className="px-5 py-4">Invoice</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {list.pageItems.map((order) => (
                <tr key={order.id} className="hover:bg-[#fffdfb]">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-ink">
                    #{order.invoice_number}
                  </td>
                  <td className="px-5 py-4 text-body">
                    {order.shipping_email ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-body">
                    {new Date(order.created_at).toLocaleDateString("en-PK")}
                  </td>
                  <td className="px-5 py-4 text-body">
                    {order.items_count ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-ink">
                    {formatPkrCheckout(Number(order.total))}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-[#e0e0e0] px-3 text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon"
                      >
                        Manage
                      </Link>
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
