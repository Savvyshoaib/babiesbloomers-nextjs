"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/app/actions/auth";
import { ButtonSpinner } from "@/components/site/button-spinner";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
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
            Reset password
          </h1>
          <p className="mb-8 font-poppins text-[14px] text-body">
            Enter your email and we&apos;ll send a link to set a new password.
          </p>

          <form action={action} className="space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
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
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-poppins text-[13px] text-body">
            <Link href="/sign-in" className="font-semibold text-salmon hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
