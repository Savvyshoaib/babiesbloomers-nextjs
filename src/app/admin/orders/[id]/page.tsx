import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/app/actions/admin";
import { formatPkrCheckout } from "@/lib/format";
import { StatusBadge } from "@/components/admin/admin-forms";
import {
  DeleteOrderButton,
  OrderDetailsForm,
  OrderStatusForm,
} from "@/components/admin/order-status-form";
import { requirePermission } from "@/lib/admin";

export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("orders");
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
            Order #{order.invoice_number}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <span className="font-poppins text-[13px] text-body">
              {new Date(order.created_at).toLocaleString("en-PK")}
            </span>
          </div>
        </div>
        <DeleteOrderButton
          orderId={order.id}
          invoiceNumber={order.invoice_number}
        />
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 font-poppins text-[15px] font-semibold text-ink">
          Status
        </h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
          Edit order details
        </h2>
        <OrderDetailsForm order={order} />
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 font-poppins text-[15px] font-semibold text-ink">
          Payment summary
        </h2>
        <dl className="space-y-2 font-poppins text-[13px]">
          <div className="flex justify-between">
            <dt className="text-body">Method</dt>
            <dd className="font-medium uppercase text-ink">
              {order.payment_method}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body">Subtotal</dt>
            <dd className="text-ink">
              {formatPkrCheckout(Number(order.subtotal))}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body">Shipping</dt>
            <dd className="text-ink">
              {formatPkrCheckout(Number(order.shipping_fee))}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[#f0ece8] pt-2">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="font-semibold text-ink">
              {formatPkrCheckout(Number(order.total))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
          Items
        </h2>
        <ul className="divide-y divide-[#f5f5f5]">
          {(order.order_items ?? []).map(
            (item: {
              id: string;
              title: string;
              image: string | null;
              size: string | null;
              quantity: number;
              total_price: number;
            }) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="relative size-14 overflow-hidden rounded-lg bg-[#f5f5f5]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-poppins text-[13px] font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="font-poppins text-[12px] text-body">
                    {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-poppins text-[13px] font-semibold text-ink">
                  {formatPkrCheckout(Number(item.total_price))}
                </p>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
