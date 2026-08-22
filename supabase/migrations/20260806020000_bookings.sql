-- Customer bookings (decor orders): a booking header, its line items
-- (product + add-on snapshot, since catalog prices can change after the
-- fact), and an append-only status history so the customer detail page can
-- show a real timeline instead of a static progress bar.

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'preparing', 'completed', 'cancelled');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_code TEXT NOT NULL UNIQUE DEFAULT ('BR' || upper(substr(md5(gen_random_uuid()::text), 1, 6))),
  status public.booking_status NOT NULL DEFAULT 'pending',
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue_name TEXT,
  venue_line1 TEXT NOT NULL,
  venue_line2 TEXT,
  venue_city TEXT NOT NULL,
  venue_pincode TEXT NOT NULL,
  venue_phone TEXT NOT NULL,
  notes TEXT,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  quantity INT NOT NULL DEFAULT 1,
  addons JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_booking_items_booking ON public.booking_items(booking_id);
GRANT SELECT, INSERT ON public.booking_items TO authenticated;
GRANT ALL ON public.booking_items TO service_role;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own booking items" ON public.booking_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);
CREATE POLICY "Users create own booking items" ON public.booking_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);
CREATE POLICY "Admins manage booking items" ON public.booking_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.booking_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status public.booking_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_booking_status_events_booking ON public.booking_status_events(booking_id);
GRANT SELECT ON public.booking_status_events TO authenticated;
GRANT ALL ON public.booking_status_events TO service_role;
ALTER TABLE public.booking_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own booking status events" ON public.booking_status_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);
CREATE POLICY "Admins read all booking status events" ON public.booking_status_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fires regardless of which code path changes status (customer cancel RPC,
-- future admin update) so the timeline can't drift out of sync.
CREATE OR REPLACE FUNCTION public.log_booking_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.booking_status_events (booking_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_booking_status_insert AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_booking_status();
CREATE TRIGGER trg_booking_status_update AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_booking_status();

-- Customers can only cancel while a booking is still pending — once an
-- admin confirms it, decorators may already be scheduling materials/staff,
-- so cancellation becomes an admin-only / support conversation from there.
CREATE OR REPLACE FUNCTION public.cancel_booking(_booking_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = _booking_id AND user_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking cannot be cancelled';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.cancel_booking(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_booking(UUID) TO authenticated;
