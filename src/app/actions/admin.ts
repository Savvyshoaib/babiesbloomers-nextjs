"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requirePermission } from "@/lib/admin";
import { fail, ok, type ApiResponse } from "@/lib/api-response";
import { revalidateStorefront } from "@/lib/storefront-cache";
import {
  shopCategories,
  shopProducts,
  STANDARD_SHIPPING_FEE,
} from "@/lib/site-data";
import type { OrderStatus } from "@/app/actions/orders";
import { sendContactReplyEmail, sendOrderStatusEmail, sendPasswordResetEmail, sendAdminSetPasswordEmail } from "@/lib/email";
import {
  mergeSiteContent,
  validateSiteContact,
  type SiteContent,
} from "@/lib/site-content-types";
import {
  ALL_ROLES,
  isAppRole,
  mergeRolePermissions,
  type RolePermissionMap,
  ADMIN_PERMISSIONS,
  type AdminPermission,
} from "@/lib/roles";

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
export type AdminDashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  totalProducts: number;
  unreadMessages: number;
  recentOrders: {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
    shipping_email: string | null;
    created_at: string;
  }[];
  monthlyData: { month: string; orders: number; revenue: number }[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await requirePermission("dashboard");
  const admin = createAdminClient();

  const [
    { data: orders },
    { count: customerCount },
    { count: productCount },
    { count: unreadCount },
  ] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id, invoice_number, total, status, shipping_email, created_at",
      )
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    admin
      .from("products")
      .select("*", { count: "exact", head: true }),
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );
  const pendingOrders = allOrders.filter((o) =>
    ["pending", "processing"].includes(o.status),
  ).length;

  const now = new Date();
  const monthlyMap: Record<string, { orders: number; revenue: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-PK", { month: "short", year: "2-digit" });
    monthlyMap[key] = { orders: 0, revenue: 0 };
  }
  allOrders.forEach((order) => {
    const d = new Date(order.created_at);
    const key = d.toLocaleString("en-PK", { month: "short", year: "2-digit" });
    if (monthlyMap[key]) {
      monthlyMap[key].orders += 1;
      monthlyMap[key].revenue += Number(order.total || 0);
    }
  });

  return {
    totalOrders: allOrders.length,
    totalRevenue,
    totalCustomers: customerCount ?? 0,
    pendingOrders,
    totalProducts: productCount ?? 0,
    unreadMessages: unreadCount ?? 0,
    recentOrders: allOrders.slice(0, 8),
    monthlyData: Object.entries(monthlyMap).map(([month, v]) => ({
      month,
      ...v,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────
export type AdminCustomer = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  orders_count?: number;
  total_spent?: number;
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  await requirePermission("customers");
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orders } = await admin
    .from("orders")
    .select("user_id, total");

  const spentMap = new Map<string, { count: number; spent: number }>();
  (orders ?? []).forEach((o) => {
    if (!o.user_id) return;
    const cur = spentMap.get(o.user_id) ?? { count: 0, spent: 0 };
    cur.count += 1;
    cur.spent += Number(o.total || 0);
    spentMap.set(o.user_id, cur);
  });

  return ((profiles as AdminCustomer[]) ?? []).map((p) => ({
    ...p,
    orders_count: spentMap.get(p.id)?.count ?? 0,
    total_spent: spentMap.get(p.id)?.spent ?? 0,
  }));
}

export async function getAdminCustomer(id: string) {
  await requirePermission("customers");
  const admin = createAdminClient();

  const [{ data: profile }, { data: addresses }, { data: orders }] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", id).maybeSingle(),
      admin.from("addresses").select("*").eq("user_id", id),
      admin
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!profile) return null;
  return { profile, addresses: addresses ?? [], orders: orders ?? [] };
}

export async function createAdminCustomer(
  _prev: ApiResponse<{ id: string }> | undefined,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  const session = await requirePermission("customers");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "customer").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("A valid email is required.");
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }
  if (!firstName) return fail("First name is required.");
  if (!isAppRole(roleRaw)) return fail("Invalid role.");

  // Only full admins may create other admins / shop managers.
  if (roleRaw !== "customer" && session.profile.role !== "admin") {
    return fail("Only admins can assign staff roles.");
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`.trim(),
      },
    });

  if (createError || !created.user) {
    const msg = createError?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return fail("A user with this email already exists.");
    }
    return fail("Could not create user.", createError?.message);
  }

  const userId = created.user.id;
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName || null,
    phone: phone || null,
    role: roleRaw,
  });

  if (profileError) {
    return fail("User created but profile failed.", profileError.message);
  }

  revalidatePath("/admin/customers");
  return ok("Customer created.", { id: userId });
}

export async function updateCustomerRole(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await requirePermission("customers");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !isAppRole(role)) {
    return fail("Invalid role update.");
  }

  // Only full admins may assign or change staff roles.
  if (role !== "customer" && session.profile.role !== "admin") {
    return fail("Only admins can assign staff roles.");
  }

  if (userId === session.userId && role !== "admin" && session.profile.role === "admin") {
    return fail("You cannot remove your own admin role.");
  }

  const admin = createAdminClient();

  if (role !== "admin") {
    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (target?.role === "admin") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return fail("Cannot demote the last admin.");
      }
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return fail("Could not update role.", error.message);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return ok(`Role updated to ${role.replace("_", " ")}.`);
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function recoveryRedirect() {
  return `${siteUrl()}/auth/callback?next=/update-password`;
}

function generateTempPassword() {
  const chunk = () => Math.random().toString(36).slice(2, 6);
  return `Bb${chunk()}${chunk().toUpperCase()}!${Math.floor(10 + Math.random() * 89)}`;
}

export async function updateAdminCustomerProfile(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("customers");

  const userId = String(formData.get("userId") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!userId) return fail("Customer id is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("A valid email is required.");
  }
  if (!firstName) return fail("First name is required.");

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email,
    user_metadata: {
      full_name: `${firstName} ${lastName}`.trim(),
    },
  });

  if (authError) {
    const msg = authError.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
      return fail("Another account already uses this email.");
    }
    return fail("Could not update account email.", authError.message);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      email,
      first_name: firstName,
      last_name: lastName || null,
      phone: phone || null,
    })
    .eq("id", userId);

  if (profileError) {
    return fail("Could not update profile.", profileError.message);
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return ok("Customer profile updated.");
}

export async function updateAdminCustomerAddress(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("customers");

  const userId = String(formData.get("userId") ?? "").trim();
  const addressId = String(formData.get("addressId") ?? "").trim();
  const type = String(formData.get("type") ?? "shipping").trim() as
    | "shipping"
    | "billing";
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postal = String(formData.get("postal") ?? "").trim();
  const country = String(formData.get("country") ?? "Pakistan").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!userId) return fail("Customer id is required.");
  if (type !== "shipping" && type !== "billing") {
    return fail("Invalid address type.");
  }
  if (!firstName || !lastName || !address || !city || !phone) {
    return fail("Please complete all required address fields.");
  }

  const admin = createAdminClient();
  const row = {
    user_id: userId,
    type,
    first_name: firstName,
    last_name: lastName,
    address,
    city,
    postal_code: postal,
    country: country || "Pakistan",
    phone,
  };

  if (addressId) {
    const { error } = await admin.from("addresses").update(row).eq("id", addressId);
    if (error) return fail("Could not update address.", error.message);
  } else {
    const { data: existing } = await admin
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("addresses")
        .update(row)
        .eq("id", existing.id);
      if (error) return fail("Could not update address.", error.message);
    } else {
      const { error } = await admin.from("addresses").insert(row);
      if (error) return fail("Could not save address.", error.message);
    }
  }

  revalidatePath(`/admin/customers/${userId}`);
  return ok(`${type === "billing" ? "Billing" : "Shipping"} address saved.`);
}

export async function adminSendCustomerPasswordReset(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("customers");

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return fail("Customer id is required.");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name")
    .eq("id", userId)
    .maybeSingle();

  const email = String(profile?.email ?? "").trim().toLowerCase();
  if (!email) return fail("This customer has no email on file.");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: recoveryRedirect(),
    },
  });

  if (error || !data?.properties?.action_link) {
    return fail(
      "Could not generate password reset link.",
      error?.message,
    );
  }

  const mail = await sendPasswordResetEmail({
    to: email,
    resetUrl: data.properties.action_link,
  });

  if (!mail.ok) {
    return fail("Could not send reset email.", mail.error);
  }

  revalidatePath(`/admin/customers/${userId}`);
  return ok(`Password reset email sent to ${email}.`);
}

export async function adminSetCustomerPassword(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("customers");

  const userId = String(formData.get("userId") ?? "").trim();
  let password = String(formData.get("password") ?? "").trim();
  const sendEmail = formData.get("sendEmail") === "on";

  if (!userId) return fail("Customer id is required.");
  if (!password) {
    password = generateTempPassword();
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name")
    .eq("id", userId)
    .maybeSingle();

  const email = String(profile?.email ?? "").trim().toLowerCase();
  if (!email) return fail("This customer has no email on file.");

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    return fail("Could not update password.", error.message);
  }

  if (sendEmail) {
    const mail = await sendAdminSetPasswordEmail({
      to: email,
      firstName: profile?.first_name || undefined,
      password,
    });
    if (!mail.ok) {
      return fail(
        "Password updated, but email failed to send.",
        mail.error,
      );
    }
    revalidatePath(`/admin/customers/${userId}`);
    return ok(`Password updated and emailed to ${email}.`);
  }

  revalidatePath(`/admin/customers/${userId}`);
  return ok(
    `Password updated. New password: ${password} (copy now — it won’t be shown again).`,
  );
}

export async function getAdminRolePermissions(): Promise<RolePermissionMap> {
  await requirePermission("roles");
  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "role_permissions")
    .maybeSingle();
  return mergeRolePermissions(data?.value);
}

export async function saveRolePermissions(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await requirePermission("roles");
  if (session.profile.role !== "admin") {
    return fail("Only admins can edit role access.");
  }

  const next: RolePermissionMap = mergeRolePermissions({});
  for (const role of ALL_ROLES) {
    for (const key of ADMIN_PERMISSIONS) {
      const field = `${role}__${key}`;
      next[role][key as AdminPermission] = formData.get(field) === "on";
    }
  }

  // Hard locks so the control panel cannot lock out all admins.
  next.admin.dashboard = true;
  next.admin.roles = true;
  next.admin.settings = true;
  next.customer = {
    dashboard: false,
    orders: false,
    customers: false,
    products: false,
    categories: false,
    messages: false,
    content: false,
    coupons: false,
    reviews: false,
    scripts: false,
    settings: false,
    roles: false,
  };

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key: "role_permissions",
    value: next,
    updated_at: new Date().toISOString(),
  });

  if (error) return fail("Could not save role permissions.", error.message);

  revalidatePath("/admin/roles");
  revalidatePath("/admin");
  return ok("Role access updated.");
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
export async function getAdminOrders() {
  await requirePermission("orders");
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*, order_items(quantity)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((order) => ({
    ...order,
    items_count:
      order.order_items?.reduce(
        (sum: number, item: { quantity: number }) => sum + (item.quantity || 0),
        0,
      ) ?? 0,
  }));
}

export async function getAdminOrder(id: string) {
  await requirePermission("orders");
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function updateOrderStatus(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("orders");
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  const allowed: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!orderId || !allowed.includes(status)) {
    return fail("Invalid order status.");
  }

  const admin = createAdminClient();
  const { data: existing, error: fetchError } = await admin
    .from("orders")
    .select(
      "id, invoice_number, status, shipping_email, shipping_first_name, user_id",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !existing) {
    return fail("Order not found.", fetchError?.message);
  }

  if (existing.status === status) {
    return ok(`Order is already ${status}.`);
  }

  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return fail("Could not update order status.", error.message);

  if (existing.shipping_email) {
    const mail = await sendOrderStatusEmail({
      to: existing.shipping_email,
      firstName: existing.shipping_first_name || "there",
      invoiceNumber: String(existing.invoice_number),
      status,
    });
    if (!mail.ok) {
      console.error("[admin] status email failed:", mail.error);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/invoices");
  return ok(`Order marked as ${status}. Customer notified by email.`);
}

export async function updateOrderDetails(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("orders");
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return fail("Order id is required.");

  const shipping_first_name = String(
    formData.get("shipping_first_name") ?? "",
  ).trim();
  const shipping_last_name = String(
    formData.get("shipping_last_name") ?? "",
  ).trim();
  const shipping_email = String(formData.get("shipping_email") ?? "")
    .trim()
    .toLowerCase();
  const shipping_phone = String(formData.get("shipping_phone") ?? "").trim();
  const shipping_address = String(formData.get("shipping_address") ?? "").trim();
  const shipping_city = String(formData.get("shipping_city") ?? "").trim();
  const shipping_postal = String(formData.get("shipping_postal") ?? "").trim();
  const shipping_country = String(
    formData.get("shipping_country") ?? "Pakistan",
  ).trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const payment_method = String(formData.get("payment_method") ?? "").trim();
  const shipping_fee = Number(formData.get("shipping_fee") ?? 0);
  const subtotal = Number(formData.get("subtotal") ?? 0);

  if (!shipping_first_name || !shipping_email) {
    return fail("Customer name and email are required.");
  }
  if (shipping_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping_email)) {
    return fail("A valid shipping email is required.");
  }
  if (!["cod", "payfast"].includes(payment_method)) {
    return fail("Invalid payment method.");
  }
  if (!Number.isFinite(shipping_fee) || shipping_fee < 0) {
    return fail("Invalid shipping fee.");
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return fail("Invalid subtotal.");
  }

  const total = Number((subtotal + shipping_fee).toFixed(2));

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({
      shipping_first_name,
      shipping_last_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_postal,
      shipping_country: shipping_country || "Pakistan",
      notes: notes || null,
      payment_method,
      shipping_fee,
      subtotal,
      total,
    })
    .eq("id", orderId);

  if (error) return fail("Could not update order.", error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/invoices");
  return ok("Order details updated.");
}

export async function deleteOrder(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("orders");
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) return fail("Order id is required.");

  const admin = createAdminClient();
  const { data: existing, error: fetchError } = await admin
    .from("orders")
    .select("id, invoice_number")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !existing) {
    return fail("Order not found.", fetchError?.message);
  }

  const { error } = await admin.from("orders").delete().eq("id", orderId);
  if (error) return fail("Could not delete order.", error.message);

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath("/account/invoices");
  return ok(`Order #${existing.invoice_number} deleted.`);
}

