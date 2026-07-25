"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/app/actions/auth";
import { EyeIcon, EyeOffIcon } from "@/components/site/icons";
import { ButtonSpinner } from "@/components/site/button-spinner";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const [showPw, setShowPw] = useState(false);

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

      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-[#f0e8e5] bg-white px-8 py-10 shadow-[0_4px_40px_rgba(243,170,155,0.15)]">
          <h1 className="mb-1 font-fredoka text-[30px] font-semibold text-ink">
            Create your account
          </h1>
          <p className="mb-8 font-poppins text-[14px] text-body">
            Join Babies Bloomers to track orders, download invoices and more.
          </p>

          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Ali"
                  className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Khan"
                  className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
              >
                Email Address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 pr-12 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
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
              <p className="mt-1.5 font-poppins text-[11px] text-body">
                Must be at least 8 characters.
              </p>
            </div>

            <label className="flex items-start gap-2 font-poppins text-[12px] text-body">
              <input
                type="checkbox"
                required
                className="mt-0.5 size-4 cursor-pointer rounded accent-salmon"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms-and-conditions" className="text-salmon hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-salmon hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-salmon font-poppins text-[15px] font-semibold text-white transition-all hover:bg-salmon-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <ButtonSpinner />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-poppins text-[13px] text-body">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-salmon hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
