-- Product image uploads now go straight from the admin's browser to Storage
-- (bypassing the Next.js Server Action body-size limit for large files), so
-- the storage policies must allow the signed-in admin's session directly.
-- Also widen from is_admin() to is_staff() so shop managers (who already
-- have the "products" permission) can upload/replace/remove product images
-- too, matching the app-level role_permissions matrix.
drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;

create policy "Staff upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "Staff update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "Staff delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff());
