/**
 * Invoice PDF generator using jsPDF.
 * Called client-side only (browser).
 */
export type InvoiceData = {
  invoiceNumber: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  items: {
    title: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
};

export async function downloadInvoicePdf(data: InvoiceData) {
  // Dynamic import – jsPDF is large, only load when needed
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const brand = "#f3aa9b"; // salmon
  const ink = "#121b28";
  const body = "#727272";
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(brand);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#ffffff");
  doc.text("Babies Bloomers", 15, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Made for little moments", 15, 19);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageW - 15, 12, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, pageW - 15, 19, { align: "right" });

  // ── Meta row ─────────────────────────────────────────────────
  doc.setTextColor(body);
  doc.setFontSize(9);
  doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString("en-PK", { dateStyle: "long" })}`, pageW - 15, 36, { align: "right" });
  doc.text(`Payment: ${data.paymentMethod === "cod" ? "Cash on Delivery" : "PAYFAST"}`, pageW - 15, 42, { align: "right" });

  // ── Bill To ──────────────────────────────────────────────────
  doc.setTextColor(ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bill To:", 15, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(body);
  const customerName = `${data.customer.firstName} ${data.customer.lastName}`;
  doc.text(customerName, 15, 43);
  doc.text(data.customer.email, 15, 48);
  doc.text(data.customer.address, 15, 53);
  doc.text(`${data.customer.city}, ${data.customer.country}`, 15, 58);
  doc.text(data.customer.phone, 15, 63);

  // ── Items table ───────────────────────────────────────────────
  const tableBody = data.items.map((item) => [
    item.title.length > 45 ? item.title.slice(0, 42) + "…" : item.title,
    item.size || "—",
    item.quantity.toString(),
    `PKR ${item.unitPrice.toLocaleString("en-PK")}`,
    `PKR ${item.totalPrice.toLocaleString("en-PK")}`,
  ]);

  autoTable(doc, {
    startY: 72,
    head: [["Product", "Size", "Qty", "Unit Price", "Total"]],
    body: tableBody,
    headStyles: {
      fillColor: ink,
      textColor: "#ffffff",
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, textColor: body },
    alternateRowStyles: { fillColor: "#fafafa" },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 32, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    theme: "grid",
  });

  // ── Totals ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  const totalsX = pageW - 15;
  const labelX = pageW - 70;

  doc.setFontSize(9);
  doc.setTextColor(body);
  doc.text("Subtotal:", labelX, finalY);
  doc.text(`PKR ${data.subtotal.toLocaleString("en-PK")}`, totalsX, finalY, { align: "right" });

  doc.text("Shipping:", labelX, finalY + 6);
  doc.text(`PKR ${data.shippingFee.toLocaleString("en-PK")}`, totalsX, finalY + 6, { align: "right" });

  doc.setDrawColor(brand);
  doc.line(labelX, finalY + 9, totalsX, finalY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(ink);
  doc.text("Total:", labelX, finalY + 16);
  doc.text(`PKR ${data.total.toLocaleString("en-PK")}`, totalsX, finalY + 16, { align: "right" });

  // ── Footer ────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(body);
  doc.text("Thank you for shopping with Babies Bloomers!", pageW / 2, 280, { align: "center" });
  doc.text("support@babiesbloomers.com | www.babiesbloomers.com", pageW / 2, 285, { align: "center" });

  doc.save(`Invoice-${data.invoiceNumber}.pdf`);
}
