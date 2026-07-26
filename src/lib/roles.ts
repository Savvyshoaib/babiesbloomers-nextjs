export const STAFF_ROLES = ["admin", "shop_manager"] as const;
export const ALL_ROLES = ["customer", "admin", "shop_manager"] as const;

export type AppRole = (typeof ALL_ROLES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "dashboard",
  "orders",
  "customers",
  "products",
  "categories",
  "messages",
  "content",
  "scripts",
  "settings",
  "roles",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type RolePermissionMap = Record<
  AppRole,
  Record<AdminPermission, boolean>
>;

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  customers: "Customers",
  products: "Products",
  categories: "Categories",
  messages: "Contact Queries",
  content: "Content",
  scripts: "Scripts",
  settings: "Settings",
  roles: "Roles & Access",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "Customer",
  admin: "Admin",
  shop_manager: "Shop Manager",
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  admin: {
    dashboard: true,
    orders: true,
    customers: true,
    products: true,
    categories: true,
    messages: true,
    content: true,
    scripts: true,
    settings: true,
    roles: true,
  },
  shop_manager: {
    dashboard: true,
    orders: true,
    customers: true,
    products: true,
    categories: true,
    messages: true,
    content: true,
    scripts: false,
    settings: false,
    roles: false,
  },
  customer: {
    dashboard: false,
    orders: false,
    customers: false,
    products: false,
    categories: false,
    messages: false,
    content: false,
    scripts: false,
    settings: false,
    roles: false,
  },
};

export function isAppRole(value: string): value is AppRole {
  return (ALL_ROLES as readonly string[]).includes(value);
}

export function isStaffRole(value: string | null | undefined): boolean {
  return value === "admin" || value === "shop_manager";
}

export function mergeRolePermissions(
  raw: unknown,
): RolePermissionMap {
  const base: RolePermissionMap = structuredClone(DEFAULT_ROLE_PERMISSIONS);
  if (!raw || typeof raw !== "object") return base;

  const source = raw as Record<string, Record<string, unknown>>;
  for (const role of ALL_ROLES) {
    const row = source[role];
    if (!row || typeof row !== "object") continue;
    for (const key of ADMIN_PERMISSIONS) {
      if (typeof row[key] === "boolean") {
        base[role][key] = row[key];
      }
    }
  }

  // Full admin always keeps roles + settings so access cannot be locked out.
  base.admin.roles = true;
  base.admin.settings = true;
  base.admin.dashboard = true;

  return base;
}

export function roleHasPermission(
  map: RolePermissionMap,
  role: string | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role || !isAppRole(role)) return false;
  if (role === "admin") return true;
  return Boolean(map[role]?.[permission]);
}

export function roleCanAccessAdmin(
  map: RolePermissionMap,
  role: string | null | undefined,
): boolean {
  if (!role || !isAppRole(role)) return false;
  if (role === "admin") return true;
  return ADMIN_PERMISSIONS.some((key) => map[role][key]);
}

/** Map admin routes to the permission that unlocks them. */
export function permissionForAdminPath(
  pathname: string,
): AdminPermission | null {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/customers")) return "customers";
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/messages")) return "messages";
  if (pathname.startsWith("/admin/content")) return "content";
  if (pathname.startsWith("/admin/scripts")) return "scripts";
  if (pathname.startsWith("/admin/settings")) return "settings";
  if (pathname.startsWith("/admin/roles")) return "roles";
  return null;
}
