-- Site-wide CMS content (logo, banners, social, testimonials, vision)
insert into public.site_settings (key, value) values
  ('site_content', '{}'::jsonb)
on conflict (key) do nothing;

-- Public bucket for site assets (logo, favicon, banners, avatars)
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public read site assets" on storage.objects;
create policy "Public read site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "Admins upload site assets" on storage.objects;
create policy "Admins upload site assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins update site assets" on storage.objects;
create policy "Admins update site assets"
  on storage.objects for update
  using (
    bucket_id = 'site-assets'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins delete site assets" on storage.objects;
create policy "Admins delete site assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
