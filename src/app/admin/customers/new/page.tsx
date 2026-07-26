import Link from "next/link";
import { CreateCustomerForm } from "@/components/admin/create-customer-form";
import { requirePermission } from "@/lib/admin";

export const revalidate = 0;

export default async function NewCustomerPage() {
  const session = await requirePermission("customers");
  const canAssignStaff = session.profile.role === "admin";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/admin/customers"
          className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
        >
          ← Back to customers
        </Link>
        <h1 className="mt-2 font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Add customer
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Create a store account and optionally assign a staff role.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-6">
        <CreateCustomerForm canAssignStaff={canAssignStaff} />
      </div>
    </div>
  );
}
