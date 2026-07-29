"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteCoupon,
  saveCoupon,
  setCouponActive,
} from "@/app/actions/coupons";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import type { CouponRow } from "@/lib/coupons";
import { isCouponCurrentlyValid } from "@/lib/coupons";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(coupon: CouponRow) {
  if (!coupon.active) return { text: "Inactive", className: "bg-[#f3f3f3] text-body" };
  const check = isCouponCurrentlyValid(coupon);
  if (!check.valid && check.reason?.toLowerCase().includes("expired")) {
    return { text: "Expired", className: "bg-red-50 text-red-700" };
  }
  if (!check.valid && check.reason?.toLowerCase().includes("not active yet")) {
    return { text: "Scheduled", className: "bg-amber-50 text-amber-800" };
  }
  if (!check.valid) {
    return { text: "Unavailable", className: "bg-red-50 text-red-700" };
  }
  return { text: "Active", className: "bg-emerald-50 text-emerald-700" };
}

const emptyForm = {
  id: "",
  code: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "10",
  min_subtotal: "0",
  max_uses: "",
  starts_at: "",
  ends_at: "",
  active: true,
};

export function CouponsClient({ initial }: { initial: CouponRow[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState(emptyForm);
  const [pendingToggle, startToggle] = useTransition();
  const saveAction = useAdminAction(saveCoupon);

  useEffect(() => {
    if (saveAction.state?.success) {
      setForm(emptyForm);
      window.location.reload();
    }
  }, [saveAction.state]);

  const editing = Boolean(form.id);
  const sorted = useMemo(() => coupons, [coupons]);

  function editCoupon(coupon: CouponRow) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_subtotal: String(coupon.min_subtotal ?? 0),
      max_uses: coupon.max_uses == null ? "" : String(coupon.max_uses),
      starts_at: toLocalInput(coupon.starts_at),
      ends_at: toLocalInput(coupon.ends_at),
      active: coupon.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleActive(coupon: CouponRow) {
    startToggle(async () => {
      const res = await setCouponActive(coupon.id, !coupon.active);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, active: !coupon.active } : c,
        ),
      );
    });
  }

  function onDelete(coupon: CouponRow) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    startToggle(async () => {
      const res = await deleteCoupon(coupon.id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      if (form.id === coupon.id) setForm(emptyForm);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          {editing ? "Edit coupon" : "Create coupon"}
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Set schedule dates for automatic expiry. Leave end date empty for no
          expiry.
        </p>
        <form action={saveAction.formAction} className="space-y-3">
          <input type="hidden" name="id" value={form.id} />
          <input
            type="hidden"
            name="active"
            value={form.active ? "true" : "false"}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Code
              </label>
              <input
                name="code"
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="SAVE10"
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] uppercase text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Discount type
              </label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discount_type: e.target.value as "percent" | "fixed",
                  }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (PKR)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Discount value
              </label>
              <input
                name="discount_value"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.discount_value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount_value: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Min subtotal (PKR)
              </label>
              <input
                name="min_subtotal"
                type="number"
                min="0"
                step="1"
                value={form.min_subtotal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, min_subtotal: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Max uses (blank = unlimited)
              </label>
              <input
                name="max_uses"
                type="number"
                min="1"
                step="1"
                value={form.max_uses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_uses: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                  className="size-4 accent-salmon"
                />
                Active
              </label>
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Starts at
              </label>
              <input
                name="starts_at"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, starts_at: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Expires at
              </label>
              <input
                name="ends_at"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ends_at: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
                Description
              </label>
              <input
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional note for admin"
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <AdminSubmitButton
              pending={saveAction.pending}
              label={editing ? "Update coupon" : "Create coupon"}
            />
            {editing ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="h-10 rounded-lg border border-[#ddd] px-4 font-poppins text-[13px] font-medium text-ink hover:bg-[#fafafa]"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="border-b border-[#eee] bg-[#faf8f6]">
            <tr className="font-poppins text-[12px] uppercase tracking-wide text-body">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Schedule</th>
              <th className="px-4 py-3 font-semibold">Uses</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center font-poppins text-[13px] text-body"
                >
                  No coupons yet. Create your first promo code above.
                </td>
              </tr>
            ) : (
              sorted.map((coupon) => {
                const status = statusLabel(coupon);
                return (
                  <tr key={coupon.id} className="border-b border-[#f0f0f0]">
                    <td className="px-4 py-3 font-poppins text-[13px] font-semibold text-ink">
                      {coupon.code}
                      {coupon.description ? (
                        <p className="mt-0.5 font-normal text-body">
                          {coupon.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-poppins text-[13px] text-ink">
                      {coupon.discount_type === "percent"
                        ? `${coupon.discount_value}%`
                        : `Rs ${Number(coupon.discount_value).toFixed(2)}`}
                      {Number(coupon.min_subtotal) > 0 ? (
                        <span className="block text-[12px] text-body">
                          Min Rs {Number(coupon.min_subtotal).toFixed(0)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-poppins text-[12px] text-body">
                      {coupon.starts_at
                        ? new Date(coupon.starts_at).toLocaleString()
                        : "Anytime"}
                      <br />
                      →{" "}
                      {coupon.ends_at
                        ? new Date(coupon.ends_at).toLocaleString()
                        : "No expiry"}
                    </td>
                    <td className="px-4 py-3 font-poppins text-[13px] text-ink">
                      {coupon.used_count}
                      {coupon.max_uses != null ? ` / ${coupon.max_uses}` : " / ∞"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-poppins text-[11px] font-semibold ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editCoupon(coupon)}
                          className="font-poppins text-[12px] font-medium text-salmon hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={pendingToggle}
                          onClick={() => toggleActive(coupon)}
                          className="font-poppins text-[12px] font-medium text-ink hover:underline disabled:opacity-50"
                        >
                          {coupon.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          disabled={pendingToggle}
                          onClick={() => onDelete(coupon)}
                          className="font-poppins text-[12px] font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
