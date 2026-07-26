"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/app/actions/auth";
import { EyeIcon, EyeOffIcon } from "@/components/site/icons";
import { ButtonSpinner } from "@/components/site/button-spinner";

function SignInForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [showPw, setShowPw] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  useEffect(() => {
    if (state && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-poppins text-[13px] font-medium text-ink"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-[#e0e0e0] px-4 font-poppins text-[14px] text-ink placeholder:text-body transition-colors focus:border-salmon focus:outline-none focus:ring-2 focus:ring-salmon/20"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="signin-password"
            className="font-poppins text-[13px] font-medium text-ink"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-poppins text-[12px] text-salmon hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="signin-password"
            name="password"
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
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
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-salmon font-poppins text-[15px] font-semibold text-white transition-all hover:bg-salmon-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <ButtonSpinner />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

export default function SignInPage() {
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
          <h1 className="mb-1 font-fredoka text-[30px] font-semibold text-ink">
            Welcome back
          </h1>
          <p className="mb-8 font-poppins text-[14px] text-body">
            Sign in to manage your orders and invoices.
          </p>

          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-[#f5f5f5]" />}>
            <SignInForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="font-poppins text-[13px] text-body">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-salmon hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
