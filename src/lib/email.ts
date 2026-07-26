import "server-only";
import nodemailer from "nodemailer";
import { formatPkrCheckout } from "@/lib/format";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function fromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "Babies Bloomers <noreply@babiesbloomers.com>"
  );
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function emailShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Poppins,Arial,Helvetica,sans-serif;color:#727272;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf9f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #f0ece8;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#f3aa9b,#ffa6ca);padding:28px 32px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">Babies Bloomers</div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.92);">Soft essentials for little ones</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #f0ece8;text-align:center;font-size:12px;line-height:18px;color:#999;">
              Need help? Email
              <a href="mailto:orders@babiesbloomers.com" style="color:#f3aa9b;text-decoration:none;">orders@babiesbloomers.com</a><br />
              © ${new Date().getFullYear()} Babies Bloomers. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type OrderEmailItem = {
  title: string;
  size: string;
  quantity: number;
  totalPrice: number;
};

export type OrderEmailPayload = {
  to: string;
  firstName: string;
  invoiceNumber: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderEmailItem[];
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
};

export type AccountEmailPayload = {
  to: string;
  firstName: string;
  email: string;
  password: string;
};

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transporter = createTransport();
  if (!transporter) {
    console.error(
      "[email] SMTP config missing (SMTP_HOST / SMTP_USER / SMTP_PASS) — not sent:",
      opts.subject,
    );
    return { ok: false, error: "Missing SMTP configuration" };
  }

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMTP send failed";
    console.error("[email] SMTP error:", message);
    return { ok: false, error: message };
  }
}

