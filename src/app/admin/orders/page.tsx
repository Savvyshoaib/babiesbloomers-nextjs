import { getAdminOrders } from "@/app/actions/admin";
import { AdminOrdersTable } from "@/components/admin/orders-table";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink">
          Orders
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          View and update every customer order.
        </p>
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}
