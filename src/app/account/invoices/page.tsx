import Link from "next/link";
import { getUserInvoices } from "@/app/actions/orders";
import { formatPkrCheckout } from "@/lib/format";
import { InvoiceDownloadBtn } from "@/components/site/invoice-download-btn";

export const revalidate = 0;

export default async function InvoicesPage() {
  const invoices = await getUserInvoices();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          Invoices
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Retrieve, view and download PDF versions of your order invoices.
        </p>
      </div>

      <div className="rounded-2xl border border-[#f0ece8] bg-white shadow-sm overflow-hidden">
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-poppins text-[14px]">
              <thead>
                <tr className="border-b border-[#f0ece8] bg-[#faf9f7] text-[12px] font-semibold uppercase tracking-wider text-body">
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-[#fffdfb]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink">
                      #{invoice.invoice_number}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-body">
                      {new Date(invoice.created_at).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-body uppercase">
                      {invoice.payment_method}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                          invoice.status === "delivered"
                            ? "bg-green-50 text-green-600"
                            : invoice.status === "cancelled"
                              ? "bg-red-50 text-red-500"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-ink">
                      {formatPkrCheckout(invoice.total)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <InvoiceDownloadBtn order={invoice} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-poppins text-[15px] text-body">
              No invoices found in your account.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-salmon px-6 font-poppins text-[14px] font-semibold text-white transition-colors hover:bg-salmon-soft"
            >
              Shop Our Store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
