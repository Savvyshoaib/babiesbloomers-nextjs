"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedProducts } from "@/lib/saved-products-context";
import { CloseIcon, CompareIcon, HeartIcon } from "./icons";

const ROWS = [
  { key: "price", label: "Price" },
  { key: "availability", label: "Availability" },
  { key: "actions", label: "" },
] as const;

export function CompareView() {
  const {
    compare,
    ready,
    removeCompare,
    clearCompare,
    isWishlisted,
    toggleWishlist,
  } = useSavedProducts();

  if (!ready) {
    return (
      <div className="h-[360px] animate-pulse rounded-2xl bg-[#f0ece8]" />
    );
  }

  if (compare.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0dcd6] bg-white px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#fff5f2] text-salmon">
          <CompareIcon className="size-8" />
        </span>
        <h2 className="mt-4 font-fredoka text-[22px] font-semibold text-ink">
          No products to compare
        </h2>
        <p className="mt-1 max-w-sm font-poppins text-[14px] text-body">
          Add products to compare by tapping the compare icon on any product.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-poppins text-[14px] text-body">
          Comparing {compare.length}{" "}
          {compare.length === 1 ? "product" : "products"}
        </p>
        <button
          type="button"
          onClick={clearCompare}
          className="cursor-pointer font-poppins text-[13px] font-medium text-red-500 transition-colors hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#f0ece8] bg-white shadow-sm">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr>
              <th className="w-[120px] border-b border-[#f0ece8] p-4 text-left align-top font-poppins text-[13px] font-semibold text-body sm:w-[140px]">
                Product
              </th>
              {compare.map((item) => {
                const href = `/product/${item.slug}`;
                return (
                  <th
                    key={item.slug}
                    className="relative min-w-[180px] border-b border-l border-[#f0ece8] p-4 align-top"
                  >
                    <button
                      type="button"
                      onClick={() => removeCompare(item.slug)}
                      aria-label={`Remove ${item.title}`}
                      className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#faf9f7] text-body transition-colors hover:bg-red-500 hover:text-white"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                    <Link href={href} className="block">
                      <span className="mb-3 block aspect-square overflow-hidden rounded-xl bg-thumb">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={240}
                          height={240}
                          unoptimized={item.image.startsWith("http")}
                          sizes="200px"
                          className="size-full object-cover"
                        />
                      </span>
                      <span className="line-clamp-2 font-poppins text-[14px] font-medium capitalize text-ink transition-colors hover:text-salmon">
                        {item.title}
                      </span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="border-b border-[#f0ece8] p-4 align-middle font-poppins text-[13px] font-semibold text-body">
                  {row.label}
                </td>
                {compare.map((item) => {
                  const href = `/product/${item.slug}`;
                  const wishlisted = isWishlisted(item.slug);
                  return (
                    <td
                      key={item.slug}
                      className="border-b border-l border-[#f0ece8] p-4 align-middle font-poppins text-[13px] text-ink"
                    >
                      {row.key === "price" ? (
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          {item.oldPrice ? (
                            <del className="text-[12px] text-body">
                              {item.oldPrice}
                            </del>
                          ) : null}
                          <span className="text-[16px] font-semibold text-salmon">
                            {item.price}
                          </span>
                        </span>
                      ) : null}
                      {row.key === "availability" ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-700">
                          In stock
                        </span>
                      ) : null}
                      {row.key === "actions" ? (
                        <div className="flex items-center gap-2">
                          <Link
                            href={href}
                            className="inline-flex h-9 items-center rounded-full bg-salmon px-4 text-[12px] font-semibold text-white transition-colors hover:bg-salmon-soft"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              toggleWishlist({
                                slug: item.slug,
                                title: item.title,
                                image: item.image,
                                price: item.price,
                                oldPrice: item.oldPrice,
                                priceValue: item.priceValue,
                              })
                            }
                            aria-label="Add to wishlist"
                            aria-pressed={wishlisted}
                            className={`flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                              wishlisted
                                ? "border-salmon bg-salmon text-white"
                                : "border-[#e0dcd6] text-ink hover:border-salmon hover:text-salmon"
                            }`}
                          >
                            <HeartIcon className="size-4" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
