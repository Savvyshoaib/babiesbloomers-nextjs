"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import type { ApiResponse } from "@/lib/api-response";
import { ButtonSpinner } from "@/components/site/button-spinner";

export function useAdminAction<T = void>(
  action: (
    prev: ApiResponse<T> | undefined,
    formData: FormData,
  ) => Promise<ApiResponse<T>>,
) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  return { state, formAction, pending };
}

export function AdminSubmitButton({
  pending,
  label,
  pendingLabel = "Saving…",
  className = "",
  variant = "salmon",
}: {
  pending: boolean;
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: "salmon" | "ink" | "danger" | "outline";
}) {
  const variants = {
    salmon: "bg-salmon text-white hover:bg-salmon-soft",
    ink: "bg-ink text-white hover:bg-ink/90",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline:
      "border border-[#e0e0e0] bg-white text-ink hover:border-salmon hover:text-salmon",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 font-poppins text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending ? (
        <>
          <ButtonSpinner />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "delivered"
      ? "bg-green-50 text-green-600"
      : status === "cancelled"
        ? "bg-red-50 text-red-500"
        : status === "shipped"
          ? "bg-blue-50 text-blue-600"
          : status === "processing"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${styles}`}
    >
      {status}
    </span>
  );
}

export function AdminCard({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-poppins text-[15px] font-semibold text-ink">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
