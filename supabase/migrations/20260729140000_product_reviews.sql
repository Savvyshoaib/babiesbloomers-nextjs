-- Product reviews (hybrid: user submit → admin moderate → storefront)

alter table public.products
  add column if not exists average_rating numeric(3, 2) not null default 0;

-- Recalc helper
create or replace function public.recalc_product_rating(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_r numeric(3, 2);
  cnt int;
begin
  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::int
  into avg_r, cnt
  from public.product_reviews
  where product_id = p_product_id
    and status = 'approved';

  update public.products
  set
    average_rating = coalesce(avg_r, 0),
    reviews_count = coalesce(cnt, 0),
    updated_at = now()
  where id = p_product_id;
end;
$$;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  product_slug text not null,
  product_title text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  review_text text not null default '',
  image_url text not null default '',
  customer_name text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default true,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists product_reviews_user_product_unique
  on public.product_reviews (user_id, product_id);

create index if not exists product_reviews_status_idx
  on public.product_reviews (status, created_at desc);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, status);

create index if not exists product_reviews_featured_idx
  on public.product_reviews (featured, status)
  where status = 'approved';

alter table public.product_reviews enable row level security;

drop policy if exists "Users read own reviews" on public.product_reviews;
create policy "Users read own reviews"
  on public.product_reviews
  for select
  using (auth.uid() = user_id or status = 'approved' or public.is_admin());

drop policy if exists "Users insert own reviews" on public.product_reviews;
create policy "Users insert own reviews"
  on public.product_reviews
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own pending reviews" on public.product_reviews;
create policy "Users update own pending reviews"
  on public.product_reviews
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Admins manage reviews" on public.product_reviews;
create policy "Admins manage reviews"
  on public.product_reviews
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Trigger: recalc when review status changes
create or replace function public.trg_product_reviews_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalc_product_rating(old.product_id);
    return old;
  end if;

  perform public.recalc_product_rating(new.product_id);
  if tg_op = 'UPDATE'
     and old.product_id is distinct from new.product_id then
    perform public.recalc_product_rating(old.product_id);
  end if;
  return new;
end;
$$;

drop trigger if exists product_reviews_recalc on public.product_reviews;
create trigger product_reviews_recalc
  after insert or update of status, rating, product_id or delete
  on public.product_reviews
  for each row
  execute function public.trg_product_reviews_recalc();

-- Review images storage
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read review images" on storage.objects;
create policy "Public read review images"
  on storage.objects for select
  using (bucket_id = 'review-images');

drop policy if exists "Auth users upload review images" on storage.objects;
create policy "Auth users upload review images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'review-images');

drop policy if exists "Admins manage review images" on storage.objects;
create policy "Admins manage review images"
  on storage.objects for all
  using (bucket_id = 'review-images' and public.is_admin())
  with check (bucket_id = 'review-images' and public.is_admin());

-- Homepage slider settings
insert into public.site_settings (key, value)
values (
  'reviews_slider',
  '{
    "title": "Customers are saying",
    "autoplay": true,
    "intervalMs": 4500,
    "showArrows": true,
    "showDots": true,
    "visibleDesktop": 5
  }'::jsonb
)
on conflict (key) do nothing;
