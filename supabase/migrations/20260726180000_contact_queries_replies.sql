-- Contact query lifecycle and admin email replies.
alter table public.contact_messages
  add column if not exists status text not null default 'new'
    check (status in ('new', 'read', 'replied')),
  add column if not exists reply_subject text,
  add column if not exists reply_body text,
  add column if not exists replied_at timestamptz,
  add column if not exists replied_by uuid references auth.users(id) on delete set null;

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

update public.contact_messages
set status = case when is_read then 'read' else 'new' end
where status = 'new' and is_read = true;
