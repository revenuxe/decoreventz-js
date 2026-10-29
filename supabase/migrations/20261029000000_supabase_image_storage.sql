-- Public catalog artwork and private booking proof photos. Existing business
-- tables retain their image fields; file bytes live only in Storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('catalog-images', 'catalog-images', true, 4194304, array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif','image/bmp']),
  ('booking-images', 'booking-images', false, 4194304, array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif','image/bmp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Definer access sees historical snapshots even when the caller cannot read
-- the booking itself. Non-admins receive a conservative "in use" result.
create or replace function public.catalog_image_is_referenced(_url text)
returns boolean language sql stable security definer set search_path = '' as $$
  select not public.has_role(auth.uid(), 'admin') or _url is null or _url = '' or
    exists (select 1 from public.categories t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.subcategories t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.products t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.homepage_hero_slides t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.decoration_content_items t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.booking_items t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.bookings t where strpos(to_jsonb(t)::text, _url) > 0) or
    exists (select 1 from public.profiles t where strpos(to_jsonb(t)::text, _url) > 0);
$$;
revoke all on function public.catalog_image_is_referenced(text) from public, anon;
grant execute on function public.catalog_image_is_referenced(text) to authenticated;

drop policy if exists "Admins delete catalog images" on storage.objects;
create policy "Admins delete unreferenced catalog images" on storage.objects
for delete to authenticated using (
  bucket_id = 'catalog-images' and public.has_role(auth.uid(), 'admin')
  and not public.catalog_image_is_referenced('/storage/v1/object/public/catalog-images/' || name)
);

-- Text comparison avoids exceptions for malformed paths. The booking and
-- vendor lookup runs without exposing any booking metadata to API callers.
create or replace function public.can_access_booking_image(_name text, _write boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and split_part(_name, '/', 1) = 'bookings'
    and split_part(_name, '/', 3) in ('decoration', 'team')
    and split_part(_name, '/', 4) <> ''
    and array_length(string_to_array(_name, '/'), 1) = 4
    and exists (
      select 1 from public.bookings b
      where b.id::text = split_part(_name, '/', 2)
        and (
          public.has_role(auth.uid(), 'admin')
          or (not _write and b.user_id = auth.uid())
          or exists (select 1 from public.vendors v where v.id = b.assigned_vendor_id
            and v.user_id = auth.uid() and v.status = 'approved')
        )
    );
$$;
revoke all on function public.can_access_booking_image(text, boolean) from public, anon;
grant execute on function public.can_access_booking_image(text, boolean) to authenticated;

create policy "Booking participants read proof images" on storage.objects for select to authenticated
  using (bucket_id = 'booking-images' and public.can_access_booking_image(name, false));
create policy "Assigned vendors upload proof images" on storage.objects for insert to authenticated
  with check (bucket_id = 'booking-images' and public.can_access_booking_image(name, true));
-- Proof photos are immutable to vendors; only admins can remove them.
create policy "Admins delete proof images" on storage.objects for delete to authenticated
  using (bucket_id = 'booking-images' and public.has_role(auth.uid(), 'admin'));
