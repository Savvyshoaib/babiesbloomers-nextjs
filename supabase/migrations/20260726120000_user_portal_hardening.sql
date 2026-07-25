-- ================================================================
-- Babies Bloomers – Migration 02
-- Name: 20260726120000_user_portal_hardening.sql
-- Guest checkout reliability, invoice sequence, profile email
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Add email to profiles (unique) for reliable lookups
-- ----------------------------------------------------------------
alter table public.profiles
  add column if not exists email text;

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null;

-- Backfill from auth.users where possible
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

-- Update signup trigger to also store email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1),
    nullif(trim(substr(
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      length(split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1)) + 2
    )), ''),
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(nullif(excluded.first_name, ''), profiles.first_name),
    last_name = coalesce(nullif(excluded.last_name, ''), profiles.last_name);
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------
-- 2. Invoice number sequence (unique, collision-free)
-- ----------------------------------------------------------------
create sequence if not exists public.invoice_number_seq start 1000;

create or replace function public.next_invoice_number()
returns text
language plpgsql
as $$
declare
  yyyymm text;
  seq_val bigint;
begin
  yyyymm := to_char(timezone('utc', now()), 'YYYYMM');
  seq_val := nextval('public.invoice_number_seq');
  return 'BB-' || yyyymm || '-' || lpad(seq_val::text, 5, '0');
end;
$$;

-- Allow authenticated + service role to call (server uses service role)
revoke all on function public.next_invoice_number() from public;
grant execute on function public.next_invoice_number() to service_role;
grant execute on function public.next_invoice_number() to authenticated;

-- ----------------------------------------------------------------
-- 3. Helper: resolve auth user id by email (service role only)
-- ----------------------------------------------------------------
create or replace function public.get_auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.get_auth_user_id_by_email(text) from public;
grant execute on function public.get_auth_user_id_by_email(text) to service_role;

-- ----------------------------------------------------------------
-- 4. Tighten order insert/update policies
--    Public with-check(true) was too open; keep user claim + service role.
-- ----------------------------------------------------------------
drop policy if exists "Service role can insert orders" on public.orders;
drop policy if exists "Service role can update orders" on public.orders;
drop policy if exists "Users can claim guest orders" on public.orders;
drop policy if exists "Users can update own orders" on public.orders;

-- Authenticated users can claim guest orders that match their email
create policy "Users can claim guest orders"
  on public.orders for update
  using (
    auth.uid() is not null
    and user_id is null
    and lower(shipping_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (auth.uid() = user_id);

-- Authenticated users may update their own orders (status reads only typically)
create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Note: inserts for orders/order_items are performed via service role
-- (bypasses RLS). No public insert policy needed.
drop policy if exists "Service role can insert order items" on public.order_items;

-- Index for guest-order claims
create index if not exists orders_shipping_email_idx
  on public.orders (lower(shipping_email))
  where user_id is null;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);
