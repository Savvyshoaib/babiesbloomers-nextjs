"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedProducts } from "@/lib/saved-products-context";
import { CloseIcon, CompareIcon, HeartIcon } from "./icons";

export function WishlistView() {
  const {
    wishlist,
    ready,
    removeWishlist,
    clearWishlist,
    isCompared,
    toggleCompare,
  } = useSavedProducts();

  if (!ready) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-2xl bg-[#f0ece8]"
          />
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0dcd6] bg-white px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#fff5f2] text-salmon">
          <HeartIcon className="size-8" />
        </span>
        <h2 className="mt-4 font-fredoka text-[22px] font-semibold text-ink">
          Your wishlist is empty
        </h2>
        <p className="mt-1 max-w-sm font-poppins text-[14px] text-body">
          Save your favourite products by tapping the heart icon — they&apos;ll
          show up here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-poppins text-[14px] text-body">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
        <button
          type="button"
          onClick={clearWishlist}
          className="cursor-pointer font-poppins text-[13px] font-medium text-red-500 transition-colors hover:underline"
        >
          Clear all
        </button>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => {
          const href = `/product/${item.slug}`;
          const compared = isCompared(item.slug);
          return (
            <li
              key={item.slug}
              className="group relative overflow-hidden rounded-2xl border border-[#f0ece8] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => removeWishlist(item.slug)}
                aria-label={`Remove ${item.title} from wishlist`}
                className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-body shadow transition-colors hover:bg-red-500 hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>

              <Link href={href} className="block aspect-square overflow-hidden bg-thumb">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={400}
                  unoptimized={item.image.startsWith("http")}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="p-4">
                <h3 className="mb-1 line-clamp-2 font-poppins text-[15px] font-medium capitalize text-ink">
                  <Link href={href} className="transition-colors hover:text-salmon">
                    {item.title}
                  </Link>
                </h3>
                <p className="flex flex-wrap items-baseline gap-x-2 font-poppins">
                  {item.oldPrice ? (
                    <del className="text-[13px] text-body">{item.oldPrice}</del>
                  ) : null}
                  <span className="text-[17px] font-semibold text-salmon">
                    {item.price}
                  </span>
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={href}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-salmon px-4 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-salmon-soft"
                  >
                    View product
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      toggleCompare({
                        slug: item.slug,
                        title: item.title,
                        image: item.image,
                        price: item.price,
                        oldPrice: item.oldPrice,
                        priceValue: item.priceValue,
                      })
                    }
                    aria-label="Add to compare"
                    aria-pressed={compared}
                    className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                      compared
                        ? "border-salmon bg-salmon text-white"
                        : "border-[#e0dcd6] text-ink hover:border-salmon hover:text-salmon"
                    }`}
                  >
                    <CompareIcon className="size-[18px]" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
