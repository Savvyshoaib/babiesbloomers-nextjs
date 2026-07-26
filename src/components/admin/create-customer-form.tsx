"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAdminCustomer } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

export function CreateCustomerForm({
  canAssignStaff,
}: {
  canAssignStaff: boolean;
}) {
  const router = useRouter();
  const { formAction, pending, state } = useAdminAction(createAdminCustomer);

  useEffect(() => {
    if (state?.success && state.data?.id) {
      router.push(`/admin/customers/${state.data.id}`);
    }
  }, [state, router]);

  const roles: AppRole[] = canAssignStaff
    ? ["customer", "shop_manager", "admin"]
    : ["customer"];

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon"
          />
          <p className="mt-1 font-poppins text-[11px] text-body">
            Minimum 8 characters. Share this with the user securely.
          </p>
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="role"
          className="mb-1.5 block font-poppins text-[12px] font-medium text-ink"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="customer"
          className="h-11 w-full rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[14px] text-ink outline-none focus:border-salmon sm:max-w-xs"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      <AdminSubmitButton
        pending={pending}
        label="Create customer"
        pendingLabel="Creating…"
      />
    </form>
  );
}
