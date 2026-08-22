-- A payment ledger per booking so admin can record an advance and a later
-- final settlement (or any number of partial payments) instead of a single
-- lump paid amount. bookings.vendor_paid_amount / vendor_paid_at /
-- vendor_payment_status stay as a maintained summary of this ledger (kept
-- in sync by triggers below) so the existing admin Orders Assigned UI,
-- which already reads those columns, doesn't need to change.

CREATE TABLE public.vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendor_payments_booking ON public.vendor_payments(booking_id);
GRANT SELECT ON public.vendor_payments TO authenticated;
GRANT ALL ON public.vendor_payments TO service_role;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;

-- Payments are admin-recorded only — a vendor marking themselves paid would
-- be a fraud vector, so vendors get read-only visibility via the same
-- assigned+approved join every other vendor-facing policy here uses.
CREATE POLICY "Admins manage vendor payments" ON public.vendor_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Vendors read own payments" ON public.vendor_payments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vendors v ON v.id = b.assigned_vendor_id
    WHERE b.id = booking_id AND v.user_id = auth.uid() AND v.status = 'approved'
  )
);

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
      vendor_payment_status = CASE WHEN _bill IS NOT NULL AND _total >= _bill THEN 'paid' ELSE 'unpaid' END
  WHERE id = _booking_id;

  RETURN NULL;
END;
$$;
CREATE TRIGGER trg_vendor_payments_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_vendor_payment_summary();

-- Also re-derive the paid/unpaid flag when admin edits the bill amount
-- itself (e.g. lowering it below what's already been paid).
CREATE OR REPLACE FUNCTION public.sync_vendor_payment_status_on_bill_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.vendor_bill_amount IS DISTINCT FROM OLD.vendor_bill_amount THEN
    NEW.vendor_payment_status := CASE
      WHEN NEW.vendor_bill_amount IS NOT NULL AND NEW.vendor_paid_amount >= NEW.vendor_bill_amount THEN 'paid'
      ELSE 'unpaid'
    END;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_bookings_bill_amount_sync BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_vendor_payment_status_on_bill_change();
