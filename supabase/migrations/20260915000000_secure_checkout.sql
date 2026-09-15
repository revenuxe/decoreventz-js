-- Deploy with the checkout client update. Customers must create orders through
-- this RPC; direct inserts bypass pricing, status and transaction validation.
BEGIN;
ALTER TABLE public.bookings ADD COLUMN checkout_request_id UUID;
ALTER TABLE public.bookings ADD COLUMN checkout_fingerprint TEXT;
CREATE UNIQUE INDEX bookings_checkout_request ON public.bookings(user_id, checkout_request_id);

DROP POLICY "Users create own bookings" ON public.bookings;
DROP POLICY "Users create own booking items" ON public.booking_items;

-- An applicant cannot approve their own vendor account or forge review metadata.
ALTER TABLE public.vendors ALTER COLUMN reviewed_by DROP DEFAULT;
DROP POLICY "Vendors create own row" ON public.vendors;
CREATE POLICY "Vendors create own row" ON public.vendors FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending' AND reviewed_at IS NULL
  AND reviewed_by IS NULL AND rejection_reason IS NULL);

-- Defaults only run on INSERT; stamp the actual admin on every review UPDATE.
CREATE OR REPLACE FUNCTION public.stamp_vendor_review()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_vendor_review BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.stamp_vendor_review();