export async function deleteCustomer(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await requirePermission("customers");
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return fail("Customer id is required.");

  if (userId === session.userId) {
    return fail("You cannot delete your own account.");
  }

  const admin = createAdminClient();
  const { data: target, error: fetchError } = await admin
    .from("profiles")
    .select("id, role, email")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !target) {
    return fail("Customer not found.", fetchError?.message);
  }

  if (target.role !== "customer" && session.profile.role !== "admin") {
    return fail("Only admins can delete staff accounts.");
  }

  if (target.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return fail("Cannot delete the last admin.");
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return fail("Could not delete customer.", error.message);

  revalidatePath("/admin/customers");
  revalidatePath("/admin");
  return ok(`Customer ${target.email ?? ""} deleted.`);
}

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
export type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: string;
  old_price: string | null;
  price_value: number;
  badge: string | null;
  categories: string[];
  tabs: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  status: "active" | "draft" | "archived";
  stock: number;
  description: string | null;
  product_code: string | null;
  sizes: string[];
  gallery_images: string[];
  exclusive_offers: { title: string; icon: string }[];
  additional_info: Record<string, string>;
  reviews_count: number;
  average_rating?: number;
  created_at: string;
};

export async function getAdminProducts(): Promise<AdminProduct[]> {
  await requirePermission("products");
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as AdminProduct[]) ?? [];
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  await requirePermission("products");
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as AdminProduct) ?? null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertProduct(
  _prev: ApiResponse<{ id: string }> | undefined,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  await requirePermission("products");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const image = String(formData.get("image") ?? "").trim();
  const galleryRaw = String(formData.get("galleryImages") ?? "").trim();
  const gallery_images = galleryRaw
    ? galleryRaw.split("|").map((s) => s.trim()).filter(Boolean)
    : [];
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  const salePriceRaw = String(formData.get("salePrice") ?? "").trim();
  const oldPriceValue = Number(formData.get("oldPriceValue") ?? 0);
  const salePriceValue = Number(formData.get("salePriceValue") ?? 0);
  const badge = String(formData.get("badge") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as
    | "active"
    | "draft"
    | "archived";
  const stock = Number(formData.get("stock") ?? 0);
  const productCode = String(formData.get("productCode") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isFeatured = formData.get("isFeatured") === "on";
  const isNewArrival = formData.get("isNewArrival") === "on";

  const offer1 = String(formData.get("offer1") ?? "").trim();
  const offer2 = String(formData.get("offer2") ?? "").trim();
  const offer3 = String(formData.get("offer3") ?? "").trim();
  const offer4 = String(formData.get("offer4") ?? "").trim();
  const exclusive_offers = [
    { title: offer1 || "Free shipping orders from $199", icon: "truck" },
    { title: offer2 || "Membership offers 10%, 15%, 20% off", icon: "tag" },
    { title: offer3 || "100% safe for kid", icon: "shield" },
    { title: offer4 || "Returns within 30 days", icon: "return" },
  ];

  const additional_info = {
    material: String(formData.get("material") ?? "").trim() || "Premium cotton blend",
    care:
      String(formData.get("care") ?? "").trim() ||
      "Machine wash gentle, tumble dry low",
    origin: String(formData.get("origin") ?? "").trim() || "Pakistan",
  };

  if (!title || !salePriceValue) {
    return fail("Title and sale price are required.");
  }

  const priceLabel =
    salePriceRaw ||
    `₨ ${salePriceValue.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const oldPriceLabel =
    oldPriceRaw ||
    (oldPriceValue
      ? `₨ ${oldPriceValue.toLocaleString("en-PK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "");

  const row = {
    slug,
    title,
    image: image || gallery_images[0] || null,
    price: priceLabel,
    old_price: oldPriceLabel || null,
    price_value: salePriceValue,
    badge: badge || null,
    categories: category ? [category] : [],
    tabs: isNewArrival ? ["All"] : [],
    is_featured: isFeatured,
    is_new_arrival: isNewArrival,
    status,
    stock: Number.isFinite(stock) ? stock : 0,
    description: description || null,
    product_code: productCode || null,
    sizes,
    gallery_images,
    exclusive_offers,
    additional_info,
  };

  const admin = createAdminClient();

  if (id) {
    const { error } = await admin.from("products").update(row).eq("id", id);
    if (error) return fail("Could not update product.", error.message);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidateStorefront([`/product/${slug}`]);
    return ok("Product updated.", { id });
  }

  const { data, error } = await admin
    .from("products")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    return fail("Could not create product.", error?.message);
  }

  revalidatePath("/admin/products");
  revalidateStorefront([`/product/${slug}`]);
  return ok("Product created.", { id: data.id });
}

export async function deleteProduct(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("products");
  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Product id is required.");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return fail("Could not delete product.", error.message);

  revalidatePath("/admin/products");
  revalidateStorefront(
    existing?.slug ? [`/product/${existing.slug}`] : [],
  );
  return ok("Product deleted.");
}

export async function seedCatalogFromSiteData(): Promise<ApiResponse> {
  await requirePermission("products");
  const admin = createAdminClient();

  const categoryRows = shopCategories.map((c, i) => ({
    slug: c.slug,
    label: c.label,
    sort_order: i,
    is_active: true,
  }));

  const { error: catErr } = await admin
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" });
  if (catErr) return fail("Could not seed categories.", catErr.message);

  const productRows = shopProducts.map((p) => ({
    slug: p.slug,
    title: p.title,
    image: p.image,
    price: p.price,
    old_price: p.oldPrice,
    price_value: p.priceValue,
    badge: p.badge ?? null,
    categories: p.categories,
    tabs: [],
    is_featured: false,
    is_new_arrival: Boolean(p.badge === "new"),
    status: "active" as const,
    stock: 100,
    product_code: p.slug.slice(0, 8).toUpperCase(),
    sizes: [
      "2-3 Years",
      "3-4 Years",
      "4-5 Years",
      "5-6 Years",
      "6-7 Years",
      "7-8 Years",
    ],
    gallery_images: [p.image],
    exclusive_offers: [
      { title: "Free shipping orders from $199", icon: "truck" },
      { title: "Membership offers 10%, 15%, 20% off", icon: "tag" },
      { title: "100% safe for kid", icon: "shield" },
      { title: "Returns within 30 days", icon: "return" },
    ],
    additional_info: {
      material: "Premium cotton blend",
      care: "Machine wash gentle, tumble dry low",
      origin: "Pakistan",
    },
    description:
      "Made with Cotton grown in Pakistan\nSoft, breathable fabric ideal for everyday wear and sleep\nGentle on sensitive baby skin",
  }));

  const { error: prodErr } = await admin
    .from("products")
    .upsert(productRows, { onConflict: "slug" });
  if (prodErr) return fail("Could not seed products.", prodErr.message);

  await admin.from("site_settings").upsert({
    key: "shipping_fee",
    value: STANDARD_SHIPPING_FEE,
  });

  revalidatePath("/admin/products");
  revalidateStorefront();
  return ok(
    `Catalog seeded: ${categoryRows.length} categories, ${productRows.length} products.`,
  );
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────
export type AdminCategory = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export async function getAdminCategories(): Promise<AdminCategory[]> {
  await requirePermission("categories");
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as AdminCategory[]) ?? [];
}

export async function upsertCategory(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("categories");
  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(label);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!label) return fail("Category name is required.");

  const admin = createAdminClient();
  const row = {
    slug,
    label,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: isActive,
  };

  if (id) {
    const { error } = await admin.from("categories").update(row).eq("id", id);
    if (error) return fail("Could not update category.", error.message);
  } else {
    const { error } = await admin.from("categories").insert(row);
    if (error) return fail("Could not create category.", error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidateStorefront();
  return ok(id ? "Category updated." : "Category created.");
}

export async function deleteCategory(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("categories");
  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Category id required.");

  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return fail("Could not delete category.", error.message);

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return ok("Category deleted.");
}

// ─────────────────────────────────────────────────────────────
// Settings & messages
// ─────────────────────────────────────────────────────────────
export async function getAdminSettings() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("site_settings").select("*");
  const map: Record<string, unknown> = {};
  (data ?? []).forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
}

export async function updateSiteSetting(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const key = String(formData.get("key") ?? "");
  const raw = String(formData.get("value") ?? "");
  if (!key) return fail("Setting key is required.");

  if (key === "custom_scripts" || key === "header_scripts" || key === "footer_scripts") {
    await requirePermission("scripts");
  } else if (key === "site_content") {
    await requirePermission("content");
  } else {
    await requirePermission("settings");
  }

  let value: unknown = raw;
  try {
    value = JSON.parse(raw);
  } catch {
    // keep as string/number attempt
    if (raw !== "" && !Number.isNaN(Number(raw))) value = Number(raw);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) return fail("Could not save setting.", error.message);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/scripts");
  revalidatePath("/admin/content");
  revalidateStorefront();
  return ok("Settings saved.");
}

export async function saveSiteContent(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("content");
  const raw = String(formData.get("content") ?? "");
  if (!raw) return fail("Content payload is required.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail("Invalid content JSON.");
  }

  const content = mergeSiteContent(parsed as Partial<SiteContent>);
  const contactError = validateSiteContact(content.contact);
  if (contactError) return fail(contactError);

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key: "site_content",
    value: content,
    updated_at: new Date().toISOString(),
  });

  if (error) return fail("Could not save site content.", error.message);

  revalidatePath("/admin/content");
  revalidateStorefront();
  return ok("Site content saved. Storefront updated.");
}

/** Manual purge: bust all storefront HTML/CDN cache immediately. */
export async function purgeStorefrontCache(): Promise<ApiResponse> {
  await requirePermission("settings");
  revalidateStorefront();
  return ok(
    "Storefront cache purged. Customers will see the latest version on next visit.",
  );
}

export async function getContactMessages() {
  await requirePermission("messages");
  const admin = createAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getContactMessage(id: string) {
  await requirePermission("messages");
  const admin = createAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function markMessageRead(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  await requirePermission("messages");
  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Message id required.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ is_read: true, status: "read" })
    .eq("id", id);

  if (error) return fail("Could not update message.", error.message);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  return ok("Message marked as read.");
}

export async function replyToContactMessage(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await requirePermission("messages");
  const id = String(formData.get("id") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const reply = String(formData.get("reply") ?? "").trim();

  if (!id || !subject || !reply) {
    return fail("Subject and reply message are required.");
  }
  if (subject.length > 160 || reply.length > 10_000) {
    return fail("Reply is too long.");
  }

  const admin = createAdminClient();
  const { data: query, error: queryError } = await admin
    .from("contact_messages")
    .select("id, name, email, message")
    .eq("id", id)
    .maybeSingle();

  if (queryError || !query) {
    return fail("Contact query not found.", queryError?.message);
  }

  const mail = await sendContactReplyEmail({
    to: query.email,
    name: query.name,
    subject,
    message: reply,
    originalMessage: query.message,
  });
  if (!mail.ok) {
    return fail("Email could not be sent.", mail.error);
  }

  const { error } = await admin
    .from("contact_messages")
    .update({
      is_read: true,
      status: "replied",
      reply_subject: subject,
      reply_body: reply,
      replied_at: new Date().toISOString(),
      replied_by: session.userId,
    })
    .eq("id", id);

  if (error) {
    return fail("Email sent, but reply history could not be saved.", error.message);
  }

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  return ok(`Reply emailed to ${query.email}.`);
}

export async function submitContactMessage(
  _prev: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (website) return ok("Message sent successfully.");
  if (!name || !email || !message) {
    return fail("Please fill in name, email, and message.");
  }
  if (
    name.length > 120 ||
    email.length > 254 ||
    message.length > 10_000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return fail("Please enter valid contact details.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_messages").insert({
    name,
    email,
    message,
    status: "new",
  });

  if (error) return fail("Could not send message.", error.message);
  revalidatePath("/admin/messages");
  return ok("Message sent successfully. We'll get back to you soon.");
}
