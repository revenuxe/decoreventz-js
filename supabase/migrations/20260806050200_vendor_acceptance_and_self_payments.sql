-- Two additions requested after the first vendor-portal pass:
--
-- 1. Vendors need their own "confirm/decline this job" step, separate from
--    the customer-facing booking_status enum (which already means
--    something else at 'confirmed' — the admin has confirmed the order,
--    not that a vendor has accepted it). A new vendor_accepted_at
--    timestamp keeps that distinction: quote/billing/progress-photo UI
--    only appears once the vendor has explicitly accepted. Declining
--    un-assigns the vendor (so admin can reassign) rather than touching
--    the customer's booking_status — a vendor backing out of a job must
--    never look like the customer's order got cancelled.
--
-- 2. Vendors can now add their own payment records (not just admin) —
--    still INSERT-only, so a vendor can log what they collected but can't
--    edit or delete an existing entry (including ones admin recorded).
--    recorded_by already tracks who added each row either way.

ALTER TABLE public.bookings ADD COLUMN vendor_accepted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.vendor_accept_assignment(_booking_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.bookings b
  SET vendor_accepted_at = now()
  FROM public.vendors v
  WHERE b.id = _booking_id
    AND v.id = b.assigned_vendor_id
    AND v.user_id = auth.uid()
    AND v.status = 'approved'
    AND b.vendor_accepted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, or already accepted';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_accept_assignment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_accept_assignment(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.vendor_decline_assignment(_booking_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.bookings b
  SET assigned_vendor_id = NULL, vendor_accepted_at = NULL
  FROM public.vendors v
  WHERE b.id = _booking_id
    AND v.id = b.assigned_vendor_id
    AND v.user_id = auth.uid()
    AND v.status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not assigned to you';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_decline_assignment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_decline_assignment(UUID) TO authenticated;

CREATE POLICY "Vendors add payments for assigned bookings" ON public.vendor_payments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vendors v ON v.id = b.assigned_vendor_id
    WHERE b.id = booking_id AND v.user_id = auth.uid() AND v.status = 'approved'
  )
);

-- Defense in depth: require acceptance server-side too, not just via the
-- UI hiding these actions before vendor_accepted_at is set.
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
  WHERE b.id = _booking_id AND v.user_id = auth.uid() AND v.status = 'approved' AND b.vendor_accepted_at IS NOT NULL
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, or not yet accepted';
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
    AND b.vendor_accepted_at IS NOT NULL
    AND b.vendor_payment_status = 'unpaid';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, not yet accepted, or already paid';
  END IF;
END;
$$;
