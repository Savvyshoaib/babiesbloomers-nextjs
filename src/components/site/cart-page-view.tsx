"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPkr, formatPkrCheckout } from "@/lib/format";
import { STANDARD_SHIPPING_FEE } from "@/lib/site-data";
import { MinusIcon, PlusIcon } from "./icons";

export function CartPageView() {
  const { items, subtotal, removeItem, updateQuantity, ready } = useCart();
  const shipping = items.length > 0 ? STANDARD_SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  if (!ready) {
    return (
      <div className="shell py-16 lg:py-24" aria-busy="true">
        <p className="text-center font-poppins text-[14px] text-body">
          Loading cart…
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell py-16 text-center lg:py-24">
        <h2 className="font-fredoka text-[28px] font-medium text-ink">
          Your cart is empty
        </h2>
        <p className="mt-3 font-poppins text-[15px] text-body">
          Browse our collection and add something soft for little moments.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-salmon px-8 font-poppins text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-salmon-soft"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-[60px]">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e8e8e8] font-poppins text-[13px] font-semibold uppercase tracking-wide text-body">
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Price</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#f0f0f0]">
                  <td className="py-5 pr-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative size-[80px] shrink-0 overflow-hidden rounded-md bg-thumb"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-poppins text-[14px] font-medium leading-5 text-ink transition-colors hover:text-salmon"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 font-poppins text-[13px] text-body">
                          Size: {item.size}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="mt-2 font-poppins text-[12px] text-body underline underline-offset-2 hover:text-salmon"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-4 font-poppins text-[14px] text-ink">
                    {item.price}
                  </td>
                  <td className="py-5 pr-4">
                    <div className="inline-flex h-10 items-center rounded-md border border-[#ddd]">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex size-10 items-center justify-center text-ink hover:text-salmon"
                      >
                        <MinusIcon className="size-3.5" />
                      </button>
                      <span className="min-w-[32px] text-center font-poppins text-[14px] font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex size-10 items-center justify-center text-ink hover:text-salmon"
                      >
                        <PlusIcon className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-5 text-right font-poppins text-[14px] font-semibold text-ink">
                    {formatPkr(item.priceValue * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="h-fit rounded-xl border border-[#eee] bg-[#fafafa] p-6">
          <h2 className="font-fredoka text-[22px] font-medium text-ink">
            Cart totals
          </h2>
          <dl className="mt-5 space-y-3 font-poppins text-[14px]">
            <div className="flex justify-between border-b border-[#eee] pb-3">
              <dt className="text-body">Subtotal</dt>
              <dd className="font-medium text-ink">{formatPkr(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-b border-[#eee] pb-3">
              <dt className="text-body">Shipping</dt>
              <dd className="font-medium text-ink">
                {formatPkrCheckout(shipping)}
              </dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-[16px] font-semibold text-ink">Total</dt>
              <dd className="text-[18px] font-semibold text-ink">
                {formatPkr(total)}
              </dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-salmon font-poppins text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-salmon-soft"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
