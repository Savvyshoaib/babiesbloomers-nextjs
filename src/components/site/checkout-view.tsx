"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useAppSelector } from "@/store/hooks";
import { formatPkrCheckout } from "@/lib/format";
import { placeOrder } from "@/app/actions/orders";
import {
  createOrGetUserByEmail,
  getCheckoutPrefill,
} from "@/app/actions/auth";
import { applyCouponCode } from "@/app/actions/coupons";
import {
  enabledPaymentMethods,
  mergeCheckoutSettings,
  resolveShippingFee,
  type CheckoutSettings,
} from "@/lib/checkout-settings";
import { InfoIcon, MinusIcon, PlusIcon } from "./icons";
import { ButtonSpinner } from "./button-spinner";
import { CheckoutSkeleton } from "./skeleton";
import { EmptyCartState } from "./empty-cart-state";

type BillingMode = "same" | "different";

type AppliedCoupon = {
  code: string;
  discountAmount: number;
};

type CheckoutResult =
  | { type: "new_account"; invoiceNumber: string }
  | { type: "existing_account"; invoiceNumber: string }
  | { type: "logged_in"; invoiceNumber: string };

type DeliveryForm = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  phone: string;
};

const CHECKOUT_SAVE_KEY = "bb_checkout_delivery";

const emptyDelivery: DeliveryForm = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postal: "",
  country: "Pakistan",
  phone: "",
};

function readLocalDelivery(): DeliveryForm | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DeliveryForm>;
    return {
      email: parsed.email ?? "",
      firstName: parsed.firstName ?? "",
      lastName: parsed.lastName ?? "",
      address: parsed.address ?? "",
      city: parsed.city ?? "",
      postal: parsed.postal ?? "",
      country: parsed.country || "Pakistan",
      phone: parsed.phone ?? "",
    };
  } catch {
    return null;
  }
}

function writeLocalDelivery(data: DeliveryForm) {
  localStorage.setItem(CHECKOUT_SAVE_KEY, JSON.stringify(data));
}

