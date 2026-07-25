"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/auth";
import { EyeIcon, EyeOffIcon } from "@/components/site/icons";
import { ButtonSpinner } from "@/components/site/button-spinner";

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (state && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fff5f2] via-white to-[#ffeef8] px-4 py-16">
      <Link href="/" className="mb-10">
        <Image
          src="/images/logo.png"
          alt="Babies Bloomers"
          width={842}
          height={180}
          className="h-12 w-auto"
          priority
        />
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-[#f0e8e5] bg-white px-8 py-10 shadow-[0_4px_40px_rgba(243,170,155,0.15)]">
          <h1 className="mb-1 font-fredoka text-[28px] font-semibold text-ink">
            Set a new password
          </h1>
          <p className="mb-8 font-poppins text-[14px] text-body">
            Choose a strong password for your Babies Bloomers account.
          </p>

          <form action={action} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 pr-12 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-body hover:text-ink"
                >
                  {showPw ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat password"
                className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-salmon font-poppins text-[15px] font-semibold text-white transition-all hover:bg-salmon-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
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
    </main>
  );
}
