"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateSiteSetting } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import {
  mergeCheckoutSettings,
  type CheckoutCustomSection,
  type CheckoutPaymentMethod,
  type CheckoutSettings,
  type ShippingMode,
} from "@/lib/checkout-settings";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SettingsForms({
  settings,
}: {
  settings: Record<string, unknown>;
}) {
  const initial = useMemo(
    () => mergeCheckoutSettings(settings.checkout_settings),
    [settings.checkout_settings],
  );
  const [checkout, setCheckout] = useState<CheckoutSettings>(initial);
  const promo =
    (settings.promo_strip as { text?: string; enabled?: boolean }) || {};

  const checkoutAction = useAdminAction(updateSiteSetting);
  const promoAction = useAdminAction(updateSiteSetting);

  function updateShipping<K extends keyof CheckoutSettings["shipping"]>(
    key: K,
    value: CheckoutSettings["shipping"][K],
  ) {
    setCheckout((c) => ({
      ...c,
      shipping: { ...c.shipping, [key]: value },
    }));
  }

  function updatePayment(index: number, patch: Partial<CheckoutPaymentMethod>) {
    setCheckout((c) => {
      const payments = [...c.payments];
      payments[index] = { ...payments[index]!, ...patch };
      return { ...c, payments };
    });
  }

  function updateSection(index: number, patch: Partial<CheckoutCustomSection>) {
    setCheckout((c) => {
      const customSections = [...c.customSections];
      customSections[index] = { ...customSections[index]!, ...patch };
      return { ...c, customSections };
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Shipping
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Controls checkout and cart shipping fee. Free / disabled charge Rs 0.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 font-poppins text-[13px] text-ink sm:col-span-2 lg:col-span-4">
            <input
              type="checkbox"
              checked={checkout.shipping.enabled}
              onChange={(e) => updateShipping("enabled", e.target.checked)}
              className="size-4 accent-salmon"
            />
            Show shipping on checkout
          </label>
          <div>
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Mode
            </label>
            <select
              value={checkout.shipping.mode}
              onChange={(e) =>
                updateShipping("mode", e.target.value as ShippingMode)
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
            >
              <option value="fixed">Fixed fee</option>
              <option value="free">Always free</option>
              <option value="disabled">Disabled (Rs 0)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Fee (PKR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={checkout.shipping.fee}
              disabled={checkout.shipping.mode !== "fixed"}
              onChange={(e) =>
                updateShipping("fee", Number(e.target.value) || 0)
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink disabled:bg-[#f5f5f5]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Label
            </label>
            <input
              value={checkout.shipping.label}
              onChange={(e) => updateShipping("label", e.target.value)}
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-poppins text-[15px] font-semibold text-ink">
              Payment methods
            </h2>
            <p className="mt-1 font-poppins text-[13px] text-body">
              Enable COD, PayFast, bank transfer, or add a custom method with
              details.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setCheckout((c) => ({
                ...c,
                payments: [
                  ...c.payments,
                  {
                    id: newId("pay"),
                    type: "custom",
                    label: "New payment method",
                    description: "",
                    enabled: true,
                    bankDetails: "",
                  },
                ],
              }))
            }
            className="h-9 rounded-lg border border-[#ddd] px-3 font-poppins text-[12px] font-semibold text-ink hover:border-salmon hover:text-salmon"
          >
            + Add method
          </button>
        </div>
        <div className="space-y-4">
          {checkout.payments.map((method, index) => (
            <div
              key={method.id}
              className="space-y-3 rounded-xl border border-[#f0ece8] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 font-poppins text-[13px] font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={(e) =>
                      updatePayment(index, { enabled: e.target.checked })
                    }
                    className="size-4 accent-salmon"
                  />
                  Enabled
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setCheckout((c) => ({
                      ...c,
                      payments: c.payments.filter((_, i) => i !== index),
                    }))
                  }
                  className="font-poppins text-[12px] text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                    Label
                  </label>
                  <input
                    value={method.label}
                    onChange={(e) =>
                      updatePayment(index, { label: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                    Type
                  </label>
                  <select
                    value={method.type}
                    onChange={(e) =>
                      updatePayment(index, {
                        type: e.target.value as CheckoutPaymentMethod["type"],
                        id:
                          e.target.value === "custom"
                            ? method.id
                            : e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
                  >
                    <option value="cod">COD</option>
                    <option value="payfast">PayFast</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                    Description
                  </label>
                  <input
                    value={method.description}
                    onChange={(e) =>
                      updatePayment(index, { description: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
                  />
                </div>
                {(method.type === "bank_transfer" ||
                  method.type === "custom") && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                      Bank / payment details (shown on checkout)
                    </label>
                    <textarea
                      rows={4}
                      value={method.bankDetails}
                      onChange={(e) =>
                        updatePayment(index, { bankDetails: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2 font-poppins text-[13px] text-ink"
                      placeholder="Account title, IBAN, instructions…"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-poppins text-[15px] font-semibold text-ink">
              Custom checkout sections
            </h2>
            <p className="mt-1 font-poppins text-[13px] text-body">
              Extra notes (returns, packing, etc.) shown on the checkout page.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setCheckout((c) => ({
                ...c,
                customSections: [
                  ...c.customSections,
                  {
                    id: newId("sec"),
                    title: "New section",
                    body: "",
                    enabled: true,
                  },
                ],
              }))
            }
            className="h-9 rounded-lg border border-[#ddd] px-3 font-poppins text-[12px] font-semibold text-ink hover:border-salmon hover:text-salmon"
          >
            + Add section
          </button>
        </div>
        {checkout.customSections.length === 0 ? (
          <p className="font-poppins text-[13px] text-body">
            No custom sections yet.
          </p>
        ) : (
          <div className="space-y-4">
            {checkout.customSections.map((section, index) => (
              <div
                key={section.id}
                className="space-y-3 rounded-xl border border-[#f0ece8] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        updateSection(index, { enabled: e.target.checked })
                      }
                      className="size-4 accent-salmon"
                    />
                    Enabled
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCheckout((c) => ({
                        ...c,
                        customSections: c.customSections.filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                    className="font-poppins text-[12px] text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={section.title}
                  onChange={(e) =>
                    updateSection(index, { title: e.target.value })
                  }
                  placeholder="Section title"
                  className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
                />
                <textarea
                  rows={3}
                  value={section.body}
                  onChange={(e) =>
                    updateSection(index, { body: e.target.value })
                  }
                  placeholder="Section body"
                  className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2 font-poppins text-[13px] text-ink"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        action={checkoutAction.formAction}
        className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          const form = e.currentTarget;
          const hidden = form.querySelector<HTMLInputElement>(
            'input[name="value"]',
          );
          if (hidden) hidden.value = JSON.stringify(checkout);
        }}
      >
        <input type="hidden" name="key" value="checkout_settings" />
        <input type="hidden" name="value" defaultValue="" />
        <AdminSubmitButton
          pending={checkoutAction.pending}
          label="Save checkout settings"
        />
      </form>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Contact page
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Map, store locations, phone, email, and opening hours are managed in
          Site Content.
        </p>
        <Link
          href="/admin/content"
          className="inline-flex h-10 items-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-salmon-soft"
        >
          Edit contact page
        </Link>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
          Promo strip
        </h2>
        <form
          action={promoAction.formAction}
          className="space-y-3"
          onSubmit={(e) => {
            const form = e.currentTarget;
            const fd = new FormData(form);
            const value = JSON.stringify({
              text: String(fd.get("promoText") ?? "").trim(),
              enabled: fd.get("promoEnabled") === "on",
            });
            const hidden = form.querySelector<HTMLInputElement>(
              'input[name="value"]',
            );
            if (hidden) hidden.value = value;
          }}
        >
          <input type="hidden" name="key" value="promo_strip" />
          <input type="hidden" name="value" defaultValue="" />
          <input
            name="promoText"
            defaultValue={promo.text ?? ""}
            placeholder="Promo text"
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
          />
          <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
            <input
              type="checkbox"
              name="promoEnabled"
              defaultChecked={promo.enabled !== false}
              className="size-4 accent-salmon"
            />
            Enabled
          </label>
          <AdminSubmitButton pending={promoAction.pending} label="Save promo" />
        </form>
      </div>
    </div>
  );
}
