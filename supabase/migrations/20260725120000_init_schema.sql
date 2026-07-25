-- ================================================================
-- Babies Bloomers – Supabase Database Schema (Migration 01)
-- Name: 20260725120000_init_schema.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  first_name   text,
  last_name    text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------
-- 2. ADDRESSES
-- ----------------------------------------------------------------
create table if not exists public.addresses (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  type          text check (type in ('shipping', 'billing')) not null,
  first_name    text,
  last_name     text,
  address       text,
  city          text,
  postal_code   text,
  country       text default 'Pakistan',
  phone         text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.addresses enable row level security;

create policy "Users can manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 3. ORDERS
-- ----------------------------------------------------------------
create table if not exists public.orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete set null,
  invoice_number   text unique not null,
  status           text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method   text check (payment_method in ('cod', 'payfast')) not null,
  subtotal         numeric(10,2) not null,
  shipping_fee     numeric(10,2) default 0,
  total            numeric(10,2) not null,
  -- Snapshot of shipping address at time of order
  shipping_first_name  text,
  shipping_last_name   text,
  shipping_address     text,
  shipping_city        text,
  shipping_postal      text,
  shipping_country     text default 'Pakistan',
  shipping_phone       text,
  shipping_email       text,
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Allow service-role inserts (server actions use service role)
create policy "Service role can insert orders"
  on public.orders for insert
  with check (true);

create policy "Service role can update orders"
  on public.orders for update
  using (true);

-- ----------------------------------------------------------------
-- 4. ORDER ITEMS
-- ----------------------------------------------------------------
create table if not exists public.order_items (
  id          uuid default gen_random_uuid() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  product_slug text,
  title       text not null,
  image       text,
  size        text,
  quantity    int not null,
  unit_price  numeric(10,2) not null,
  total_price numeric(10,2) not null
);

alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Service role can insert order items"
  on public.order_items for insert
  with check (true);

-- ----------------------------------------------------------------
-- 5. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1),
    split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 2)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 6. UPDATED_AT auto-update function
-- ----------------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger addresses_updated_at before update on public.addresses
  for each row execute procedure public.update_updated_at();

create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();
