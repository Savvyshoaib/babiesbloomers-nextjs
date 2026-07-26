"use client";

import { markMessageRead, replyToContactMessage } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function MarkReadButton({ id }: { id: string }) {
  const { formAction, pending } = useAdminAction(markMessageRead);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <AdminSubmitButton
        pending={pending}
        label="Mark read"
        pendingLabel="…"
        variant="outline"
      />
    </form>
  );
}

export function ContactReplyForm({
  id,
  name,
  email,
  previousSubject,
  previousReply,
}: {
  id: string;
  name: string;
  email: string;
  previousSubject?: string | null;
  previousReply?: string | null;
}) {
  const { formAction, pending } = useAdminAction(replyToContactMessage);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <h2 className="font-poppins text-[15px] font-semibold text-ink">
          Compose email reply
        </h2>
        <p className="font-poppins text-[12px] text-body">
          Replying to {name} at {email}
        </p>
      </div>
      <label htmlFor={`subject-${id}`} className="sr-only">
        Email subject
      </label>
      <input
        id={`subject-${id}`}
        name="subject"
        required
        maxLength={160}
        defaultValue={previousSubject ?? "Re: Your Babies Bloomers enquiry"}
        placeholder="Email subject"
        className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink outline-none focus:border-salmon"
      />
      <label htmlFor={`reply-${id}`} className="sr-only">
        Reply message
      </label>
      <textarea
        id={`reply-${id}`}
        name="reply"
        required
        rows={5}
        maxLength={10_000}
        defaultValue={previousReply ?? ""}
        placeholder="Write your reply…"
        className="w-full resize-y rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px] leading-6 text-ink outline-none focus:border-salmon"
      />
      <AdminSubmitButton
        pending={pending}
        label="Send email reply"
        pendingLabel="Sending…"
      />
    </form>
  );
}
