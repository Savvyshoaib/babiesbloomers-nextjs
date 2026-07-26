"use client";

import { saveRolePermissions } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import {
  ADMIN_PERMISSIONS,
  PERMISSION_LABELS,
  type RolePermissionMap,
} from "@/lib/roles";

export function RolePermissionsForm({
  permissions,
}: {
  permissions: RolePermissionMap;
}) {
  const { formAction, pending } = useAdminAction(saveRolePermissions);

  return (
    <form action={formAction} className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-[#e8e2dc] bg-white shadow-sm">
        <table className="w-full min-w-[560px] border-collapse text-left font-poppins text-[13px]">
          <thead>
            <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
              <th className="px-4 py-3 sm:px-5">Admin menu</th>
              <th className="px-4 py-3 text-center sm:px-5">Admin</th>
              <th className="px-4 py-3 text-center sm:px-5">Shop Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5]">
            {ADMIN_PERMISSIONS.map((permission) => {
              const adminName = `admin__${permission}`;
              const managerName = `shop_manager__${permission}`;
              return (
                <tr key={permission} className="hover:bg-[#fffdfb]">
                  <td className="px-4 py-3.5 font-medium text-ink sm:px-5">
                    {PERMISSION_LABELS[permission]}
                  </td>
                  <td className="px-4 py-3.5 text-center sm:px-5">
                    {/* Always on for Admin — submitted via hidden so FormData keeps them */}
                    <input type="hidden" name={adminName} value="on" />
                    <input
                      type="checkbox"
                      checked
                      disabled
                      readOnly
                      className="size-4 accent-[var(--color-salmon,#e07a5f)] opacity-60"
                      aria-label={`Admin — ${PERMISSION_LABELS[permission]} (always on)`}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center sm:px-5">
                    <input
                      type="checkbox"
                      name={managerName}
                      defaultChecked={permissions.shop_manager[permission]}
                      className="size-4 cursor-pointer accent-[var(--color-salmon,#e07a5f)]"
                      aria-label={`Shop Manager — ${PERMISSION_LABELS[permission]}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="font-poppins text-[12px] leading-5 text-body">
        Admins always have full access. Use the Shop Manager column to choose
        which menus staff can open. Customers never see the admin panel.
      </p>

      <AdminSubmitButton
        pending={pending}
        label="Save access rules"
        pendingLabel="Saving…"
      />
    </form>
  );
}
