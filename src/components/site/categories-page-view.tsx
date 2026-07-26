"use client";

import Link from "next/link";
import { useNavCategories } from "@/components/site/categories-menu";

export function CategoriesPageView() {
  const categories = useNavCategories();

  return (
    <div className="shell py-10 lg:py-[60px]">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-fredoka text-[26px] font-semibold text-ink sm:text-[32px]">
          Shop by category
        </h2>
        <p className="mt-2 font-poppins text-[14px] leading-6 text-body sm:text-[15px]">
          Explore our full range of baby essentials — every category updates from
          the live catalog.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#e0dcd6] bg-white px-6 py-12 text-center font-poppins text-[14px] text-body">
          Categories will appear here once the catalog loads.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-[#f0ece8] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-salmon/40 hover:shadow-md"
              >
                <span className="font-poppins text-[14px] font-semibold capitalize text-ink transition-colors group-hover:text-salmon sm:text-[15px]">
                  {cat.label}
                </span>
                {typeof cat.count === "number" ? (
                  <span className="mt-3 font-poppins text-[12px] text-body">
                    {cat.count} {cat.count === 1 ? "item" : "items"}
                  </span>
                ) : (
                  <span className="mt-3 font-poppins text-[12px] text-salmon opacity-0 transition-opacity group-hover:opacity-100">
                    Shop now →
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-full bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft"
        >
          Browse all products
        </Link>
      </div>
    </div>
  );
}
