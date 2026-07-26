"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function DeleteCustomerButton({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const router = useRouter();
  const { formAction, pending, state } = useAdminAction(deleteCustomer);

  useEffect(() => {
    if (state?.success) router.push("/admin/customers");
  }, [state, router]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete ${email ?? "this customer"}? Their account and profile will be removed. Orders will stay but become unlinked.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <AdminSubmitButton
        pending={pending}
        label="Delete customer"
        pendingLabel="Deleting…"
        variant="danger"
      />
    </form>
  );
}
