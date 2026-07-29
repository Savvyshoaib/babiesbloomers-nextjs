import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrder } from "@/app/actions/orders";
import { formatPkrCheckout } from "@/lib/format";
import { InvoiceDownloadBtn } from "@/components/site/invoice-download-btn";

export const revalidate = 0;

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  // Define steps for progress tracker
  const steps = ["pending", "processing", "shipped", "delivered"] as const;
  const currentStepIndex = steps.indexOf(
    order.status as (typeof steps)[number],
  );

  return (
    <div className="space-y-8">
      {/* Top back button and heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/account/orders"
            className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            ← Back to My Orders
          </Link>
          <h1 className="mt-2 font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
            Order #{order.invoice_number}
          </h1>
          <p className="mt-1 font-poppins text-[13px] text-body">
            Placed on {new Date(order.created_at).toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <InvoiceDownloadBtn order={order} className="h-11 px-5" />
      </div>

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
          <h2 className="mb-6 font-poppins text-[15px] font-semibold text-ink">
            Delivery Status:{" "}
            <span className="font-bold text-salmon uppercase">
              {order.status}
            </span>
          </h2>
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#f0ece8] z-0" />
            {/* Active line */}
            <div
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-salmon z-0 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step, idx) => {
              const active = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full border-2 transition-all ${
                      active
                        ? "border-salmon bg-salmon text-white"
                        : "border-[#e0e0e0] bg-white text-body"
                    } ${isCurrent ? "ring-4 ring-salmon/10 scale-110" : ""}`}
                  >
                    {active ? (
                      <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-[12px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 font-poppins text-[11px] font-semibold uppercase tracking-wider ${
                      active ? "text-ink" : "text-body"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Alert */}
      {order.status === "cancelled" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-left">
          <p className="font-poppins text-[14px] font-semibold text-red-700">
            🚫 Order Cancelled
          </p>
          <p className="mt-1 font-poppins text-[13px] text-red-600">
            This order was cancelled. If you believe this is an error or need assistance, please contact support.
          </p>
        </div>
      )}

      {/* Items list & Summary section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 columns: Items list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-poppins text-[16px] font-semibold text-ink">
              Items Ordered
            </h3>
            <ul className="divide-y divide-[#f5f5f5]">
              {order.order_items?.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#f0ece8] bg-white">
                    <Image
                      src={item.image || "/images/placeholder.png"}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="font-poppins text-[14px] font-semibold text-ink leading-5">
                      {item.title}
                    </p>
                    <p className="mt-1 font-poppins text-[12px] text-body">
                      Size: <span className="font-medium text-ink">{item.size || "Standard"}</span>
                    </p>
                    <p className="mt-1 font-poppins text-[12px] text-body">
                      Qty: <span className="font-medium text-ink">{item.quantity}</span> · Price:{" "}
                      <span className="font-medium text-ink">{formatPkrCheckout(item.unit_price)}</span>
                    </p>
                    {order.status === "delivered" && item.product_slug ? (
                      <Link
                        href={`/account/reviews/write?product=${encodeURIComponent(item.product_slug)}&order=${encodeURIComponent(order.id)}&item=${encodeURIComponent(item.id)}`}
                        className="mt-2 inline-flex h-8 items-center rounded-full bg-[#fff5f2] px-3 font-poppins text-[12px] font-semibold text-salmon transition-colors hover:bg-salmon hover:text-white"
                      >
                        Write a review
                      </Link>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-poppins text-[14px] font-semibold text-ink">
                    {formatPkrCheckout(item.total_price)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 1 column: Delivery & Billing Details */}
        <div className="space-y-6">
          {/* Shipping details */}
          <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
              Delivery Address
            </h3>
            <div className="font-poppins text-[13px] text-body space-y-1">
              <p className="font-semibold text-ink">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_postal || "No Postal Code"}
              </p>
              <p>{order.shipping_country}</p>
              <p className="pt-2">📞 {order.shipping_phone}</p>
              <p>✉️ {order.shipping_email}</p>
            </div>
          </div>

          {/* Payment & pricing summary */}
          <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
              Billing Summary
            </h3>
            <div className="font-poppins text-[13px] text-body space-y-3">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-semibold text-ink uppercase">
                  {order.payment_method}
                </span>
              </div>
              <div className="border-t border-[#f0ece8] pt-3 flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatPkrCheckout(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-ink">
                  {formatPkrCheckout(order.shipping_fee)}
                </span>
              </div>
              <div className="border-t border-[#e0e0e0] pt-3 flex items-baseline justify-between text-[15px] font-semibold text-ink">
                <span>Total Amount</span>
                <span className="text-[18px] text-salmon">
                  {formatPkrCheckout(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
