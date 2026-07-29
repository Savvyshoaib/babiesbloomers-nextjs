import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/app/actions/admin";
import { formatPkrCheckout } from "@/lib/format";
import { StatusBadge } from "@/components/admin/admin-forms";
import { CustomerRoleForm } from "@/components/admin/customer-role-form";
import {
  CustomerAddressEditForm,
  CustomerPasswordActions,
  CustomerProfileEditForm,
} from "@/components/admin/customer-detail-forms";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import { requirePermission } from "@/lib/admin";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

export const revalidate = 0;

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("customers");
  const { id } = await params;
  const data = await getAdminCustomer(id);
  if (!data) notFound();

  const { profile, addresses, orders } = data;
  const canAssignStaff = session.profile.role === "admin";
  const canDelete =
    profile.id !== session.userId &&
    (profile.role === "customer" || session.profile.role === "admin");
  const roleLabel =
    ROLE_LABELS[profile.role as AppRole] ?? String(profile.role);

  const shipping = addresses.find(
    (a: { type: string }) => a.type === "shipping",
  );
  const billing = addresses.find(
    (a: { type: string }) => a.type === "billing",
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            ← Back to customers
          </Link>
          <h1 className="mt-2 font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
            {[profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
              profile.email ||
              "Customer"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="font-poppins text-[14px] text-body">{profile.email}</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-poppins text-[11px] font-semibold uppercase text-slate-600">
              {roleLabel}
            </span>
          </div>
          <p className="mt-1 font-poppins text-[12px] text-body">
            Joined {new Date(profile.created_at).toLocaleDateString("en-PK")}
          </p>
        </div>
        {canDelete ? (
          <DeleteCustomerButton userId={profile.id} email={profile.email} />
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
            Profile details
          </h2>
          <CustomerProfileEditForm profile={profile} />
          <div className="mt-5 border-t border-[#f0ece8] pt-4">
            <CustomerRoleForm
              userId={profile.id}
              currentRole={profile.role}
              canAssignStaff={canAssignStaff}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
            Password
          </h2>
          <CustomerPasswordActions
            userId={profile.id}
            email={profile.email}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
            Shipping address
          </h2>
          <CustomerAddressEditForm
            userId={profile.id}
            address={shipping ?? null}
            type="shipping"
          />
        </div>
        <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
            Billing address
          </h2>
          <CustomerAddressEditForm
            userId={profile.id}
            address={billing ?? null}
            type="billing"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 font-poppins text-[15px] font-semibold text-ink">
          Order history
        </h2>
        {orders.length === 0 ? (
          <p className="font-poppins text-[13px] text-body">No orders.</p>
        ) : (
          <div className="divide-y divide-[#f5f5f5]">
            {orders.map(
              (order: {
                id: string;
                invoice_number: string;
                status: string;
                total: number;
                created_at: string;
              }) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-poppins text-[14px] font-semibold text-ink">
                      #{order.invoice_number}
                    </p>
                    <p className="font-poppins text-[12px] text-body">
                      {new Date(order.created_at).toLocaleDateString("en-PK")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-poppins text-[13px] font-semibold text-ink">
                      {formatPkrCheckout(Number(order.total))}
                    </span>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-poppins text-[12px] font-semibold text-salmon hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
