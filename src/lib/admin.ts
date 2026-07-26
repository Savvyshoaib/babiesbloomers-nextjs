import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mergeRolePermissions,
  roleCanAccessAdmin,
  roleHasPermission,
  type AdminPermission,
  type AppRole,
  type RolePermissionMap,
} from "@/lib/roles";

export type AdminProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: AppRole | string;
};

export async function getRolePermissions(): Promise<RolePermissionMap> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "role_permissions")
    .maybeSingle();
  return mergeRolePermissions(data?.value);
}

/**
 * Ensures the current session can open the admin panel (any staff role with access).
 */
export async function requireAdmin(): Promise<
  SessionPayload & { profile: AdminProfile; permissions: RolePermissionMap }
> {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  const admin = createAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .eq("id", session.userId)
    .maybeSingle();

  const bootstrap = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (
    bootstrap &&
    session.email.toLowerCase() === bootstrap &&
    profile &&
    profile.role !== "admin"
  ) {
    await admin
      .from("profiles")
      .update({ role: "admin", email: session.email })
      .eq("id", session.userId);
    profile = { ...profile, role: "admin", email: session.email };
  }

  const permissions = await getRolePermissions();

  if (!profile || !roleCanAccessAdmin(permissions, profile.role)) {
    redirect("/account");
  }

  return {
    ...session,
    profile: profile as AdminProfile,
    permissions,
  };
}

/** Ensures the current user has a specific admin permission. */
export async function requirePermission(
  permission: AdminPermission,
): Promise<
  SessionPayload & { profile: AdminProfile; permissions: RolePermissionMap }
> {
  const session = await requireAdmin();
  if (
    !roleHasPermission(session.permissions, session.profile.role, permission)
  ) {
    redirect("/admin");
  }
  return session;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("role")
      .eq("id", session.userId)
      .maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function isCurrentUserStaff(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  try {
    const admin = createAdminClient();
    const [{ data: profile }, permissions] = await Promise.all([
      admin
        .from("profiles")
        .select("role")
        .eq("id", session.userId)
        .maybeSingle(),
      getRolePermissions(),
    ]);
    return roleCanAccessAdmin(permissions, profile?.role);
  } catch {
    return false;
  }
}
