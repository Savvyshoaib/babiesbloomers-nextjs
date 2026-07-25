"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPkrCompact } from "@/lib/format";
import {
  CloseIcon,
  CouponIcon,
  MinusIcon,
  NoteIcon,
  PlusIcon,
  TruckIcon,
} from "./icons";

export function CartDrawer() {
  const {
    items,
    subtotal,
    drawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
      {...(!drawerOpen ? { inert: true } : {})}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eee] px-5 py-4">
          <h2 className="font-poppins text-[20px] font-semibold leading-7 text-ink">
            Shopping Cart
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex size-10 items-center justify-center text-ink transition-colors hover:text-salmon"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-poppins text-[15px] text-body">
                Your cart is empty.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="font-poppins text-[14px] font-semibold text-salmon underline-offset-2 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-[#f0f0f0] pb-5">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeDrawer}
                    className="relative size-[72px] shrink-0 overflow-hidden rounded-md bg-thumb"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeDrawer}
                      className="line-clamp-2 font-poppins text-[13px] font-medium leading-5 text-ink transition-colors hover:text-salmon"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 font-poppins text-[12px] text-body">
                      Size: {item.size}
                    </p>
                    <p className="mt-1 font-poppins text-[14px] font-semibold text-ink">
                      {formatPkrCompact(item.priceValue)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex h-8 items-center rounded border border-[#ddd]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex size-8 items-center justify-center text-ink hover:text-salmon"
                        >
                          <MinusIcon className="size-3.5" />
                        </button>
                        <span className="min-w-[28px] text-center font-poppins text-[13px] font-medium text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex size-8 items-center justify-center text-ink hover:text-salmon"
                        >
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-poppins text-[12px] text-body underline underline-offset-2 transition-colors hover:text-salmon"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[#eee] px-5 pb-5 pt-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: "Note", Icon: NoteIcon },
              { label: "Shipping", Icon: TruckIcon },
              { label: "Coupon", Icon: CouponIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#f3f3f3] font-poppins text-[12px] font-medium text-ink transition-colors hover:bg-[#ebebeb]"
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between font-poppins">
            <span className="text-[15px] font-medium text-ink">Subtotal</span>
            <span className="text-[16px] font-semibold text-ink">
              {formatPkrCompact(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            onClick={closeDrawer}
            className={`flex h-12 w-full items-center justify-center rounded-md bg-salmon font-poppins text-[15px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-salmon-soft ${
              items.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Check out
          </Link>
          <Link
            href="/cart"
            onClick={closeDrawer}
            className="mt-3 block text-center font-poppins text-[14px] font-medium text-ink underline-offset-2 hover:text-salmon hover:underline"
          >
            View Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
