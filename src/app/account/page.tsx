import Link from "next/link";
import { getDashboardStats } from "@/app/actions/orders";
import { DashboardChart } from "@/components/site/dashboard-chart";
import { formatPkrCheckout } from "@/lib/format";
import {
  TrendingUpIcon,
  PackageIcon,
  ChevronRightIcon,
} from "@/components/site/icons";

export const revalidate = 0;

export default async function AccountPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          Dashboard
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Welcome to your account control center. Track your orders, check billing details, and retrieve invoices.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Stat 1 */}
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-poppins text-[13px] font-semibold uppercase tracking-wider text-body">
              Total Orders
            </span>
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <PackageIcon className="size-5" />
            </span>
          </div>
          <p className="mt-4 font-fredoka text-[32px] font-bold text-ink">
            {stats.totalOrders}
          </p>
          <p className="mt-1 font-poppins text-[12px] text-body">
            Orders placed so far
          </p>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-poppins text-[13px] font-semibold uppercase tracking-wider text-body">
              Total Spent
            </span>
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <TrendingUpIcon className="size-5" />
            </span>
          </div>
          <p className="mt-4 font-fredoka text-[32px] font-bold text-ink">
            {formatPkrCheckout(stats.totalSpent)}
          </p>
          <p className="mt-1 font-poppins text-[12px] text-body">
            Total lifetime value
          </p>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-poppins text-[13px] font-semibold uppercase tracking-wider text-body">
              Active Orders
            </span>
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-4 font-fredoka text-[32px] font-bold text-ink">
            {stats.activeOrders}
          </p>
          <p className="mt-1 font-poppins text-[12px] text-body">
            Currently in transit/processing
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-poppins text-[16px] font-semibold text-ink">
          Spending & Ordering History
        </h2>
        {stats.monthlyData.length > 0 ? (
          <DashboardChart data={stats.monthlyData} />
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center text-center">
            <p className="font-poppins text-[14px] text-body">
              No ordering history found to generate charts.
            </p>
            <Link
              href="/shop"
              className="mt-4 font-poppins text-[13px] font-semibold text-salmon hover:underline"
            >
              Start shopping to populate analytics!
            </Link>
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-poppins text-[16px] font-semibold text-ink">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            View all orders <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        {stats.recentOrders.length > 0 ? (
          <div className="divide-y divide-[#f5f5f5]">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-poppins text-[14px] font-semibold text-ink">
                    Invoice #{order.invoice_number}
                  </p>
                  <p className="mt-1 font-poppins text-[12px] text-body">
                    Placed on {new Date(order.created_at).toLocaleDateString()} ·{" "}
                    {order.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-poppins text-[14px] font-semibold text-ink">
                      {formatPkrCheckout(order.total)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                        order.status === "delivered"
                          ? "bg-green-50 text-green-600"
                          : order.status === "cancelled"
                            ? "bg-red-50 text-red-500"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex h-9 items-center justify-center rounded-lg border border-[#e0e0e0] px-4 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="font-poppins text-[14px] text-body">
              No orders placed yet.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-salmon px-6 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-salmon-soft"
            >
              Shop Our Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
