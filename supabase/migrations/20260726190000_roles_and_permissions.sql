-- Expand staff roles and seed default role permission matrix.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin', 'shop_manager'));

-- Staff can access admin surfaces when their role has permissions.
-- Keep is_admin() for full admins; add is_staff() for any non-customer role.
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

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'shop_manager')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_staff() to service_role;

-- Default role permissions (admin can edit via Roles & Access page)
insert into public.site_settings (key, value)
values (
  'role_permissions',
  '{
    "admin": {
      "dashboard": true,
      "orders": true,
      "customers": true,
      "products": true,
      "categories": true,
      "messages": true,
      "content": true,
      "scripts": true,
      "settings": true,
      "roles": true
    },
    "shop_manager": {
      "dashboard": true,
      "orders": true,
      "customers": true,
      "products": true,
      "categories": true,
      "messages": true,
      "content": true,
      "scripts": false,
      "settings": false,
      "roles": false
    },
    "customer": {
      "dashboard": false,
      "orders": false,
      "customers": false,
      "products": false,
      "categories": false,
      "messages": false,
      "content": false,
      "scripts": false,
      "settings": false,
      "roles": false
    }
  }'::jsonb
)
on conflict (key) do nothing;
