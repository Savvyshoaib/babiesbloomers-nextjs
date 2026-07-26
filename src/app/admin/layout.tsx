import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { fetchSiteContent } from "@/lib/site-content";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, content] = await Promise.all([
    requireAdmin(),
    fetchSiteContent(),
  ]);

  return (
    <AdminShell
      email={session.email}
      role={session.profile.role}
      permissions={session.permissions}
      logoUrl={content.branding.logo || "/images/logo.png"}
    >
      {children}
    </AdminShell>
  );
}
