-- Powers the "complete the payment" popup shown right after a vendor
-- marks an order Completed: sets the final billed amount and records a
-- full payment for it in one atomic call, so a completed order can move
-- straight to "paid" without a separate admin step if the vendor collected
-- payment themselves. Only usable once the order is actually completed and
-- still unpaid — same SECURITY DEFINER RPC idiom as every other vendor
-- mutation here, so it bypasses vendor_payments' RLS deliberately (that's
-- the point of routing through a function instead of a raw insert) rather
-- than needing a broader self-service policy.
CREATE OR REPLACE FUNCTION public.vendor_finalize_payment(_booking_id UUID, _final_amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _final_amount IS NULL OR _final_amount <= 0 THEN
    RAISE EXCEPTION 'Final amount must be greater than 0';
  END IF;

  PERFORM 1
  FROM public.bookings b
  JOIN public.vendors v ON v.id = b.assigned_vendor_id
  WHERE b.id = _booking_id
    AND v.user_id = auth.uid()
    AND v.status = 'approved'
    AND b.status = 'completed'
    AND b.vendor_payment_status = 'unpaid'
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, not completed yet, or already paid';
  END IF;

  UPDATE public.bookings SET vendor_bill_amount = _final_amount WHERE id = _booking_id;
  INSERT INTO public.vendor_payments (booking_id, amount, note, recorded_by)
  VALUES (_booking_id, _final_amount, 'Final settlement', auth.uid());
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_finalize_payment(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_finalize_payment(UUID, NUMERIC) TO authenticated;
