"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  deleteOrder,
  updateOrderDetails,
  updateOrderStatus,
} from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const { formAction, pending } = useAdminAction(updateOrderStatus);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label
          htmlFor={`status-${orderId}`}
          className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
        >
          Order status
        </label>
        <select
          id={`status-${orderId}`}
          name="status"
          defaultValue={currentStatus}
          className="h-10 rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[13px] text-ink"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <AdminSubmitButton pending={pending} label="Update status" />
    </form>
  );
}

export type OrderEditable = {
  id: string;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal: string | null;
  shipping_country: string | null;
  notes: string | null;
  payment_method: string;
  subtotal: number | string;
  shipping_fee: number | string;
};

function fieldClass() {
  return "h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink outline-none focus:border-salmon";
}

export function OrderDetailsForm({ order }: { order: OrderEditable }) {
  const { formAction, pending } = useAdminAction(updateOrderDetails);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={order.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            First name
          </label>
          <input
            name="shipping_first_name"
            required
            defaultValue={order.shipping_first_name ?? ""}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Last name
          </label>
          <input
            name="shipping_last_name"
            defaultValue={order.shipping_last_name ?? ""}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Email
          </label>
          <input
            name="shipping_email"
            type="email"
            required
            defaultValue={order.shipping_email ?? ""}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Phone
          </label>
          <input
            name="shipping_phone"
            defaultValue={order.shipping_phone ?? ""}
            className={fieldClass()}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
          Address
        </label>
        <textarea
          name="shipping_address"
          rows={2}
          defaultValue={order.shipping_address ?? ""}
          className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2 font-poppins text-[13px] text-ink outline-none focus:border-salmon"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            City
          </label>
          <input
            name="shipping_city"
            defaultValue={order.shipping_city ?? ""}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Postal
          </label>
          <input
            name="shipping_postal"
            defaultValue={order.shipping_postal ?? ""}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Country
          </label>
          <input
            name="shipping_country"
            defaultValue={order.shipping_country ?? "Pakistan"}
            className={fieldClass()}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Payment
          </label>
          <select
            name="payment_method"
            defaultValue={order.payment_method}
            className={fieldClass()}
          >
            <option value="cod">COD</option>
            <option value="payfast">PayFast</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Subtotal (PKR)
          </label>
          <input
            name="subtotal"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={Number(order.subtotal)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Shipping fee (PKR)
          </label>
          <input
            name="shipping_fee"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={Number(order.shipping_fee)}
            className={fieldClass()}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
          Notes
        </label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={order.notes ?? ""}
          className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2 font-poppins text-[13px] text-ink outline-none focus:border-salmon"
        />
      </div>

      <AdminSubmitButton
        pending={pending}
        label="Save order details"
        pendingLabel="Saving…"
      />
    </form>
  );
}

export function DeleteOrderButton({
  orderId,
  invoiceNumber,
}: {
  orderId: string;
  invoiceNumber: string | number;
}) {
  const router = useRouter();
  const { formAction, pending, state } = useAdminAction(deleteOrder);

  useEffect(() => {
    if (state?.success) router.push("/admin/orders");
  }, [state, router]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete order #${invoiceNumber}? This cannot be undone.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <AdminSubmitButton
        pending={pending}
        label="Delete order"
        pendingLabel="Deleting…"
        variant="danger"
      />
    </form>
  );
}
