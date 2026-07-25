"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ShopProduct } from "@/lib/site-data";
import {
  getCategoryLabel,
  getProductGallery,
  productDescriptionBullets,
  productOffers,
  productSizes,
} from "@/lib/site-data";
import {
  BagIcon,
  CompareIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
} from "./icons";

type Tab = "description" | "additional" | "reviews";

const offerIcons = {
  truck: TruckIcon,
  tag: TagIcon,
  shield: ShieldCheckIcon,
  return: ReturnIcon,
};

export function ProductDetail({ product }: { product: ShopProduct }) {
  const { addItem } = useCart();
  const gallery = getProductGallery(product);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string>(productSizes[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("description");
  const primaryCategory = product.categories[0];
  const categoryLabel = primaryCategory
    ? getCategoryLabel(primaryCategory)
    : "Shop";

  function handleAddToCart() {
    addItem({
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: product.price,
      priceValue: product.priceValue,
      size,
      quantity: qty,
    });
  }

  return (
    <div className="shell py-10 lg:py-[60px]">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[12px] bg-thumb">
            {product.badge ? (
              <span className="absolute left-4 top-4 z-10 flex size-12 items-center justify-center rounded-full bg-amber font-poppins text-[11px] font-bold uppercase text-white">
                {product.badge}
              </span>
            ) : null}
            <Image
              src={gallery[activeImage]!}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <ul className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <li key={`${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={activeImage === i}
                  className={`relative aspect-square w-full overflow-hidden rounded-md border-2 bg-thumb transition-colors ${
                    activeImage === i
                      ? "border-salmon"
                      : "border-transparent hover:border-[#ddd]"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Details */}
        <div>
          <h1 className="font-fredoka text-[26px] font-medium leading-tight text-ink sm:text-[32px] sm:leading-10">
            {product.title}
          </h1>

          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <del className="font-poppins text-[16px] text-body">
              {product.oldPrice}
            </del>
            <span className="font-poppins text-[26px] font-semibold leading-8 text-salmon sm:text-[30px]">
              {product.price}
            </span>
          </p>

          <div className="mt-6">
            <p className="mb-2.5 font-poppins text-[14px] font-semibold text-ink">
              Size
            </p>
            <div
              role="radiogroup"
              aria-label="Size"
              className="flex flex-wrap gap-2"
            >
              {productSizes.map((s) => {
                const selected = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSize(s)}
                    className={`rounded-md border px-3 py-2 font-poppins text-[13px] font-medium transition-colors ${
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-[#ddd] bg-white text-ink hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-md border border-[#ddd]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-12 items-center justify-center text-ink hover:text-salmon"
              >
                <MinusIcon className="size-4" />
              </button>
              <span className="min-w-[40px] text-center font-poppins text-[15px] font-medium text-ink">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="flex size-12 items-center justify-center text-ink hover:text-salmon"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-salmon px-6 font-poppins text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-salmon-soft sm:flex-none sm:min-w-[200px]"
            >
              <BagIcon className="size-5" />
              Add to cart
            </button>

            <Link
              href="/compare"
              aria-label="Compare"
              className="flex size-12 items-center justify-center rounded-full border border-[#ddd] text-ink transition-colors hover:border-salmon hover:text-salmon"
            >
              <CompareIcon className="size-5" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Add to wishlist"
              className="flex size-12 items-center justify-center rounded-full border border-[#ddd] text-ink transition-colors hover:border-salmon hover:text-salmon"
            >
              <HeartIcon className="size-5" />
            </Link>
          </div>

          <div className="mt-5 space-y-1 font-poppins text-[13px] text-body">
            <p>
              Product Code:{" "}
              <span className="text-ink">{product.slug.slice(0, 8).toUpperCase()}</span>
            </p>
            <p>
              Category:{" "}
              <Link
                href={`/shop?category=${primaryCategory ?? ""}`}
                className="font-medium text-ink transition-colors hover:text-salmon"
              >
                {categoryLabel}
              </Link>
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-salmon/70 bg-[#fff5f2] p-5">
            <p className="mb-3 font-poppins text-[15px] font-semibold text-ink">
              Exclusive Offer:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {productOffers.map((offer) => {
                const Icon = offerIcons[offer.icon];
                return (
                  <li
                    key={offer.title}
                    className="flex items-start gap-2.5 font-poppins text-[13px] leading-5 text-body"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-salmon shadow-sm">
                      <Icon className="size-3.5" />
                    </span>
                    {offer.title}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t border-[#eee] pt-8 lg:mt-16">
        <div
          role="tablist"
          aria-label="Product information"
          className="flex flex-wrap gap-x-8 gap-y-2 border-b border-[#eee]"
        >
          {(
            [
              { id: "description", label: "Description" },
              { id: "additional", label: "Additional Information" },
              { id: "reviews", label: "Reviews (0)" },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 pb-3 font-poppins text-[15px] font-medium transition-colors ${
                  active
                    ? "border-salmon text-salmon"
                    : "border-transparent text-body hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="py-6 font-poppins text-[14px] leading-6 text-body">
          {tab === "description" ? (
            <ul className="list-disc space-y-2 pl-5">
              {productDescriptionBullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {tab === "additional" ? (
            <dl className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">Material</dt>
                <dd>Premium cotton blend</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Care</dt>
                <dd>Machine wash gentle, tumble dry low</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Origin</dt>
                <dd>Pakistan</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Sizes</dt>
                <dd>{productSizes.join(", ")}</dd>
              </div>
            </dl>
          ) : null}
          {tab === "reviews" ? (
            <p>There are no reviews yet. Be the first to review this product.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
