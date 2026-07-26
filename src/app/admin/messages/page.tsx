import { getContactMessages } from "@/app/actions/admin";
import { AdminContactQueries } from "@/components/admin/contact-queries";
import { contactStatusOf, type ContactQuery } from "@/lib/contact-query-types";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const messages = (await getContactMessages()) as ContactQuery[];
  const newCount = messages.filter((m) => contactStatusOf(m) === "new").length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-fredoka text-[28px] font-semibold text-ink">
            Contact Queries
          </h1>
          {newCount > 0 ? (
            <span className="rounded-full bg-salmon/15 px-3 py-1 font-poppins text-[12px] font-semibold text-salmon">
              {newCount} new
            </span>
          ) : null}
        </div>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Open any enquiry to read the full message and reply by email.
        </p>
      </div>

      <AdminContactQueries queries={messages} />
    </div>
  );
}