export async function sendAccountCreatedEmail(
  payload: AccountEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const loginUrl = `${siteUrl()}/sign-in`;
  const name = payload.firstName || "there";

  const html = emailShell(
    "Your Babies Bloomers account",
    `
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:#121b28;">Welcome, ${escapeHtml(name)}!</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
      Your account has been created automatically after your order. Use the credentials below to sign in and track orders, invoices, and shipping details.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff5f2;border:1px solid #f0d4cc;border-radius:12px;margin:0 0 20px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#999;">Login details</p>
          <p style="margin:0 0 8px;font-size:14px;color:#121b28;"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p style="margin:0;font-size:14px;color:#121b28;"><strong>Password:</strong> <span style="font-family:ui-monospace,Consolas,monospace;background:#fff;border:1px solid #f0d4cc;border-radius:6px;padding:4px 8px;">${escapeHtml(payload.password)}</span></p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 22px;font-size:13px;line-height:20px;color:#727272;">
      For your security, we recommend changing this password after you sign in (Settings → or Forgot password).
    </p>
    <a href="${loginUrl}" style="display:inline-block;background:#f3aa9b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">
      Sign in to your account
    </a>
    `,
  );

  return sendMail({
    to: payload.to,
    subject: "Your Babies Bloomers account is ready",
    html,
  });
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const ordersUrl = `${siteUrl()}/account/orders`;
  const name = payload.firstName || "there";
  const itemsHtml = payload.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#121b28;">
          ${escapeHtml(item.title)}
          <div style="color:#999;font-size:12px;margin-top:2px;">Size: ${escapeHtml(item.size)} · Qty: ${item.quantity}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#121b28;text-align:right;white-space:nowrap;">
          ${escapeHtml(formatPkrCheckout(item.totalPrice))}
        </td>
      </tr>`,
    )
    .join("");

  const html = emailShell(
    `Order ${payload.invoiceNumber}`,
    `
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:#121b28;">Order confirmed</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
      Hi ${escapeHtml(name)}, thank you for shopping with Babies Bloomers. Your order is confirmed.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf9f7;border-radius:12px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#999;">Invoice</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#121b28;">#${escapeHtml(payload.invoiceNumber)}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#727272;">Payment: ${escapeHtml(payload.paymentMethod.toUpperCase())}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#121b28;">Items</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
      ${itemsHtml}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#727272;">Subtotal</td>
        <td style="padding:4px 0;font-size:13px;color:#121b28;text-align:right;">${escapeHtml(formatPkrCheckout(payload.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#727272;">Shipping</td>
        <td style="padding:4px 0;font-size:13px;color:#121b28;text-align:right;">${escapeHtml(formatPkrCheckout(payload.shippingFee))}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#121b28;border-top:1px solid #f0ece8;">Total</td>
        <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#121b28;text-align:right;border-top:1px solid #f0ece8;">${escapeHtml(formatPkrCheckout(payload.total))}</td>
      </tr>
    </table>
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#121b28;">Shipping to</p>
    <p style="margin:0 0 22px;font-size:13px;line-height:20px;color:#727272;">
      ${escapeHtml(payload.shippingAddress)}<br />
      ${escapeHtml(payload.shippingCity)}<br />
      ${escapeHtml(payload.shippingPhone)}
    </p>
    <a href="${ordersUrl}" style="display:inline-block;background:#f3aa9b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">
      View your order
    </a>
    `,
  );

  return sendMail({
    to: payload.to,
    subject: `Order confirmed — ${payload.invoiceNumber}`,
    html,
  });
}

const STATUS_COPY: Record<
  string,
  { title: string; body: string; subject: string }
> = {
  pending: {
    title: "Order pending",
    subject: "Order update: Pending",
    body: "Your order is pending. We will start preparing it shortly.",
  },
  processing: {
    title: "Order processing",
    subject: "Order update: Processing",
    body: "Good news — your order is now being processed and prepared for shipment.",
  },
  shipped: {
    title: "Order shipped",
    subject: "Order update: Shipped",
    body: "Your order is on the way! It has been shipped and should arrive soon.",
  },
  delivered: {
    title: "Order delivered",
    subject: "Order update: Delivered",
    body: "Your order has been delivered. We hope your little one loves it!",
  },
  cancelled: {
    title: "Order cancelled",
    subject: "Order update: Cancelled",
    body: "Your order has been cancelled. If this was unexpected, please contact support.",
  },
};

export type OrderStatusEmailPayload = {
  to: string;
  firstName: string;
  invoiceNumber: string;
  status: string;
};

export async function sendOrderStatusEmail(
  payload: OrderStatusEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  const ordersUrl = `${siteUrl()}/account/orders`;
  const name = payload.firstName || "there";
  const copy =
    STATUS_COPY[payload.status] ??
    ({
      title: "Order update",
      subject: `Order update: ${payload.status}`,
      body: `Your order status is now: ${payload.status}.`,
    } as const);

  const html = emailShell(
    `${copy.title} — ${payload.invoiceNumber}`,
    `
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:#121b28;">${escapeHtml(copy.title)}</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
      Hi ${escapeHtml(name)}, ${escapeHtml(copy.body)}
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf9f7;border-radius:12px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#999;">Invoice</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#121b28;">#${escapeHtml(payload.invoiceNumber)}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#727272;">
            Status:
            <strong style="color:#121b28;text-transform:uppercase;">${escapeHtml(payload.status)}</strong>
          </p>
        </td>
      </tr>
    </table>
    <a href="${ordersUrl}" style="display:inline-block;background:#f3aa9b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">
      Track your order
    </a>
    `,
  );

  return sendMail({
    to: payload.to,
    subject: `${copy.subject} — ${payload.invoiceNumber}`,
    html,
  });
}

export async function sendContactReplyEmail(payload: {
  to: string;
  name: string;
  subject: string;
  message: string;
  originalMessage: string;
}): Promise<{ ok: boolean; error?: string }> {
  const html = emailShell(
    payload.subject,
    `
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:#121b28;">${escapeHtml(payload.subject)}</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:22px;">
      Hi ${escapeHtml(payload.name || "there")},
    </p>
    <div style="margin:0 0 22px;font-size:14px;line-height:22px;color:#121b28;white-space:pre-wrap;">${escapeHtml(payload.message)}</div>
    <div style="border-left:3px solid #f3aa9b;background:#faf9f7;padding:14px 16px;border-radius:0 10px 10px 0;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#999;">Your original message</p>
      <p style="margin:0;font-size:12px;line-height:19px;color:#727272;white-space:pre-wrap;">${escapeHtml(payload.originalMessage)}</p>
    </div>
    `,
  );

  return sendMail({
    to: payload.to,
    subject: payload.subject,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
