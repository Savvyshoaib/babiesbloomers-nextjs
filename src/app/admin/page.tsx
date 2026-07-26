import Link from "next/link";
import { getAdminDashboardStats } from "@/app/actions/admin";
import { formatPkrCheckout } from "@/lib/format";
import { AdminCard, StatusBadge } from "@/components/admin/admin-forms";
import { DashboardChart } from "@/components/site/dashboard-chart";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Total Orders", value: String(stats.totalOrders) },
    { label: "Revenue", value: formatPkrCheckout(stats.totalRevenue) },
    { label: "Customers", value: String(stats.totalCustomers) },
    { label: "Pending", value: String(stats.pendingOrders) },
    { label: "Products", value: String(stats.totalProducts) },
    { label: "Unread msgs", value: String(stats.unreadMessages) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          Admin Dashboard
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Manage orders, customers, catalog, and store settings from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm"
          >
            <p className="font-poppins text-[12px] font-semibold uppercase tracking-wider text-body">
              {card.label}
            </p>
            <p className="mt-3 font-fredoka text-[28px] font-bold text-ink">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <AdminCard title="Orders & revenue (6 months)">
        {stats.monthlyData.length > 0 ? (
          <DashboardChart
            data={stats.monthlyData.map((d) => ({
              month: d.month,
              orders: d.orders,
              spent: d.revenue,
            }))}
          />
        ) : (
          <p className="py-10 text-center font-poppins text-[14px] text-body">
            No order data yet.
          </p>
        )}
      </AdminCard>

      <AdminCard
        title="Recent orders"
        actions={
          <Link
            href="/admin/orders"
            className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            View all
          </Link>
        }
      >
        {stats.recentOrders.length === 0 ? (
          <p className="py-8 text-center font-poppins text-[14px] text-body">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-[#f5f5f5]">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-poppins text-[14px] font-semibold text-ink">
                    #{order.invoice_number}
                  </p>
                  <p className="mt-0.5 font-poppins text-[12px] text-body">
                    {order.shipping_email} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-PK")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-poppins text-[14px] font-semibold text-ink">
                    {formatPkrCheckout(Number(order.total))}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-lg border border-[#e0e0e0] px-3 py-1.5 font-poppins text-[12px] font-medium text-ink hover:border-salmon hover:text-salmon"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
