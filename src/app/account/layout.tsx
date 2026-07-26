import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AccountShell } from "@/components/site/account-shell";
import { OrdersRealtimeSync } from "@/components/site/orders-realtime-sync";
import type { ReactNode } from "react";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <>
      <OrdersRealtimeSync userId={session.userId} />
      <AccountShell email={session.email}>{children}</AccountShell>
    </>
  );
}
