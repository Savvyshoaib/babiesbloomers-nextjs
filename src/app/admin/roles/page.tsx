import Link from "next/link";
import { getAdminRolePermissions } from "@/app/actions/admin";
import { RolePermissionsForm } from "@/components/admin/role-permissions-form";
import { requirePermission } from "@/lib/admin";

export const revalidate = 0;

export default async function AdminRolesPage() {
  await requirePermission("roles");
  const permissions = await getAdminRolePermissions();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Roles & Access
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Choose which admin menus each staff role can open. Customers stay
          storefront-only.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-[#fffdfb] p-4 sm:p-5">
        <p className="font-poppins text-[13px] leading-6 text-body">
          Tip: give Shop Managers Orders, Products, Categories, and Contact
          Queries. Keep Scripts, Settings, and Roles limited to Admins.
        </p>
        <Link
          href="/admin/customers"
          className="mt-2 inline-block font-poppins text-[13px] font-semibold text-salmon hover:underline"
        >
          Assign roles to users →
        </Link>
      </div>

      <RolePermissionsForm permissions={permissions} />
    </div>
  );
}
