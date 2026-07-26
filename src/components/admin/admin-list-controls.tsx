"use client";

import { useCallback, useMemo, useState } from "react";

export type AdminFilterOption = {
  value: string;
  label: string;
};

export type AdminFilterConfig = {
  key: string;
  label: string;
  options: AdminFilterOption[];
};

const DEFAULT_PAGE_SIZE = 10;

export function useAdminList<T>({
  items,
  searchText,
  matchSearch,
  matchFilters,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  items: T[];
  searchText: string;
  matchSearch: (item: T, query: string) => boolean;
  matchFilters?: (item: T, filterValues: Record<string, string>) => boolean;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !matchSearch(item, q)) return false;
      if (matchFilters && !matchFilters(item, filterValues)) return false;
      return true;
    });
  }, [items, searchText, matchSearch, matchFilters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const from = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, filtered.length);

  const setFilter = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    filtered,
    pageItems,
    page: currentPage,
    totalPages,
    from,
    to,
    total: filtered.length,
    filterValues,
    setFilter,
    setPage: (next: number) =>
      setPage(Math.max(1, Math.min(totalPages, next))),
    resetPage,
  };
}

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  filterValues,
  onFilterChange,
  onResetPage,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: AdminFilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onResetPage: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#f0ece8] bg-[#faf9f7] p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <label htmlFor="admin-list-search" className="sr-only">
          Search
        </label>
        <input
          id="admin-list-search"
          type="search"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onResetPage();
          }}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-lg border border-[#e0e0e0] bg-white px-3.5 font-poppins text-[13px] text-ink outline-none transition-colors placeholder:text-body focus:border-salmon"
        />
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[140px]">
          <label htmlFor={`filter-${filter.key}`} className="sr-only">
            {filter.label}
          </label>
          <select
            id={`filter-${filter.key}`}
            value={filterValues[filter.key] ?? "all"}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-[#e0e0e0] bg-white px-3 font-poppins text-[13px] text-ink outline-none focus:border-salmon"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  from,
  to,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (totalPages <= 7) return true;
      if (p === 1 || p === totalPages) return true;
      return Math.abs(p - page) <= 1;
    })
    .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
      if (idx > 0) {
        const prev = arr[idx - 1]!;
        if (p - prev > 1) acc.push("ellipsis");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col gap-3 border-t border-[#f0ece8] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-poppins text-[13px] text-body">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#e0e0e0] px-3 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="px-1 font-poppins text-[13px] text-body"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg font-poppins text-[13px] font-medium transition-colors ${
                item === page
                  ? "bg-salmon text-white"
                  : "border border-[#e0e0e0] text-ink hover:border-salmon hover:text-salmon"
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#e0e0e0] px-3 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