CREATE OR REPLACE FUNCTION public.create_booking(
  _request_id UUID, _details JSONB, _items JSONB, _expected_total NUMERIC
) RETURNS TABLE(id UUID, order_code TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user UUID := auth.uid();
  _fingerprint TEXT;
  _existing public.bookings%ROWTYPE;
  _entry JSONB;
  _product RECORD;
  _quantity INT;
  _addons JSONB;
  _addon_total NUMERIC;
  _addon_count INT;
  _snapshots JSONB := '[]'::jsonb;
  _total NUMERIC := 0;
  _booking_id UUID;
  _order_code TEXT;
  _event_date DATE;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Please sign in to book'; END IF;
  IF _request_id IS NULL OR jsonb_typeof(_details) IS DISTINCT FROM 'object'
    OR jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid booking request';
  END IF;
  IF jsonb_array_length(_items) NOT BETWEEN 1 AND 50 OR length(_details::text) > 12000
    OR length(_items::text) > 250000 THEN RAISE EXCEPTION 'Invalid booking size'; END IF;
  _fingerprint := md5(jsonb_build_object('details',_details,'items',_items,'total',_expected_total)::text);
  -- Serialize retries for this user/request, including concurrent submissions.
  PERFORM pg_advisory_xact_lock(hashtextextended(_user::text || _request_id::text, 0));
  SELECT b.* INTO _existing FROM public.bookings b
    WHERE b.user_id = _user AND b.checkout_request_id = _request_id;
  IF FOUND THEN
    IF _existing.checkout_fingerprint IS DISTINCT FROM _fingerprint THEN
      RAISE EXCEPTION 'This booking request changed. Please submit it again';
    END IF;
    RETURN QUERY SELECT _existing.id, _existing.order_code;
    RETURN;
  END IF;

  _event_date := (_details->>'event_date')::date;
  IF _event_date IS NULL OR _event_date <= (now() AT TIME ZONE 'Asia/Kolkata')::date THEN
    RAISE EXCEPTION 'Choose an event date from tomorrow onwards';
  END IF;
  IF length(trim(coalesce(_details->>'event_time',''))) NOT BETWEEN 1 AND 100
    OR length(trim(coalesce(_details->>'venue_line1',''))) NOT BETWEEN 1 AND 500
    OR length(trim(coalesce(_details->>'venue_city',''))) NOT BETWEEN 1 AND 100
    OR coalesce(_details->>'venue_pincode','') !~ '^[1-9][0-9]{5}$'
    OR coalesce(_details->>'venue_phone','') !~ '^\+?[0-9 ()-]{10,20}$' THEN
    RAISE EXCEPTION 'Please check your event and venue details';
  END IF;

  FOR _entry IN SELECT value FROM jsonb_array_elements(_items) LOOP
    IF jsonb_typeof(_entry) IS DISTINCT FROM 'object'
      OR coalesce(_entry->>'quantity','') !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'Invalid item quantity';
    END IF;
    _quantity := (_entry->>'quantity')::int;
    IF _quantity NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid item quantity'; END IF;
    SELECT p.*, c.slug AS category_slug INTO _product
      FROM public.products p JOIN public.categories c ON c.id = p.category_id
      LEFT JOIN public.subcategories s ON s.id = p.subcategory_id
      WHERE p.id = (_entry->>'product_id')::uuid AND p.is_active AND c.is_active
        AND (p.subcategory_id IS NULL OR (s.is_active AND s.category_id = c.id));
    IF NOT FOUND THEN RAISE EXCEPTION 'A selected setup is no longer available. Please update your cart'; END IF;
    IF coalesce(_product.sale_price, _product.price) < 0 THEN RAISE EXCEPTION 'Invalid catalog price'; END IF;
    IF jsonb_typeof(coalesce(_entry->'addon_ids','[]'::jsonb)) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Invalid add-ons';
    END IF;
    IF jsonb_array_length(coalesce(_entry->'addon_ids','[]'::jsonb)) > 20 THEN RAISE EXCEPTION 'Too many add-ons'; END IF;
    SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'price',a.price) ORDER BY a.id),'[]'::jsonb),
      coalesce(sum(a.price),0), count(*)
      INTO _addons, _addon_total, _addon_count
      FROM public.addons a JOIN public.product_addon_links l ON l.addon_id = a.id
      WHERE l.product_id = _product.id AND a.is_active AND a.price >= 0
        AND a.id IN (SELECT value::uuid FROM jsonb_array_elements_text(coalesce(_entry->'addon_ids','[]'::jsonb)));
    IF _addon_count <> jsonb_array_length(coalesce(_entry->'addon_ids','[]'::jsonb)) THEN
      RAISE EXCEPTION 'An add-on is unavailable or selected more than once. Please update your cart';
    END IF;
    IF jsonb_typeof(coalesce(_entry->'customizations','{}'::jsonb)) IS DISTINCT FROM 'object'
      OR length(coalesce(_entry->'customizations','{}'::jsonb)::text) > 4096 THEN
      RAISE EXCEPTION 'Invalid customization';
    END IF;
    _total := _total + (coalesce(_product.sale_price,_product.price) + _addon_total) * _quantity;
    _snapshots := _snapshots || jsonb_build_array(jsonb_build_object(
      'product_id',_product.id,'category_slug',_product.category_slug,'service_slug',_product.slug,
      'service_name',_product.name,'image',_product.images[1],
      'unit_price',coalesce(_product.sale_price,_product.price),'original_price',_product.price,
      'quantity',_quantity,'addons',_addons,'customizations',coalesce(_entry->'customizations','{}'::jsonb)));
  END LOOP;
  IF _expected_total IS NULL OR _expected_total <> _total THEN
    RAISE EXCEPTION 'Catalog prices changed. Remove and re-add your setups to review current prices before booking';
  END IF;
  INSERT INTO public.bookings(user_id,event_date,event_time,venue_name,venue_line1,venue_line2,
    venue_city,venue_pincode,venue_phone,notes,total,checkout_request_id,checkout_fingerprint)
    VALUES (_user,_event_date,_details->>'event_time',_details->>'venue_name',_details->>'venue_line1',
      _details->>'venue_line2',_details->>'venue_city',_details->>'venue_pincode',_details->>'venue_phone',
      _details->>'notes',_total,_request_id,_fingerprint)
    RETURNING bookings.id, bookings.order_code INTO _booking_id, _order_code;
  INSERT INTO public.booking_items(booking_id,product_id,category_slug,service_slug,service_name,image,
    unit_price,original_price,quantity,addons,customizations)
    SELECT _booking_id,r.product_id,r.category_slug,r.service_slug,r.service_name,r.image,
      r.unit_price,r.original_price,r.quantity,r.addons,r.customizations
    FROM jsonb_to_recordset(_snapshots) AS r(product_id uuid,category_slug text,service_slug text,
      service_name text,image text,unit_price numeric,original_price numeric,quantity int,addons jsonb,customizations jsonb);
  RETURN QUERY SELECT _booking_id, _order_code;
END;
$$;
REVOKE ALL ON FUNCTION public.create_booking(UUID,JSONB,JSONB,NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking(UUID,JSONB,JSONB,NUMERIC) TO authenticated;
COMMIT;
