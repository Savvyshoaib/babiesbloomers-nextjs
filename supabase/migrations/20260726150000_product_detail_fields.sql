-- ================================================================
-- Babies Bloomers – Migration 04
-- Product detail fields, gallery, storage bucket
-- ================================================================

alter table public.products
  add column if not exists product_code text,
  add column if not exists sizes text[] default '{}'::text[] not null,
  add column if not exists gallery_images text[] default '{}'::text[] not null,
  add column if not exists exclusive_offers jsonb default '[]'::jsonb not null,
  add column if not exists additional_info jsonb default '{}'::jsonb not null,
  add column if not exists reviews_count int default 0 not null;

-- Unique product code when set
create unique index if not exists products_product_code_unique
  on public.products (product_code)
  where product_code is not null and product_code <> '';

-- Public product images bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Service role upload product images" on storage.objects;
-- Authenticated uploads go through service-role server actions; allow public insert
-- is too open. Prefer service role bypass. Keep authenticated admin path:
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
