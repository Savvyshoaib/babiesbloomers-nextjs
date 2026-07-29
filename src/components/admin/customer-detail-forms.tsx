"use client";

import {
  adminSendCustomerPasswordReset,
  adminSetCustomerPassword,
  updateAdminCustomerAddress,
  updateAdminCustomerProfile,
} from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

type AddressRow = {
  id: string;
  type: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone: string | null;
};

export function CustomerProfileEditForm({
  profile,
}: {
  profile: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
}) {
  const { formAction, pending } = useAdminAction(updateAdminCustomerProfile);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={profile.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            First name
          </label>
          <input
            name="firstName"
            required
            defaultValue={profile.first_name ?? ""}
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Last name
          </label>
          <input
            name="lastName"
            defaultValue={profile.last_name ?? ""}
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            defaultValue={profile.email ?? ""}
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>
      </div>
      <AdminSubmitButton pending={pending} label="Save profile" />
    </form>
  );
}

export function CustomerPasswordActions({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const resetAction = useAdminAction(adminSendCustomerPasswordReset);
  const setAction = useAdminAction(adminSetCustomerPassword);

  return (
    <div className="space-y-4">
      <form
        action={resetAction.formAction}
        className="rounded-xl border border-[#f0ece8] bg-[#fafafa] p-4"
      >
        <input type="hidden" name="userId" value={userId} />
        <h3 className="font-poppins text-[13px] font-semibold text-ink">
          Send reset password email
        </h3>
        <p className="mt-1 font-poppins text-[12px] text-body">
          Emails a secure reset link to {email || "the customer"}. They choose
          their own new password.
        </p>
        <div className="mt-3">
          <AdminSubmitButton
            pending={resetAction.pending}
            label="Send reset email"
            pendingLabel="Sending…"
          />
        </div>
      </form>

      <form
        action={setAction.formAction}
        className="rounded-xl border border-[#f0ece8] bg-[#fafafa] p-4 space-y-3"
      >
        <input type="hidden" name="userId" value={userId} />
        <h3 className="font-poppins text-[13px] font-semibold text-ink">
          Set new password
        </h3>
        <p className="font-poppins text-[12px] text-body">
          Leave blank to auto-generate a temporary password. Optionally email
          it to the customer.
        </p>
        <div>
          <label className="mb-1.5 block font-poppins text-[12px] font-medium text-ink">
            New password (optional)
          </label>
          <input
            name="password"
            type="text"
            minLength={8}
            placeholder="Auto-generate if empty"
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>
        <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
          <input
            type="checkbox"
            name="sendEmail"
            defaultChecked
            className="size-4 accent-salmon"
          />
          Email new password to customer
        </label>
        <AdminSubmitButton
          pending={setAction.pending}
          label="Update password"
          pendingLabel="Updating…"
        />
      </form>
    </div>
  );
}

export function CustomerAddressEditForm({
  userId,
  address,
  type,
}: {
  userId: string;
  address?: AddressRow | null;
  type: "shipping" | "billing";
}) {
  const { formAction, pending } = useAdminAction(updateAdminCustomerAddress);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="addressId" value={address?.id ?? ""} />
      <input type="hidden" name="type" value={type} />
      <p className="font-poppins text-[12px] font-semibold uppercase tracking-wide text-ink">
        {type}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="firstName"
          required
          defaultValue={address?.first_name ?? ""}
          placeholder="First name"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="lastName"
          required
          defaultValue={address?.last_name ?? ""}
          placeholder="Last name"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="address"
          required
          defaultValue={address?.address ?? ""}
          placeholder="Address"
          className="h-10 sm:col-span-2 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="city"
          required
          defaultValue={address?.city ?? ""}
          placeholder="City"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="postal"
          defaultValue={address?.postal_code ?? ""}
          placeholder="Postal code"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="country"
          defaultValue={address?.country || "Pakistan"}
          placeholder="Country"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <input
          name="phone"
          required
          defaultValue={address?.phone ?? ""}
          placeholder="Phone"
          className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
      </div>
      <AdminSubmitButton
        pending={pending}
        label={`Save ${type} address`}
      />
    </form>
  );
}
