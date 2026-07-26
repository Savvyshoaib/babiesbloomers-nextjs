-- ================================================================
-- Babies Bloomers – Migration 03
-- Name: 20260726140000_admin_panel.sql
-- Admin roles, catalog, site settings, contact messages
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Admin role on profiles
-- ----------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'customer';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

-- ----------------------------------------------------------------
-- 2. Categories
-- ----------------------------------------------------------------
create table if not exists public.categories (
  id          uuid default gen_random_uuid() primary key,
  slug        text unique not null,
  label       text not null,
  sort_order  int default 0 not null,
  is_active   boolean default true not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.categories enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
  on public.categories for select
  using (is_active = true);

create trigger categories_updated_at before update on public.categories
  for each row execute procedure public.update_updated_at();

-- ----------------------------------------------------------------
-- 3. Products
-- ----------------------------------------------------------------
create table if not exists public.products (
  id              uuid default gen_random_uuid() primary key,
  slug            text unique not null,
  title           text not null,
  image           text,
  price           text not null,
  old_price       text,
  price_value     numeric(10,2) not null default 0,
  badge           text,
  categories      text[] default '{}'::text[] not null,
  tabs            text[] default '{}'::text[] not null,
  is_featured     boolean default false not null,
  is_new_arrival  boolean default false not null,
  status          text not null default 'active'
                    check (status in ('active', 'draft', 'archived')),
  stock           int default 100 not null,
  description     text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

alter table public.products enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  using (status = 'active');

create index if not exists products_status_idx on public.products (status);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_price_value_idx on public.products (price_value);

create trigger products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();

-- ----------------------------------------------------------------
-- 4. Site settings (key/value JSON)
-- ----------------------------------------------------------------
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz default now() not null
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

insert into public.site_settings (key, value) values
  ('shipping_fee', '250'::jsonb),
  ('contact', '{"email":"orders@babiesbloomers.com","phone":"+92 300 0000000","address":"Pakistan"}'::jsonb),
  ('promo_strip', '{"text":"Free shipping on orders over Rs 3,000","enabled":true}'::jsonb)
on conflict (key) do nothing;

-- ----------------------------------------------------------------
-- 5. Contact messages
-- ----------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  email       text not null,
  message     text not null,
  is_read     boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table public.contact_messages enable row level security;

-- Inserts from server (service role) or allow anonymous insert for contact form
drop policy if exists "Anyone can submit contact message" on public.contact_messages;
create policy "Anyone can submit contact message"
  on public.contact_messages for insert
  with check (true);

-- ----------------------------------------------------------------
-- 6. Helper: is_admin()
-- ----------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- Admin policies (authenticated admins can manage; service role bypasses RLS)
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete contact messages" on public.contact_messages;
create policy "Admins delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());

-- Admins can view all profiles/orders (for admin panel via authenticated client)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Admins can view all addresses" on public.addresses;
create policy "Admins can view all addresses"
  on public.addresses for select
  using (public.is_admin());

-- ----------------------------------------------------------------
-- NOTE: Promote your first admin after signup:
--   update public.profiles set role = 'admin' where lower(email) = 'you@example.com';
-- Or set ADMIN_BOOTSTRAP_EMAIL in .env.local to auto-promote on admin access.
-- ----------------------------------------------------------------
