"use client";

import Link from "next/link";
import { updateSiteSetting } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function SettingsForms({
  settings,
}: {
  settings: Record<string, unknown>;
}) {
  const shipping = settings.shipping_fee ?? 250;
  const promo =
    (settings.promo_strip as { text?: string; enabled?: boolean }) || {};

  const shippingAction = useAdminAction(updateSiteSetting);
  const promoAction = useAdminAction(updateSiteSetting);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
          Shipping fee
        </h2>
        <form
          action={shippingAction.formAction}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="key" value="shipping_fee" />
          <div>
            <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
              Amount (PKR)
            </label>
            <input
              name="value"
              type="number"
              step="1"
              defaultValue={Number(shipping)}
              className="h-10 w-40 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
            />
          </div>
          <AdminSubmitButton
            pending={shippingAction.pending}
            label="Save shipping"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Contact page
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Map, store locations, phone, email, and opening hours are managed in
          Site Content so the public Contact page stays in sync.
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
