"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { BagIcon } from "./icons";

type EmptyCartStateProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

/**
 * Branded empty cart / checkout state — logo, message, and clear next steps.
 */
export function EmptyCartState({
  title = "Your cart is empty",
  description = "Browse our collection and add something soft for little moments.",
  primaryHref = "/shop",
  primaryLabel = "Continue shopping",
  secondaryHref = "/",
  secondaryLabel = "Back to home",
}: EmptyCartStateProps) {
  const { branding } = useAppSelector(selectSiteContent);

  return (
    <div className="shell py-12 sm:py-16 lg:py-20">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-[#ebe5e0] bg-white px-6 py-12 text-center shadow-[0_8px_40px_rgba(18,27,40,0.06)] sm:px-10 sm:py-14">
        <Link href="/" className="mb-8 inline-flex" aria-label="Babies Bloomers home">
          <Image
            src={branding.logo}
            alt="Babies Bloomers"
            width={842}
            height={180}
            className="h-12 w-auto max-w-[180px] object-contain sm:h-14"
            unoptimized={branding.logo.startsWith("http")}
          />
        </Link>

        <span className="flex size-20 items-center justify-center rounded-full bg-[#fff5f2] text-salmon">
          <BagIcon className="size-9" />
        </span>

        <h2 className="mt-5 font-fredoka text-[26px] font-semibold text-ink sm:text-[30px]">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-poppins text-[14px] leading-6 text-body sm:text-[15px]">
          {description}
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href={primaryHref}
            className="inline-flex h-12 items-center justify-center rounded-full bg-salmon px-8 font-poppins text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-salmon-soft"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#e0dcd6] px-8 font-poppins text-[14px] font-semibold text-ink transition-colors hover:border-salmon hover:text-salmon"
          >
            {secondaryLabel}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-poppins text-[13px] text-body">
          <Link href="/new-arrivals" className="hover:text-salmon hover:underline">
            New arrivals
          </Link>
          <span aria-hidden="true" className="text-[#d6d6d6]">
            ·
          </span>
          <Link href="/wishlist" className="hover:text-salmon hover:underline">
            Wishlist
          </Link>
          <span aria-hidden="true" className="text-[#d6d6d6]">
            ·
          </span>
          <Link href="/contact" className="hover:text-salmon hover:underline">
            Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}
