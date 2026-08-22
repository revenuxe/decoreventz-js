-- Lets a vendor build an itemized quote (starting from the booking's own
-- items, plus whatever extra line items they want to bill for) instead of
-- just a single lump quote number. vendor_quote_amount stays as the
-- authoritative total — kept in sync with the items here — so every
-- existing consumer (admin's Orders Assigned/Billing tabs, the vendor
-- overview stats) that already reads that column keeps working unchanged.

ALTER TABLE public.bookings ADD COLUMN vendor_quote_items JSONB NOT NULL DEFAULT '[]';

CREATE OR REPLACE FUNCTION public.vendor_save_quote(_booking_id UUID, _items JSONB, _total NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _total IS NULL OR _total <= 0 THEN
    RAISE EXCEPTION 'Quote total must be greater than 0';
  END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Quote items must be a list';
  END IF;

  UPDATE public.bookings b
  SET vendor_quote_amount = _total, vendor_quote_items = _items
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
REVOKE EXECUTE ON FUNCTION public.vendor_save_quote(UUID, JSONB, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_save_quote(UUID, JSONB, NUMERIC) TO authenticated;
