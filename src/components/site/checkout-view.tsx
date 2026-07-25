"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPkrCheckout } from "@/lib/format";
import { STANDARD_SHIPPING_FEE } from "@/lib/site-data";
import { BagIcon, InfoIcon } from "./icons";

type PaymentMethod = "cod" | "payfast";
type BillingMode = "same" | "different";

export function CheckoutView() {
  const router = useRouter();
  const { items, subtotal, clearCart, itemCount, ready } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("payfast");
  const [billing, setBilling] = useState<BillingMode>("same");
  const [discount, setDiscount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const shipping = items.length > 0 ? STANDARD_SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitted(true);
    clearCart();
    window.setTimeout(() => router.push("/shop"), 2200);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center" aria-busy="true">
        <p className="font-poppins text-[15px] text-body">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="font-fredoka text-[28px] font-medium text-ink">
          Your cart is empty
        </h1>
        <p className="mt-3 font-poppins text-[15px] text-body">
          Add items before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-salmon px-8 font-poppins text-[14px] font-semibold uppercase text-white hover:bg-salmon-soft"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="font-fredoka text-[28px] font-medium text-ink">
          Thank you for your order
        </h1>
        <p className="mt-3 font-poppins text-[15px] text-body">
          We&apos;ve received your order and will be in touch shortly.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-salmon px-8 font-poppins text-[14px] font-semibold uppercase text-white hover:bg-salmon-soft"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Form column */}
      <div className="bg-white px-5 py-8 sm:px-10 lg:px-12 xl:px-16 lg:py-10">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Babies Bloomers home">
              <Image
                src="/images/logo.png"
                alt="Babies Bloomers"
                width={842}
                height={180}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <Link
              href="/cart"
              aria-label={
                itemCount > 0
                  ? `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                  : "Cart"
              }
              className="relative text-ink"
            >
              <BagIcon className="size-6" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-salmon text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Contact */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-poppins text-[18px] font-semibold text-ink">
                  Contact
                </h2>
                <Link
                  href="/my-account"
                  className="font-poppins text-[13px] text-salmon hover:underline"
                >
                  Sign in
                </Link>
              </div>
              <label className="sr-only" htmlFor="checkout-email">
                Email
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                required
                placeholder="Email"
                className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
              />
              <label className="mt-3 flex items-center gap-2 font-poppins text-[13px] text-body">
                <input
                  type="checkbox"
                  name="newsletter"
                  defaultChecked
                  className="size-4 rounded border-[#ccc] accent-salmon"
                />
                Email me with news and offers
              </label>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="mb-3 font-poppins text-[18px] font-semibold text-ink">
                Delivery
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="sr-only" htmlFor="country">
                    Country/Region
                  </label>
                  <select
                    id="country"
                    name="country"
                    defaultValue="Pakistan"
                    className="h-12 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  >
                    <option>Pakistan</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="firstName"
                    required
                    placeholder="First name"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                  <input
                    name="lastName"
                    required
                    placeholder="Last name"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                </div>
                <input
                  name="address"
                  required
                  placeholder="Address"
                  className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="city"
                    required
                    placeholder="City"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                  <input
                    name="postal"
                    placeholder="Postal code (optional)"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                </div>
                <div className="relative">
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="Phone"
                    className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 pr-10 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-body"
                    title="In case we need to contact you about your order"
                  >
                    <InfoIcon className="size-4" />
                  </span>
                </div>
                <label className="flex items-center gap-2 font-poppins text-[13px] text-body">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    className="size-4 rounded border-[#ccc] accent-salmon"
                  />
                  Save this information for next time
                </label>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="mb-3 font-poppins text-[18px] font-semibold text-ink">
                Shipping method
              </h2>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-salmon bg-[#fff5f2] px-4 py-3.5">
                <span className="flex items-center gap-3 font-poppins text-[14px] font-medium text-ink">
                  <span className="flex size-4 items-center justify-center rounded-full border-2 border-salmon">
                    <span className="size-2 rounded-full bg-salmon" />
                  </span>
                  Standard Shipping
                </span>
                <span className="font-poppins text-[14px] font-semibold text-ink">
                  {formatPkrCheckout(STANDARD_SHIPPING_FEE)}
                </span>
              </label>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-poppins text-[18px] font-semibold text-ink">
                Payment
              </h2>
              <p className="mt-1 mb-3 font-poppins text-[13px] text-body">
                All transactions are secure and encrypted.
              </p>
              <div className="overflow-hidden rounded-lg border border-[#cfcfcf]">
                <label
                  className={`flex cursor-pointer items-center gap-3 border-b border-[#eee] px-4 py-3.5 ${
                    payment === "cod" ? "bg-[#fff5f2]" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="accent-salmon"
                  />
                  <span className="font-poppins text-[14px] font-medium text-ink">
                    Cash on Delivery (COD)
                  </span>
                </label>
                <div
                  className={
                    payment === "payfast" ? "bg-[#fff5f2]" : "bg-white"
                  }
                >
                  <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5">
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="payfast"
                        checked={payment === "payfast"}
                        onChange={() => setPayment("payfast")}
                        className="accent-salmon"
                      />
                      <span className="font-poppins text-[14px] font-medium text-ink">
                        PAYFAST (Pay via Debit/Credit/Wallet/Bank Account)
                      </span>
                    </span>
                    <span className="hidden shrink-0 gap-1 sm:flex">
                      {["Visa", "MC", "UP"].map((brand) => (
                        <span
                          key={brand}
                          className="rounded border border-[#ddd] bg-white px-1.5 py-0.5 font-poppins text-[10px] font-semibold text-body"
                        >
                          {brand}
                        </span>
                      ))}
                    </span>
                  </label>
                  {payment === "payfast" ? (
                    <p className="border-t border-[#f0d4cc] px-4 py-3 font-poppins text-[12px] leading-5 text-body">
                      After clicking &quot;Pay now&quot;, you will be redirected
                      to PAYFAST to complete your purchase securely.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Billing */}
            <section>
              <h2 className="mb-3 font-poppins text-[18px] font-semibold text-ink">
                Billing address
              </h2>
              <div className="overflow-hidden rounded-lg border border-[#cfcfcf]">
                {(
                  [
                    { id: "same", label: "Same as shipping address" },
                    { id: "different", label: "Use a different billing address" },
                  ] as const
                ).map((opt, i) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 ${
                      i === 0 ? "border-b border-[#eee]" : ""
                    } ${billing === opt.id ? "bg-[#fff5f2]" : "bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="billing"
                      value={opt.id}
                      checked={billing === opt.id}
                      onChange={() => setBilling(opt.id)}
                      className="accent-salmon"
                    />
                    <span className="font-poppins text-[14px] font-medium text-ink">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center rounded-lg bg-salmon font-poppins text-[16px] font-semibold text-white transition-colors hover:bg-salmon-soft"
            >
              Pay now
            </button>

            <nav
              aria-label="Checkout policies"
              className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#eee] pt-5"
            >
              {[
                { label: "Refund policy", href: "/shipping-policy" },
                { label: "Privacy policy", href: "/privacy-policy" },
                { label: "Terms of service", href: "/terms-and-conditions" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-poppins text-[12px] text-salmon hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </form>
        </div>
      </div>

      {/* Summary column */}
      <aside className="border-t border-[#eee] bg-[#f5f5f5] px-5 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-12 xl:px-14 lg:py-10">
        <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-8">
          <div className="mb-8 hidden items-center justify-between lg:flex">
            <Link href="/" aria-label="Babies Bloomers home">
              <Image
                src="/images/logo.png"
                alt="Babies Bloomers"
                width={842}
                height={180}
                className="h-11 w-auto"
                priority
              />
            </Link>
            <Link
              href="/cart"
              aria-label={
                itemCount > 0
                  ? `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                  : "Cart"
              }
              className="relative text-ink"
            >
              <BagIcon className="size-6" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-salmon text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>

          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-poppins text-[13px] font-medium leading-5 text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 font-poppins text-[12px] text-body">
                    {item.size}
                  </p>
                </div>
                <p className="shrink-0 font-poppins text-[13px] font-medium text-ink">
                  {formatPkrCheckout(item.priceValue * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Discount code or gift card"
              className="h-11 flex-1 rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[13px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
            <button
              type="button"
              className="h-11 rounded-lg bg-[#ddd] px-4 font-poppins text-[13px] font-semibold text-ink transition-colors hover:bg-[#d0d0d0]"
            >
              Apply
            </button>
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-[#e0e0e0] pt-5 font-poppins text-[14px]">
            <div className="flex justify-between">
              <dt className="text-body">
                Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
              </dt>
              <dd className="font-medium text-ink">
                {formatPkrCheckout(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">Shipping</dt>
              <dd className="font-medium text-ink">
                {formatPkrCheckout(shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-[#e0e0e0] pt-4">
              <dt className="text-[16px] font-semibold text-ink">Total</dt>
              <dd className="font-poppins text-ink">
                <span className="mr-1.5 text-[12px] text-body">PKR</span>
                <span className="text-[22px] font-semibold">
                  {formatPkrCheckout(total)}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
