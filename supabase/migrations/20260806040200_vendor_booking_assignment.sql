-- Wires vendors into the booking lifecycle: assignment, vendor-visible
-- read access, a quote/bill/payment trail, and the two photo-gated status
-- transitions a vendor is allowed to make.

CREATE TYPE public.vendor_payment_status AS ENUM ('unpaid', 'paid');

ALTER TABLE public.bookings
  ADD COLUMN assigned_vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  ADD COLUMN setup_image_url TEXT,
  ADD COLUMN completion_image_url TEXT,
  ADD COLUMN vendor_quote_amount NUMERIC(10,2),
  ADD COLUMN vendor_bill_amount NUMERIC(10,2),
  ADD COLUMN vendor_payment_status public.vendor_payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN vendor_paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN vendor_paid_at TIMESTAMPTZ;
CREATE INDEX idx_bookings_assigned_vendor ON public.bookings(assigned_vendor_id);

-- Read access for the vendor a booking is assigned to, mirroring the
-- existing "Users read own bookings" shape but scoped through vendors and
-- requiring the vendor to still be approved.
CREATE POLICY "Vendors read assigned bookings" ON public.bookings FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = assigned_vendor_id AND v.user_id = auth.uid() AND v.status = 'approved'
  )
);
CREATE POLICY "Vendors read assigned booking items" ON public.booking_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vendors v ON v.id = b.assigned_vendor_id
    WHERE b.id = booking_id AND v.user_id = auth.uid() AND v.status = 'approved'
  )
);
CREATE POLICY "Vendors read assigned booking status events" ON public.booking_status_events FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vendors v ON v.id = b.assigned_vendor_id
    WHERE b.id = booking_id AND v.user_id = auth.uid() AND v.status = 'approved'
  )
);

-- Vendors never get a direct UPDATE grant on bookings — RLS can restrict
-- which rows a client touches but not which columns, so every vendor
-- mutation goes through a SECURITY DEFINER RPC instead (same idiom as
-- cancel_booking). This one handles both allowed forward transitions and
-- requires the photo that gates each of them.
CREATE OR REPLACE FUNCTION public.vendor_update_booking_status(
  _booking_id UUID, _new_status public.booking_status, _image_url TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _current public.booking_status;
BEGIN
  IF _image_url IS NULL OR length(trim(_image_url)) = 0 THEN
    RAISE EXCEPTION 'A photo is required for this update';
  END IF;

  SELECT b.status INTO _current
  FROM public.bookings b
  JOIN public.vendors v ON v.id = b.assigned_vendor_id
  WHERE b.id = _booking_id AND v.user_id = auth.uid() AND v.status = 'approved'
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not assigned to you';
  END IF;

  IF _current = 'confirmed' AND _new_status = 'preparing' THEN
    UPDATE public.bookings SET status = 'preparing', setup_image_url = _image_url WHERE id = _booking_id;
  ELSIF _current = 'preparing' AND _new_status = 'completed' THEN
    UPDATE public.bookings SET status = 'completed', completion_image_url = _image_url WHERE id = _booking_id;
  ELSE
    RAISE EXCEPTION 'That status change is not allowed';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_update_booking_status(UUID, public.booking_status, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_update_booking_status(UUID, public.booking_status, TEXT) TO authenticated;

-- Narrow, single-column RPC (rather than an RLS UPDATE policy) so a vendor
-- can only ever move their own quote figure, never the admin-owned bill/
-- payment columns on the same row.
CREATE OR REPLACE FUNCTION public.vendor_submit_quote(_booking_id UUID, _amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Quote amount must be greater than 0';
  END IF;

  UPDATE public.bookings b
  SET vendor_quote_amount = _amount
  FROM public.vendors v
  WHERE b.id = _booking_id
    AND v.id = b.assigned_vendor_id
    AND v.user_id = auth.uid()
    AND v.status = 'approved'
    AND b.vendor_payment_status = 'unpaid';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, or already paid';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_submit_quote(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_submit_quote(UUID, NUMERIC) TO authenticated;
