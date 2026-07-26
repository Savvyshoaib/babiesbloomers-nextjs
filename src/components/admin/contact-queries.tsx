"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  AdminListToolbar,
  AdminPagination,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { ContactStatusBadge } from "@/components/admin/contact-status-badge";
import { contactStatusOf, type ContactQuery } from "@/lib/contact-query-types";

export type { ContactQuery } from "@/lib/contact-query-types";

function formatWhen(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function AdminContactQueries({ queries }: { queries: ContactQuery[] }) {
  const [search, setSearch] = useState("");

  const matchSearch = useCallback(
    (query: ContactQuery, value: string) =>
      [query.name, query.email, query.message]
        .join(" ")
        .toLowerCase()
        .includes(value),
    [],
  );

  const matchFilters = useCallback(
    (query: ContactQuery, filters: Record<string, string>) => {
      const wanted = filters.status ?? "all";
      return wanted === "all" || contactStatusOf(query) === wanted;
    },
    [],
  );

  const list = useAdminList({
    items: queries,
    searchText: search,
    matchSearch,
    matchFilters,
  });

  if (queries.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No contact queries yet. Messages from the website form appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, or message…"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "new", label: "New" },
              { value: "read", label: "Read" },
              { value: "replied", label: "Replied" },
            ],
          },
        ]}
        filterValues={list.filterValues}
        onFilterChange={list.setFilter}
        onResetPage={list.resetPage}
      />

      {list.total === 0 ? (
        <p className="py-16 text-center font-poppins text-[14px] text-body">
          No contact queries match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-poppins text-[14px]">
            <thead>
              <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                <th className="px-5 py-4">From</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Received</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {list.pageItems.map((query) => {
                const status = contactStatusOf(query);
                const when = formatWhen(query.created_at);
                return (
                  <tr
                    key={query.id}
                    className={`hover:bg-[#fffdfb] ${
                      status === "new" ? "bg-[#fffaf8]" : ""
                    }`}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-2">
                        {status === "new" ? (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-salmon"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{query.name}</p>
                          <p className="break-all text-[13px] text-body">
                            {query.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[320px] px-5 py-4 align-top">
                      <p className="line-clamp-2 text-[13px] leading-5 text-body">
                        {query.message}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <ContactStatusBadge status={status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top text-[13px] text-body">
                      {when.date}
                      <span className="block text-[12px]">{when.time}</span>
                    </td>
                    <td className="px-5 py-4 text-center align-top">
                      <Link
                        href={`/admin/messages/${query.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-[#e0e0e0] px-3 text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
