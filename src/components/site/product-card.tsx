"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/site-data";
import { CompareIcon, EyeIcon, HeartIcon, StarIcon } from "./icons";
import { RatingStars } from "./rating-stars";
import { useSavedProducts, type SavedProduct } from "@/lib/saved-products-context";

type CardProduct = Product & {
  slug?: string;
  priceValue?: number;
  averageRating?: number;
  reviewsCount?: number;
};

function productHref(product: CardProduct) {
  return product.slug ? `/product/${product.slug}` : "/shop";
}

function toSaved(product: CardProduct): SavedProduct {
  return {
    slug: product.slug ?? product.title,
    title: product.title,
    image: product.image,
    price: product.price,
    oldPrice: product.oldPrice,
    priceValue: product.priceValue,
  };
}

/** Matches the reference's 90x13 star strip inside a 24px tall row. */
function ProductRatingRow({
  product,
  className = "",
}: {
  product: CardProduct;
  className?: string;
}) {
  return (
    <div className={`flex h-[24px] items-center ${className}`}>
      <RatingStars
        value={product.averageRating}
        count={product.reviewsCount}
        className={className.includes("justify-center") ? "justify-center" : ""}
      />
    </div>
  );
}

/** New Arrivals variant: centred copy over a soft grey square thumbnail. */
export function ArrivalCard({ product }: { product: CardProduct }) {
  const href = productHref(product);

  return (
    <article>
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-[15px] bg-thumb"
      >
        {product.badge ? (
          <span className="absolute left-[15px] top-[15px] z-10 rounded-[20px] bg-amber px-2 text-[12px] font-semibold uppercase leading-[26px] text-white">
            {product.badge}
          </span>
        ) : null}
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={400}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 264px"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="px-[10px] py-[15px] text-center">
        <ProductRatingRow product={product} className="justify-center" />
        <h3 className="mb-[5px] mt-[3px] max-h-[44px] overflow-hidden font-poppins text-[13px] font-medium capitalize leading-[20px] text-[#131a2a] sm:text-[14px] sm:leading-[22px] min-[577px]:h-auto min-[577px]:max-h-none min-[577px]:overflow-visible min-[577px]:text-[16px] min-[577px]:leading-6 min-[1025px]:max-h-[26px] min-[1025px]:overflow-hidden min-[1367px]:max-h-none min-[1367px]:overflow-visible">
          <Link href={href} className="transition-colors hover:text-salmon">
            {product.title}
          </Link>
        </h3>
        <p className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0.5">
          <del className="text-[13px] font-normal leading-5 text-body sm:text-[16px] sm:leading-6">
            {product.oldPrice}
          </del>
          <span className="text-[15px] font-medium leading-5 text-[#131a2a] sm:text-[20px] sm:leading-[26px]">
            {product.price}
          </span>
        </p>
      </div>
    </article>
  );
}

/** Shop archive card: centred copy, salmon sale price, hover action strip. */
export function ShopCard({
  product,
  href = "/shop",
}: {
  product: Product & {
    slug?: string;
    averageRating?: number;
    reviewsCount?: number;
  };
  href?: string;
}) {
  const productHref = product.slug ? `/product/${product.slug}` : href;
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } =
    useSavedProducts();
  const saved = toSaved(product);
  const wishlisted = isWishlisted(saved.slug);
  const compared = isCompared(saved.slug);

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-[15px] bg-thumb">
        {product.badge ? (
          <span className="absolute left-[15px] top-[15px] z-10 rounded-[20px] bg-amber px-2 text-[12px] font-semibold uppercase leading-[26px] text-white">
            {product.badge}
          </span>
        ) : null}

        <Link href={productHref} aria-label={product.title} className="block size-full">
          <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 336px"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:opacity-100">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white p-1.5 shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
            <Link
              href={productHref}
              aria-label={`Quick view ${product.title}`}
              className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-salmon hover:text-white"
            >
              <EyeIcon className="size-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => toggleWishlist(saved)}
              aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`}
              aria-pressed={wishlisted}
              className={`flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors ${
                wishlisted
                  ? "bg-salmon text-white"
                  : "text-ink hover:bg-salmon hover:text-white"
              }`}
            >
              <HeartIcon className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(saved)}
              aria-label={`${compared ? "Remove" : "Add"} ${product.title} ${compared ? "from" : "to"} compare`}
              aria-pressed={compared}
              className={`flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors ${
                compared
                  ? "bg-salmon text-white"
                  : "text-ink hover:bg-salmon hover:text-white"
              }`}
            >
              <CompareIcon className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-[10px] py-[15px] text-center">
        <ProductRatingRow product={product} className="justify-center" />
        <h3 className="mb-[5px] mt-[3px] font-poppins text-[16px] font-medium capitalize leading-6 text-[#111]">
          <Link href={productHref} className="transition-colors hover:text-salmon">
            {product.title}
          </Link>
        </h3>
        <p className="flex flex-wrap items-baseline justify-center gap-x-[6px] text-[14px] leading-6">
          <del className="font-normal text-body">{product.oldPrice}</del>
          <span className="font-medium text-salmon-soft">{product.price}</span>
        </p>
      </div>
    </article>
  );
}

/** Top Picks variant: white card, left-aligned copy, pink sale price. */
export function PickCard({ product }: { product: CardProduct }) {
  const href = productHref(product);

  return (
    <article className="overflow-hidden rounded-[12px] bg-white p-[2px]">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-[10px]"
      >
        {product.badge ? (
          <span className="absolute left-[10px] top-[10px] z-10 rounded-[11px_12px_12px_0] bg-amber px-[15px] text-[12px] font-semibold uppercase leading-[30px] text-white">
            {product.badge}
          </span>
        ) : null}
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={400}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 271px"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="px-3 pb-4 pt-2">
        <h3 className="mb-[5px] font-poppins text-[16px] font-medium capitalize leading-6 text-steel">
          <Link href={href} className="transition-colors hover:text-salmon">
            {product.title}
          </Link>
        </h3>
        <p className="flex items-center gap-[6px] text-[14px] leading-6 text-body">
          <span>
            {product.averageRating && product.averageRating > 0
              ? product.averageRating.toFixed(1)
              : "0"}
          </span>
          <StarIcon
            className={`size-[11px] ${
              product.averageRating && product.averageRating > 0
                ? "text-amber"
                : "text-[#d9d9d9]"
            }`}
          />
          <span aria-hidden="true" className="text-[#d9d9d9]">
            |
          </span>
          <span>
            {product.reviewsCount && product.reviewsCount > 0
              ? `${product.reviewsCount} review${product.reviewsCount === 1 ? "" : "s"}`
              : "No review"}
          </span>
        </p>
        <p className="flex flex-wrap items-baseline gap-x-[6px]">
          <del className="text-[14px] font-semibold leading-6 text-body">
            {product.oldPrice}
          </del>
          <span className="text-[16px] font-semibold leading-6 text-pink-deep">
            {product.price}
          </span>
        </p>
      </div>
    </article>
  );
}