export function CheckoutView() {
  const {
    items,
    subtotal,
    clearCart,
    itemCount,
    ready,
    removeItem,
    updateQuantity,
  } = useCart();
  const user = useAppSelector((s) => s.auth.user);
  const authReady = useAppSelector((s) => s.auth.initialized);

  const [checkoutSettings, setCheckoutSettings] =
    useState<CheckoutSettings | null>(null);
  const [payment, setPayment] = useState("");
  const [billing, setBilling] = useState<BillingMode>("same");
  const [billingForm, setBillingForm] = useState<DeliveryForm>(emptyDelivery);
  const [discount, setDiscount] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [couponPending, setCouponPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryForm>(emptyDelivery);
  const [prefillReady, setPrefillReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
      try {
        const res = await fetch("/api/checkout-settings", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        const settings = mergeCheckoutSettings(json.data);
        setCheckoutSettings(settings);
        const enabled = enabledPaymentMethods(settings);
        setPayment((prev) =>
          enabled.some((p) => p.id === prev) ? prev : enabled[0]?.id || "",
        );
      } catch {
        if (!cancelled) {
          const settings = mergeCheckoutSettings(null);
          setCheckoutSettings(settings);
          setPayment(enabledPaymentMethods(settings)[0]?.id || "");
        }
      }
    }
    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    async function loadPrefill() {
      if (user) {
        const saved = await getCheckoutPrefill();
        if (cancelled) return;
        if (saved) {
          setDelivery({
            email: saved.email || user.email || "",
            firstName: saved.firstName,
            lastName: saved.lastName,
            address: saved.address,
            city: saved.city,
            postal: saved.postal,
            country: saved.country || "Pakistan",
            phone: saved.phone,
          });
          if (saved.billing) {
            setBillingForm({
              email: saved.email || user.email || "",
              firstName: saved.billing.firstName,
              lastName: saved.billing.lastName,
              address: saved.billing.address,
              city: saved.billing.city,
              postal: saved.billing.postal,
              country: saved.billing.country || "Pakistan",
              phone: saved.billing.phone,
            });
          }
          setSaveInfo(true);
        } else {
          setDelivery((prev) => ({
            ...prev,
            email: user.email || prev.email,
          }));
        }
      } else {
        const local = readLocalDelivery();
        if (local) {
          setDelivery(local);
          setSaveInfo(true);
        }
      }
      if (!cancelled) setPrefillReady(true);
    }

    loadPrefill();
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  function updateDelivery<K extends keyof DeliveryForm>(
    key: K,
    value: DeliveryForm[K],
  ) {
    setDelivery((prev) => ({ ...prev, [key]: value }));
  }

  function updateBillingForm<K extends keyof DeliveryForm>(
    key: K,
    value: DeliveryForm[K],
  ) {
    setBillingForm((prev) => ({ ...prev, [key]: value }));
  }

  const payments = useMemo(
    () => (checkoutSettings ? enabledPaymentMethods(checkoutSettings) : []),
    [checkoutSettings],
  );
  const selectedPayment = payments.find((p) => p.id === payment) ?? null;
  const shipping =
    items.length > 0 && checkoutSettings
      ? resolveShippingFee(checkoutSettings)
      : 0;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);
  const customSections =
    checkoutSettings?.customSections.filter((s) => s.enabled) ?? [];

  async function onApplyCoupon() {
    if (!discount.trim() || couponPending) return;
    setCouponPending(true);
    const res = await applyCouponCode(discount, subtotal);
    setCouponPending(false);
    if (!res.success || !res.data) {
      setAppliedCoupon(null);
      toast.error(res.message || "Could not apply coupon.");
      return;
    }
    setAppliedCoupon({
      code: res.data.code,
      discountAmount: res.data.discountAmount,
    });
    setDiscount(res.data.code);
    toast.success(res.message || "Coupon applied.");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0 || submitting) return;
    if (!payment) {
      toast.error("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const email = (user?.email || delivery.email).trim().toLowerCase();
    const firstName = delivery.firstName.trim();
    const lastName = delivery.lastName.trim();
    const address = delivery.address.trim();
    const city = delivery.city.trim();
    const postal = delivery.postal.trim();
    const phone = delivery.phone.trim();
    const country = delivery.country.trim() || "Pakistan";

    if (billing === "different") {
      if (
        !billingForm.firstName.trim() ||
        !billingForm.lastName.trim() ||
        !billingForm.address.trim() ||
        !billingForm.city.trim() ||
        !billingForm.phone.trim()
      ) {
        const message = "Please complete all required billing fields.";
        setError(message);
        toast.error(message);
        setSubmitting(false);
        return;
      }
    }

    let userId = user?.id ?? null;
    let checkoutResultType: CheckoutResult["type"] = "logged_in";
    let temporaryPassword: string | undefined;
    let isNewAccount = false;

    if (!user) {
      const authResult = await createOrGetUserByEmail(
        email,
        firstName,
        lastName,
      );

      if (!authResult.success || !authResult.data?.userId) {
        const message =
          authResult.message ||
          "Could not process your account. Please try again.";
        setError(message);
        toast.error(message);
        setSubmitting(false);
        return;
      }

      userId = authResult.data.userId;
      isNewAccount = authResult.data.isNew;
      temporaryPassword = authResult.data.temporaryPassword;
      checkoutResultType = authResult.data.isNew
        ? "new_account"
        : "existing_account";
    }

    const orderResult = await placeOrder({
      userId,
      email,
      firstName,
      lastName,
      address,
      city,
      postal,
      country,
      phone,
      paymentMethod: payment,
      subtotal,
      shippingFee: shipping,
      discountAmount,
      couponCode: appliedCoupon?.code ?? null,
      total,
      items: items.map((item) => ({
        slug: item.slug,
        title: item.title,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.priceValue,
        totalPrice: item.priceValue * item.quantity,
      })),
      notify: user
        ? { isNewAccount: false }
        : {
            isNewAccount,
            temporaryPassword,
          },
      saveInfo,
      billingMode: billing,
      billing:
        billing === "different"
          ? {
              firstName: billingForm.firstName.trim(),
              lastName: billingForm.lastName.trim(),
              address: billingForm.address.trim(),
              city: billingForm.city.trim(),
              postal: billingForm.postal.trim(),
              country: billingForm.country.trim() || "Pakistan",
              phone: billingForm.phone.trim(),
            }
          : null,
    });

    if (!orderResult.success || !orderResult.data?.invoiceNumber) {
      const message =
        orderResult.message || "Could not place your order. Please try again.";
      setError(message);
      toast.error(message);
      setSubmitting(false);
      return;
    }

    if (saveInfo) {
      writeLocalDelivery({
        email,
        firstName,
        lastName,
        address,
        city,
        postal,
        country,
        phone,
      });
    }

    clearCart();
    setResult({
      type: checkoutResultType,
      invoiceNumber: orderResult.data.invoiceNumber,
    });

    if (checkoutResultType === "existing_account") {
      toast.success("Order confirmed. Check your order in your account.");
    } else if (checkoutResultType === "new_account") {
      toast.success(
        "Order confirmed! Check your email for login details and confirmation.",
      );
    } else {
      toast.success(orderResult.message || "Order confirmed.");
    }

    setSubmitting(false);
  }

  if (!ready || !authReady || !prefillReady || !checkoutSettings) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0 && !result) {
    return (
      <EmptyCartState
        title="Your cart is empty"
        description="Add items before checking out — soft essentials for little moments are waiting in the shop."
        primaryHref="/shop"
        primaryLabel="Continue shopping"
        secondaryHref="/cart"
        secondaryLabel="View cart"
      />
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#f0fff4]">
          <svg
            className="size-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-fredoka text-[32px] font-semibold text-ink">
          Order Confirmed!
        </h1>
        <p className="mt-2 font-poppins text-[14px] text-body">
          Invoice #{result.invoiceNumber}
        </p>

        {result.type === "new_account" && (
          <div className="mt-6 rounded-xl border border-[#d1fae5] bg-[#ecfdf5] p-5 text-left">
            <p className="font-poppins text-[14px] font-semibold text-green-700">
              Account created — check your email
            </p>
            <p className="mt-2 font-poppins text-[13px] text-green-600">
              We sent you <strong>2 emails</strong>: one with your login email
              &amp; password, and one with your order confirmation. Sign in
              anytime to track orders and download invoices.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-green-600 px-6 font-poppins text-[13px] font-semibold text-white hover:bg-green-700"
            >
              Sign In to Dashboard
            </Link>
          </div>
        )}

        {result.type === "existing_account" && (
          <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-5 text-left">
            <p className="font-poppins text-[14px] font-semibold text-blue-700">
              Please check your order in your account
            </p>
            <p className="mt-2 font-poppins text-[13px] text-blue-600">
              This email already has an account, so no new account was created.
              Your order is linked to that account — sign in to view orders and
              download the invoice.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 px-6 font-poppins text-[13px] font-semibold text-white hover:bg-blue-700"
            >
              Sign In to View Orders
            </Link>
          </div>
        )}

        {result.type === "logged_in" && (
          <div className="mt-6 rounded-xl border border-[#fff3cd] bg-[#fffbea] p-5 text-left">
            <p className="font-poppins text-[13px] text-yellow-700">
              Your order is visible in your dashboard. You can track it and
              download the invoice anytime.
            </p>
            <Link
              href="/account/orders"
              className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-salmon px-6 font-poppins text-[13px] font-semibold text-white hover:bg-salmon-soft"
            >
              View My Orders
            </Link>
          </div>
        )}

        <Link
          href="/shop"
          className="mt-6 inline-block font-poppins text-[13px] text-salmon hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="bg-white px-5 py-8 sm:px-10 lg:px-12 xl:px-16 lg:py-10">
        <div className="mx-auto w-full max-w-[560px]">
          <form onSubmit={onSubmit} className="space-y-8">
            <section>
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="font-poppins text-[18px] font-semibold text-ink">
                  Contact
                </h2>
                {!user && (
                  <Link
                    href="/sign-in"
                    className="font-poppins text-[13px] text-salmon hover:underline"
                  >
                    Already have an account? Sign in
                  </Link>
                )}
              </div>
              {user ? (
                <div className="flex items-center gap-3 rounded-lg border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-salmon text-[11px] font-bold text-white">
                    {(user.email?.[0] ?? "U").toUpperCase()}
                  </span>
                  <div>
                    <p className="font-poppins text-[13px] font-medium text-ink">
                      {user.email}
                    </p>
                    <p className="font-poppins text-[11px] text-green-600">
                      Signed in ✓
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <label className="sr-only" htmlFor="checkout-email">
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    required
                    value={delivery.email}
                    onChange={(e) => updateDelivery("email", e.target.value)}
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
                </>
              )}
            </section>

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
                    value={delivery.country}
                    onChange={(e) => updateDelivery("country", e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  >
                    <option>Pakistan</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="firstName"
                    required
                    value={delivery.firstName}
                    onChange={(e) =>
                      updateDelivery("firstName", e.target.value)
                    }
                    placeholder="First name"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                  <input
                    name="lastName"
                    required
                    value={delivery.lastName}
                    onChange={(e) => updateDelivery("lastName", e.target.value)}
                    placeholder="Last name"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                </div>
                <input
                  name="address"
                  required
                  value={delivery.address}
                  onChange={(e) => updateDelivery("address", e.target.value)}
                  placeholder="Address"
                  className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="city"
                    required
                    value={delivery.city}
                    onChange={(e) => updateDelivery("city", e.target.value)}
                    placeholder="City"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                  <input
                    name="postal"
                    value={delivery.postal}
                    onChange={(e) => updateDelivery("postal", e.target.value)}
                    placeholder="Postal code (optional)"
                    className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                  />
                </div>
                <div className="relative">
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={delivery.phone}
                    onChange={(e) => updateDelivery("phone", e.target.value)}
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
                <label className="flex cursor-pointer items-center gap-2 font-poppins text-[13px] text-body">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-[#ccc] accent-salmon"
                  />
                  Save this information for next time
                </label>
              </div>
            </section>

            {checkoutSettings.shipping.enabled &&
            checkoutSettings.shipping.mode !== "disabled" ? (
              <section>
                <h2 className="mb-3 font-poppins text-[18px] font-semibold text-ink">
                  Shipping method
                </h2>
                <label className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-salmon bg-[#fff5f2] px-4 py-3.5">
                  <span className="flex items-center gap-3 font-poppins text-[14px] font-medium text-ink">
                    <span className="flex size-4 items-center justify-center rounded-full border-2 border-salmon">
                      <span className="size-2 rounded-full bg-salmon" />
                    </span>
                    {checkoutSettings.shipping.label}
                  </span>
                  <span className="font-poppins text-[14px] font-semibold text-ink">
                    {shipping === 0
                      ? "FREE"
                      : formatPkrCheckout(shipping)}
                  </span>
                </label>
              </section>
            ) : null}

            <section>
              <h2 className="font-poppins text-[18px] font-semibold text-ink">
                Payment
              </h2>
              <p className="mt-1 mb-3 font-poppins text-[13px] text-body">
                All transactions are secure and encrypted.
              </p>
              {payments.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-poppins text-[13px] text-amber-800">
                  No payment methods are enabled. Please contact the store.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-[#cfcfcf]">
                  {payments.map((method, i) => (
                    <div
                      key={method.id}
                      className={
                        payment === method.id ? "bg-[#fff5f2]" : "bg-white"
                      }
                    >
                      <label
                        className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 ${
                          i < payments.length - 1 || payment === method.id
                            ? "border-b border-[#eee]"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={payment === method.id}
                          onChange={() => setPayment(method.id)}
                          className="accent-salmon"
                        />
                        <span className="font-poppins text-[14px] font-medium text-ink">
                          {method.label}
                        </span>
                      </label>
                      {payment === method.id &&
                      (method.description || method.bankDetails) ? (
                        <div className="space-y-2 border-t border-[#f0d4cc] px-4 py-3">
                          {method.description ? (
                            <p className="font-poppins text-[12px] leading-5 text-body">
                              {method.description}
                            </p>
                          ) : null}
                          {method.bankDetails ? (
                            <pre className="whitespace-pre-wrap rounded-md bg-white/70 p-3 font-poppins text-[12px] leading-5 text-ink">
                              {method.bankDetails}
                            </pre>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-poppins text-[18px] font-semibold text-ink">
                Billing address
              </h2>
              <div className="overflow-hidden rounded-lg border border-[#cfcfcf]">
                {(
                  [
                    { id: "same", label: "Same as shipping address" },
                    {
                      id: "different",
                      label: "Use a different billing address",
                    },
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
              {billing === "different" ? (
                <div className="mt-3 space-y-3 rounded-lg border border-[#eee] bg-[#fafafa] p-4">
                  <div>
                    <select
                      value={billingForm.country}
                      onChange={(e) =>
                        updateBillingForm("country", e.target.value)
                      }
                      className="h-12 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink"
                    >
                      <option>Pakistan</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={billingForm.firstName}
                      onChange={(e) =>
                        updateBillingForm("firstName", e.target.value)
                      }
                      placeholder="First name"
                      className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                    />
                    <input
                      required
                      value={billingForm.lastName}
                      onChange={(e) =>
                        updateBillingForm("lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                    />
                  </div>
                  <input
                    required
                    value={billingForm.address}
                    onChange={(e) =>
                      updateBillingForm("address", e.target.value)
                    }
                    placeholder="Address"
                    className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={billingForm.city}
                      onChange={(e) =>
                        updateBillingForm("city", e.target.value)
                      }
                      placeholder="City"
                      className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                    />
                    <input
                      value={billingForm.postal}
                      onChange={(e) =>
                        updateBillingForm("postal", e.target.value)
                      }
                      placeholder="Postal code (optional)"
                      className="h-12 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                    />
                  </div>
                  <input
                    required
                    type="tel"
                    value={billingForm.phone}
                    onChange={(e) =>
                      updateBillingForm("phone", e.target.value)
                    }
                    placeholder="Phone"
                    className="h-12 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
                  />
                </div>
              ) : null}
            </section>

            {customSections.map((section) => (
              <section
                key={section.id}
                className="rounded-lg border border-[#eee] bg-[#fafafa] p-4"
              >
                <h2 className="font-poppins text-[16px] font-semibold text-ink">
                  {section.title}
                </h2>
                <p className="mt-2 whitespace-pre-wrap font-poppins text-[13px] leading-6 text-body">
                  {section.body}
                </p>
              </section>
            ))}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-poppins text-[13px] text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || payments.length === 0}
              className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-salmon font-poppins text-[16px] font-semibold text-white transition-colors hover:bg-salmon-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <ButtonSpinner />
                  Placing Order…
                </>
              ) : selectedPayment?.type === "cod" ? (
                "Place order"
              ) : (
                "Pay now"
              )}
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

      <aside className="border-t border-[#eee] bg-[#f5f5f5] px-5 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-12 xl:px-14 lg:py-10">
        <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-8">
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
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="inline-flex h-8 items-center rounded border border-[#ddd] bg-white">
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
              onChange={(e) => {
                setDiscount(e.target.value);
                if (appliedCoupon) setAppliedCoupon(null);
              }}
              placeholder="Discount code or gift card"
              className="h-11 flex-1 rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[13px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={couponPending || !discount.trim()}
              className="h-11 cursor-pointer rounded-lg bg-[#ddd] px-4 font-poppins text-[13px] font-semibold text-ink transition-colors hover:bg-[#d0d0d0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {couponPending ? "…" : "Apply"}
            </button>
          </div>
          {appliedCoupon ? (
            <p className="mt-2 font-poppins text-[12px] text-emerald-700">
              Coupon {appliedCoupon.code} applied (−
              {formatPkrCheckout(appliedCoupon.discountAmount)})
            </p>
          ) : null}

          <dl className="mt-6 space-y-2.5 border-t border-[#e0e0e0] pt-5 font-poppins text-[14px]">
            <div className="flex justify-between">
              <dt className="text-body">
                Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
              </dt>
              <dd className="font-medium text-ink">
                {formatPkrCheckout(subtotal)}
              </dd>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-body">Discount</dt>
                <dd className="font-medium text-emerald-700">
                  −{formatPkrCheckout(discountAmount)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-body">
                {checkoutSettings.shipping.label || "Shipping"}
              </dt>
              <dd className="font-medium text-ink">
                {shipping === 0 ? "FREE" : formatPkrCheckout(shipping)}
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
