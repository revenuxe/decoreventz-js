CREATE TABLE public.homepage_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  kicker TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  action_label TEXT NOT NULL DEFAULT 'Explore setups',
  action_url TEXT NOT NULL DEFAULT '/categories',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homepage_hero_slides_active_order ON public.homepage_hero_slides (is_active, sort_order);
GRANT SELECT ON public.homepage_hero_slides TO anon, authenticated;
GRANT ALL ON public.homepage_hero_slides TO service_role;
ALTER TABLE public.homepage_hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active homepage hero slides" ON public.homepage_hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins read all homepage hero slides" ON public.homepage_hero_slides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage homepage hero slides" ON public.homepage_hero_slides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_homepage_hero_slides_updated BEFORE UPDATE ON public.homepage_hero_slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.homepage_hero_slides (desktop_image_url, kicker, title, subtitle, action_label, sort_order) VALUES
  ('https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1400&auto=format&fit=crop&h=900', 'Last minute party?', 'We''ve got you covered.', 'Trained decorators, premium props and a clean setup at your venue.', 'Explore setups', 1),
  ('https://images.unsplash.com/photo-1711180674489-c5b50e0e55db?q=80&w=1400&auto=format&fit=crop&h=900', 'Festive décor', 'Make every celebration shine.', 'Thoughtful festive decoration for intimate gatherings and grand occasions.', 'Explore festive', 2),
  ('https://images.unsplash.com/photo-1769230359465-815291dc92f4?q=80&w=1400&auto=format&fit=crop&h=900', 'Special moments', 'Celebrate love, beautifully.', 'Romantic décor that turns your favourite moments into lasting memories.', 'Explore romance', 3);
