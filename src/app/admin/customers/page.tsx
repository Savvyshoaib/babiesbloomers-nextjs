import Link from "next/link";
import { getAdminCustomers } from "@/app/actions/admin";
import { AdminCustomersTable } from "@/components/admin/customers-table";
import { requirePermission } from "@/lib/admin";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  await requirePermission("customers");
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
            Customers
          </h1>
          <p className="mt-1 font-poppins text-[14px] text-body">
            View registered users, roles, and purchase activity.
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-salmon px-4 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-salmon-soft"
        >
          Add customer
        </Link>
      </div>

      <AdminCustomersTable customers={customers} />
    </div>
  );
}
