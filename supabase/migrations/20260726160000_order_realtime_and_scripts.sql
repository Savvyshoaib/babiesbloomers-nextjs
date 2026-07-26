-- Enable realtime order status updates for the user portal
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Header / footer custom scripts (analytics, pixels, chat widgets, etc.)
insert into public.site_settings (key, value) values
  ('header_scripts', '""'::jsonb),
  ('footer_scripts', '""'::jsonb)
on conflict (key) do nothing;
