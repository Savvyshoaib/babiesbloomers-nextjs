"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { fail, ok, type ApiResponse } from "@/lib/api-response";
import {
  sendAccountCreatedEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  product_slug: string | null;
  title: string;
  image: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Order = {
  id: string;
  invoice_number: string;
  status: OrderStatus;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  shipping_email: string | null;
  created_at: string;
  order_items?: OrderItem[];
  items_count?: number;
};

export type PlaceOrderInput = {
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  phone: string;
  paymentMethod: "cod" | "payfast";
  subtotal: number;
  shippingFee: number;
  total: number;
  items: {
    slug: string;
    title: string;
    image: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  /** Guest checkout email notifications */
  notify?: {
    isNewAccount: boolean;
    temporaryPassword?: string;
  };
  /** Persist delivery address for next checkout */
  saveInfo?: boolean;
};

export type PlaceOrderData = {
  orderId: string;
  invoiceNumber: string;
};

async function nextInvoiceNumber(admin: ReturnType<typeof createAdminClient>) {
  const { data, error } = await admin.rpc("next_invoice_number");
  if (!error && typeof data === "string" && data.length > 0) {
    return data;
  }

  // Fallback if migration not applied yet
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `BB-${yyyymm}-${rand}`;
}

async function claimGuestOrders(userId: string, email: string) {
  try {
    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ user_id: userId })
      .ilike("shipping_email", email)
      .is("user_id", null);
  } catch {
    // Service role missing — fall back to authenticated client + RLS claim policy
    const supabase = await createClient();
    await supabase
      .from("orders")
      .update({ user_id: userId })
      .eq("shipping_email", email)
      .is("user_id", null);
  }
}

// ─────────────────────────────────────────────────────────────
// Place order (checkout)
// ─────────────────────────────────────────────────────────────
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<ApiResponse<PlaceOrderData>> {
  if (!input.items?.length) {
    return fail("Your cart is empty.");
  }
  if (!input.email?.trim()) {
    return fail("Email is required.");
  }
  if (
    !input.firstName?.trim() ||
    !input.lastName?.trim() ||
    !input.address?.trim() ||
    !input.city?.trim() ||
    !input.phone?.trim()
  ) {
    return fail("Please complete all required delivery fields.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return fail(
      "Server configuration error. Please contact support.",
      "Missing SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  let userId = input.userId || null;
  if (!userId) {
    const session = await getSession();
    userId = session?.userId ?? null;
  }

  const invoiceNumber = await nextInvoiceNumber(admin);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      invoice_number: invoiceNumber,
      status: "pending",
      payment_method: input.paymentMethod,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      total: input.total,
      shipping_first_name: input.firstName,
      shipping_last_name: input.lastName,
      shipping_address: input.address,
      shipping_city: input.city,
      shipping_postal: input.postal,
      shipping_country: input.country,
      shipping_phone: input.phone,
      shipping_email: input.email.trim().toLowerCase(),
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return fail(
      "Could not place your order. Please try again.",
      orderError?.message,
    );
  }

  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    product_slug: item.slug,
    title: item.title,
    image: item.image,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(itemRows);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    // Roll back incomplete order
    await admin.from("orders").delete().eq("id", order.id);
    return fail(
      "Could not save order items. Please try again.",
      itemsError.message,
    );
  }

  // Persist shipping address only when user opted to save
  if (userId && input.saveInfo) {
    const { data: existing } = await admin
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "shipping")
      .maybeSingle();

    const addressRow = {
      user_id: userId,
      type: "shipping" as const,
      first_name: input.firstName,
      last_name: input.lastName,
      address: input.address,
      city: input.city,
      postal_code: input.postal,
      country: input.country,
      phone: input.phone,
    };

    if (existing) {
      await admin.from("addresses").update(addressRow).eq("id", existing.id);
    } else {
      await admin.from("addresses").insert(addressRow);
    }

    // Keep profile phone in sync when saving checkout info
    await admin
      .from("profiles")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      })
      .eq("id", userId);
  }

  const email = input.email.trim().toLowerCase();

  // 1) Account credentials email (new guest accounts only)
  if (input.notify?.isNewAccount && input.notify.temporaryPassword) {
    const accountMail = await sendAccountCreatedEmail({
      to: email,
      firstName: input.firstName,
      email,
      password: input.notify.temporaryPassword,
    });
    if (!accountMail.ok) {
      console.error("Account email failed:", accountMail.error);
    }
  }

  // 2) Order confirmation email (always)
  const orderMail = await sendOrderConfirmationEmail({
    to: email,
    firstName: input.firstName,
    invoiceNumber,
    paymentMethod: input.paymentMethod,
    subtotal: input.subtotal,
    shippingFee: input.shippingFee,
    total: input.total,
    items: input.items.map((item) => ({
      title: item.title,
      size: item.size,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    })),
    shippingAddress: input.address,
    shippingCity: input.city,
    shippingPhone: input.phone,
  });
  if (!orderMail.ok) {
    console.error("Order confirmation email failed:", orderMail.error);
  }

  revalidatePath("/account/orders");
  revalidatePath("/account/invoices");
  revalidatePath("/account");

  return ok("Order confirmed.", {
    orderId: order.id,
    invoiceNumber,
  });
}

// ─────────────────────────────────────────────────────────────
// Get orders for current user
// ─────────────────────────────────────────────────────────────
export async function getUserOrders(): Promise<Order[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createClient();
  await claimGuestOrders(session.userId, session.email);

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(quantity)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return ((data as Order[]) ?? []).map((order) => ({
    ...order,
    items_count:
      order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ??
      0,
  }));
}

// ─────────────────────────────────────────────────────────────
// Get single order with items
// ─────────────────────────────────────────────────────────────
export async function getOrder(id: string): Promise<Order | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createClient();
  await claimGuestOrders(session.userId, session.email);

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", session.userId)
    .single();

  return (data as Order) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Dashboard stats
// ─────────────────────────────────────────────────────────────
export type DashboardStats = {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
  recentOrders: Order[];
  monthlyData: { month: string; orders: number; spent: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
    recentOrders: [],
    monthlyData: [],
  };

  const session = await getSession();
  if (!session) return empty;

  const supabase = await createClient();
  await claimGuestOrders(session.userId, session.email);

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const allOrders = (orders as Order[]) ?? [];
  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const activeOrders = allOrders.filter((o) =>
    ["pending", "processing", "shipped"].includes(o.status),
  ).length;
  const recentOrders = allOrders.slice(0, 5);

  const now = new Date();
  const monthlyMap: Record<string, { orders: number; spent: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-PK", { month: "short", year: "2-digit" });
    monthlyMap[key] = { orders: 0, spent: 0 };
  }

  allOrders.forEach((order) => {
    const d = new Date(order.created_at);
    const key = d.toLocaleString("en-PK", { month: "short", year: "2-digit" });
    if (monthlyMap[key]) {
      monthlyMap[key].orders += 1;
      monthlyMap[key].spent += Number(order.total);
    }
  });

  const monthlyData = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    ...v,
  }));

  return { totalOrders, totalSpent, activeOrders, recentOrders, monthlyData };
}

// ─────────────────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────────────────
export async function getUserInvoices(): Promise<Order[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createClient();
  await claimGuestOrders(session.userId, session.email);

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return (data as Order[]) ?? [];
}
