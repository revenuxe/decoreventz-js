-- Generalizes the vendor status flow: once a vendor has accepted an
-- assignment, they can drive it themselves through
-- pending -> confirmed -> preparing -> completed (rather than waiting on
-- admin to confirm first), and can cancel from any non-terminal state.
-- Completing now requires two photos at once — one of the decoration, one
-- with the decoration team — replacing the old single "setup" +
-- "completion" two-stage photo gate.
--
-- Still routed entirely through this SECURITY DEFINER RPC, never a raw
-- UPDATE — cancellation in particular is validated server-side, not just
-- hidden behind a disabled button.

ALTER TABLE public.bookings RENAME COLUMN setup_image_url TO decoration_image_url;
ALTER TABLE public.bookings RENAME COLUMN completion_image_url TO team_image_url;

-- The old 3-arg signature (_booking_id, _new_status, _image_url) is being
-- replaced by a 4-arg one below — CREATE OR REPLACE only overwrites a
-- function with the exact same parameter list, so the old signature has to
-- be dropped explicitly or it would keep existing as a second, stale
-- overload.
DROP FUNCTION IF EXISTS public.vendor_update_booking_status(UUID, public.booking_status, TEXT);

CREATE OR REPLACE FUNCTION public.vendor_update_booking_status(
  _booking_id UUID,
  _new_status public.booking_status,
  _decoration_image_url TEXT DEFAULT NULL,
  _team_image_url TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _current public.booking_status;
BEGIN
  SELECT b.status INTO _current
  FROM public.bookings b
  JOIN public.vendors v ON v.id = b.assigned_vendor_id
  WHERE b.id = _booking_id AND v.user_id = auth.uid() AND v.status = 'approved' AND b.vendor_accepted_at IS NOT NULL
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found, not assigned to you, or not yet accepted';
  END IF;

  IF _new_status = 'cancelled' THEN
    IF _current NOT IN ('pending', 'confirmed', 'preparing') THEN
      RAISE EXCEPTION 'This order can no longer be cancelled';
    END IF;
    UPDATE public.bookings SET status = 'cancelled' WHERE id = _booking_id;
  ELSIF _current = 'pending' AND _new_status = 'confirmed' THEN
    UPDATE public.bookings SET status = 'confirmed' WHERE id = _booking_id;
  ELSIF _current = 'confirmed' AND _new_status = 'preparing' THEN
    UPDATE public.bookings SET status = 'preparing' WHERE id = _booking_id;
  ELSIF _current = 'preparing' AND _new_status = 'completed' THEN
    IF _decoration_image_url IS NULL OR length(trim(_decoration_image_url)) = 0
       OR _team_image_url IS NULL OR length(trim(_team_image_url)) = 0 THEN
      RAISE EXCEPTION 'A decoration photo and a team photo are both required to mark this completed';
    END IF;
    UPDATE public.bookings
    SET status = 'completed', decoration_image_url = _decoration_image_url, team_image_url = _team_image_url
    WHERE id = _booking_id;
  ELSE
    RAISE EXCEPTION 'That status change is not allowed';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.vendor_update_booking_status(UUID, public.booking_status, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vendor_update_booking_status(UUID, public.booking_status, TEXT, TEXT) TO authenticated;
