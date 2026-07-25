"use client";

import { useState } from "react";
import { toast } from "sonner";
import { downloadInvoicePdf, type InvoiceData } from "@/lib/invoice";
import { DownloadIcon } from "@/components/site/icons";
import { ButtonSpinner } from "@/components/site/button-spinner";

type OrderItem = {
  title: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type OrderDataForInvoice = {
  invoice_number: string;
  created_at: string;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_email: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  order_items?: OrderItem[];
};

export function InvoiceDownloadBtn({
  order,
  className = "",
}: {
  order: OrderDataForInvoice;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const invoiceData: InvoiceData = {
        invoiceNumber: order.invoice_number,
        createdAt: order.created_at,
        customer: {
          firstName: order.shipping_first_name ?? "",
          lastName: order.shipping_last_name ?? "",
          email: order.shipping_email ?? "",
          address: order.shipping_address ?? "",
          city: order.shipping_city ?? "",
          country: order.shipping_country ?? "Pakistan",
          phone: order.shipping_phone ?? "",
        },
        items: (order.order_items ?? []).map((item) => ({
          title: item.title,
          size: item.size ?? "Standard",
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shipping_fee),
        total: Number(order.total),
        paymentMethod: order.payment_method,
      };

      await downloadInvoicePdf(invoiceData);
      toast.success(`Invoice ${order.invoice_number} downloaded.`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      toast.error("Could not generate invoice PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {downloading ? (
        <ButtonSpinner className="size-4" />
      ) : (
        <DownloadIcon className="size-4 shrink-0" />
      )}
      {downloading ? "Generating…" : "Download PDF"}
    </button>
  );
}
