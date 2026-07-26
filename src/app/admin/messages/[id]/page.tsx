import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactMessage } from "@/app/actions/admin";
import { ContactStatusBadge } from "@/components/admin/contact-status-badge";
import {
  ContactReplyForm,
  MarkReadButton,
} from "@/components/admin/message-actions";
import { contactStatusOf, type ContactQuery } from "@/lib/contact-query-types";

export const revalidate = 0;

export default async function AdminContactQueryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const query = (await getContactMessage(id)) as ContactQuery | null;
  if (!query) notFound();

  const status = contactStatusOf(query);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/messages"
          className="font-poppins text-[13px] font-semibold text-salmon hover:underline"
        >
          ← Back to contact queries
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-fredoka text-[28px] font-semibold text-ink">
              {query.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ContactStatusBadge status={status} />
              <span className="font-poppins text-[13px] text-body">
                {new Date(query.created_at).toLocaleString("en-PK")}
              </span>
            </div>
          </div>
          {status === "new" ? <MarkReadButton id={query.id} /> : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-poppins text-[15px] font-semibold text-ink">
              Message
            </h2>
            <p className="whitespace-pre-wrap rounded-xl bg-[#faf9f7] p-4 font-poppins text-[14px] leading-6 text-ink">
              {query.message}
            </p>
          </section>

          {query.replied_at && query.reply_body ? (
            <section className="rounded-2xl border border-green-100 bg-green-50/50 p-5 shadow-sm">
              <h2 className="font-poppins text-[13px] font-semibold uppercase tracking-wide text-green-700">
                Last reply · {new Date(query.replied_at).toLocaleString("en-PK")}
              </h2>
              <p className="mt-2 font-poppins text-[14px] font-semibold text-ink">
                {query.reply_subject}
              </p>
              <p className="mt-2 whitespace-pre-wrap font-poppins text-[13px] leading-6 text-body">
                {query.reply_body}
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
            <ContactReplyForm
              id={query.id}
              name={query.name}
              email={query.email}
              previousSubject={query.reply_subject}
            />
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-poppins text-[15px] font-semibold text-ink">
            Contact
          </h2>
          <dl className="space-y-3 font-poppins text-[13px]">
            <div>
              <dt className="text-body">Name</dt>
              <dd className="font-medium text-ink">{query.name}</dd>
            </div>
            <div>
              <dt className="text-body">Email</dt>
              <dd>
                <a
                  href={`mailto:${query.email}`}
                  className="break-all font-medium text-ink transition-colors hover:text-salmon"
                >
                  {query.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-body">Received</dt>
              <dd className="font-medium text-ink">
                {new Date(query.created_at).toLocaleString("en-PK")}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
