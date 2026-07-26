-- Database migrations live in the standard Supabase folder:
--   /supabase/migrations/

-- Apply in order:
--   20260725120000_init_schema.sql
--   20260726120000_user_portal_hardening.sql
--   20260726140000_admin_panel.sql

-- Promote first admin (after user signs up):
--   update public.profiles set role = 'admin' where lower(email) = 'you@example.com';
