import Link from "next/link";
import { getUserOrders } from "@/app/actions/orders";
import { formatPkrCheckout } from "@/lib/format";

export const revalidate = 0;

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          My Orders
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Manage, track and view invoice receipts for your recent orders.
        </p>
      </div>

      <div className="rounded-2xl border border-[#f0ece8] bg-white shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-poppins text-[14px]">
              <thead>
                <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-[#fffdfb]">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                      #{order.invoice_number}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-body">
                      {new Date(order.created_at).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-body">
                      {order.items_count
                        ? `${order.items_count} item${order.items_count === 1 ? "" : "s"}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-body uppercase">
                      {order.payment_method}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                          order.status === "delivered"
                            ? "bg-green-50 text-green-600"
                            : order.status === "cancelled"
                              ? "bg-red-50 text-red-500"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-ink">
                      {formatPkrCheckout(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e0e0e0] px-4 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon hover:bg-white"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-poppins text-[15px] text-body">
              No orders found in your account.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
