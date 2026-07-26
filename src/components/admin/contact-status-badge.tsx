import type { ContactQueryStatus } from "@/lib/contact-query-types";

const STYLES: Record<ContactQueryStatus, string> = {
  new: "bg-salmon/15 text-salmon",
  read: "bg-slate-100 text-slate-600",
  replied: "bg-green-50 text-green-700",
};

export function ContactStatusBadge({ status }: { status: ContactQueryStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 font-poppins text-[11px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
