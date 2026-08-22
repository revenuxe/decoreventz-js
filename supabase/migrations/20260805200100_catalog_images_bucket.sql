-- Storage bucket for admin-managed catalog images (category/subcategory/product photos).
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

CREATE POLICY "Public read catalog images" ON storage.objects FOR SELECT
  USING (bucket_id = 'catalog-images');

CREATE POLICY "Admins upload catalog images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update catalog images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'catalog-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete catalog images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'catalog-images' AND public.has_role(auth.uid(), 'admin'));
