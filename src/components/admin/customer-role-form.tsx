"use client";

import { updateCustomerRole } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

export function CustomerRoleForm({
  userId,
  currentRole,
  canAssignStaff,
}: {
  userId: string;
  currentRole: string;
  canAssignStaff: boolean;
}) {
  const { formAction, pending } = useAdminAction(updateCustomerRole);
  const roles: AppRole[] = canAssignStaff
    ? ["customer", "shop_manager", "admin"]
    : ["customer"];

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="userId" value={userId} />
      <div>
        <label
          htmlFor={`role-${userId}`}
          className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
        >
          Role
        </label>
        <select
          id={`role-${userId}`}
          name="role"
          defaultValue={currentRole}
          className="h-10 min-w-[160px] rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[13px] text-ink"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
          {!roles.includes(currentRole as AppRole) ? (
            <option value={currentRole}>{currentRole}</option>
          ) : null}
        </select>
      </div>
      <AdminSubmitButton pending={pending} label="Update role" />
    </form>
  );
}
