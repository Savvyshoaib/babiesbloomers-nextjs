"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile, upsertAddress, changePassword } from "@/app/actions/auth";
import { ButtonSpinner } from "@/components/site/button-spinner";
import type { ApiResponse } from "@/lib/api-response";

type Address = {
  id: string;
  type: "shipping" | "billing";
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
};

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

interface SettingsFormsProps {
  profile: Profile | null;
  addresses: Address[];
}

function useToastOnResult(state: ApiResponse | undefined) {
  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
}

export function SettingsForms({ profile, addresses }: SettingsFormsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "shipping" | "billing">(
    "profile",
  );

  const initialShipping = addresses.find((a) => a.type === "shipping");
  const initialBilling = addresses.find((a) => a.type === "billing");

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    undefined,
  );
  const [shippingState, shippingAction, shippingPending] = useActionState(
    upsertAddress,
    undefined,
  );
  const [billingState, billingAction, billingPending] = useActionState(
    upsertAddress,
    undefined,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    undefined,
  );

  useToastOnResult(profileState);
  useToastOnResult(shippingState);
  useToastOnResult(billingState);
  useToastOnResult(passwordState);

  return (
    <div className="space-y-8">
      <div className="flex border-b border-[#f0ece8]">
        {(
          [
            { id: "profile", label: "Profile details" },
            { id: "shipping", label: "Shipping details" },
            { id: "billing", label: "Billing details" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer px-5 pb-3 font-poppins text-[14px] font-semibold transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-salmon text-salmon"
                : "border-transparent text-body hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-fredoka text-[22px] font-semibold text-ink">
            Profile Details
          </h2>
          <p className="mb-6 font-poppins text-[13px] text-body">
            Update your account personal information and contact details.
          </p>

          <form action={profileAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  defaultValue={profile?.first_name ?? ""}
                  className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  defaultValue={profile?.last_name ?? ""}
                  className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="e.g., +92 300 1234567"
                className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
              />
            </div>

            <button
              type="submit"
              disabled={profilePending}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profilePending ? (
                <>
                  <ButtonSpinner />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-[#f0ece8] pt-8">
            <h3 className="mb-1 font-fredoka text-[20px] font-semibold text-ink">
              Change Password
            </h3>
            <p className="mb-6 font-poppins text-[13px] text-body">
              Update your password to keep your account secure.
            </p>

            <form action={passwordAction} className="space-y-4" key={passwordState?.success ? "pw-ok" : "pw-form"}>
              <div>
                <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
                />
              </div>

              <button
                type="submit"
                disabled={passwordPending}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordPending ? (
                  <>
                    <ButtonSpinner />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "shipping" && (
        <AddressForm
          type="shipping"
          title="Shipping Address"
          description="Configure your default delivery address for faster checkout."
          action={shippingAction}
          pending={shippingPending}
          defaults={initialShipping}
        />
      )}

      {activeTab === "billing" && (
        <AddressForm
          type="billing"
          title="Billing Address"
          description="Configure your primary billing and invoice destination defaults."
          action={billingAction}
          pending={billingPending}
          defaults={initialBilling}
        />
      )}
    </div>
  );
}

function AddressForm({
  type,
  title,
  description,
  action,
  pending,
  defaults,
}: {
  type: "shipping" | "billing";
  title: string;
  description: string;
  action: (payload: FormData) => void;
  pending: boolean;
  defaults?: Address;
}) {
  return (
    <div className="rounded-2xl border border-[#f0ece8] bg-white p-6 shadow-sm">
      <h2 className="mb-1 font-fredoka text-[22px] font-semibold text-ink">
        {title}
      </h2>
      <p className="mb-6 font-poppins text-[13px] text-body">{description}</p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="type" value={type} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              required
              defaultValue={defaults?.first_name ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              required
              defaultValue={defaults?.last_name ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Street Address
          </label>
          <input
            name="address"
            type="text"
            required
            defaultValue={defaults?.address ?? ""}
            className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              City
            </label>
            <input
              name="city"
              type="text"
              required
              defaultValue={defaults?.city ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Postal Code
            </label>
            <input
              name="postal"
              type="text"
              defaultValue={defaults?.postal_code ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Country
            </label>
            <select
              name="country"
              defaultValue={defaults?.country ?? "Pakistan"}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            >
              <option>Pakistan</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={defaults?.phone ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/25"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : (
            "Save address"
          )}
        </button>
      </form>
    </div>
  );
}
