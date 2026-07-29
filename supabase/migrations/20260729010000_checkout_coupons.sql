-- Checkout settings, coupons, order discounts, flexible payment methods

-- Expand payment_method beyond cod/payfast
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (
    payment_method in ('cod', 'payfast', 'bank_transfer')
    or payment_method ~ '^[a-z0-9_-]{1,40}$'
  );

alter table public.orders
  add column if not exists discount_amount numeric(10, 2) not null default 0;

alter table public.orders
  add column if not exists coupon_code text;

-- Coupons / promo codes
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text not null default '',
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_subtotal numeric(10, 2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_unique unique (code),
  constraint coupons_max_uses_check check (max_uses is null or max_uses > 0),
  constraint coupons_dates_check check (
    starts_at is null or ends_at is null or starts_at <= ends_at
  )
);

create index if not exists coupons_active_idx on public.coupons (active);
create index if not exists coupons_ends_at_idx on public.coupons (ends_at);

alter table public.coupons enable row level security;

drop policy if exists "Public can read active coupons" on public.coupons;
-- No public select of full coupon list; validation goes through server actions.

drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons"
  on public.coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed checkout_settings (shipping + payments + custom sections)
insert into public.site_settings (key, value)
values (
  'checkout_settings',
  '{
    "shipping": {
      "enabled": true,
      "mode": "fixed",
      "fee": 200,
      "label": "Standard Shipping"
    },
    "payments": [
      {
        "id": "cod",
        "type": "cod",
        "label": "Cash on Delivery (COD)",
        "description": "Pay with cash when your order arrives.",
        "enabled": true,
        "bankDetails": ""
      },
      {
        "id": "payfast",
        "type": "payfast",
        "label": "PAYFAST (Debit / Credit / Wallet / Bank)",
        "description": "You will be redirected to PAYFAST to complete payment.",
        "enabled": true,
        "bankDetails": ""
      },
      {
        "id": "bank_transfer",
        "type": "bank_transfer",
        "label": "Bank Transfer",
        "description": "Transfer the total to our bank account and share the receipt.",
        "enabled": false,
        "bankDetails": "Bank: HBL\\nAccount Title: Babies Bloomers\\nAccount No: 0000-0000000-00\\nIBAN: PK00HABB0000000000000000"
      }
    ],
    "customSections": []
  }'::jsonb
)
on conflict (key) do nothing;
