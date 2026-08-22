-- Bugfix: the CASE expressions in both trigger functions produced an
-- untyped text literal ('paid'/'unpaid'), which Postgres won't implicitly
-- cast to the vendor_payment_status enum column — every payment insert was
-- silently failing with "column is of type vendor_payment_status but
-- expression is of type text" (42804), so paid/pending totals never
-- actually updated. Explicit casts fix it.

CREATE OR REPLACE FUNCTION public.sync_vendor_payment_summary()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _booking_id UUID := COALESCE(NEW.booking_id, OLD.booking_id);
  _total NUMERIC(10,2);
  _bill NUMERIC(10,2);
  _last_paid_at TIMESTAMPTZ;
BEGIN
  SELECT COALESCE(SUM(amount), 0), MAX(paid_at) INTO _total, _last_paid_at
  FROM public.vendor_payments WHERE booking_id = _booking_id;

  SELECT vendor_bill_amount INTO _bill FROM public.bookings WHERE id = _booking_id;

  UPDATE public.bookings
  SET vendor_paid_amount = _total,
      vendor_paid_at = _last_paid_at,
      vendor_payment_status = CASE
        WHEN _bill IS NOT NULL AND _total >= _bill THEN 'paid'::vendor_payment_status
        ELSE 'unpaid'::vendor_payment_status
      END
  WHERE id = _booking_id;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_vendor_payment_status_on_bill_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.vendor_bill_amount IS DISTINCT FROM OLD.vendor_bill_amount THEN
    NEW.vendor_payment_status := CASE
      WHEN NEW.vendor_bill_amount IS NOT NULL AND NEW.vendor_paid_amount >= NEW.vendor_bill_amount THEN 'paid'::vendor_payment_status
      ELSE 'unpaid'::vendor_payment_status
    END;
  END IF;
  RETURN NEW;
END;
$$;
