-- Balloon pairs are reusable building blocks; palettes assemble any number of them.
CREATE TABLE public.balloon_pair_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  balloons JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_balloon_pair_groups_updated BEFORE UPDATE ON public.balloon_pair_groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.balloon_pair_groups ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.balloon_pair_groups TO anon, authenticated;
GRANT ALL ON public.balloon_pair_groups TO service_role;
CREATE POLICY "Public read active balloon pairs" ON public.balloon_pair_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage balloon pairs" ON public.balloon_pair_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.balloon_palette_pair_links (
  palette_id UUID NOT NULL REFERENCES public.decoration_content_items(id) ON DELETE CASCADE,
  pair_group_id UUID NOT NULL REFERENCES public.balloon_pair_groups(id) ON DELETE RESTRICT,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (palette_id, pair_group_id)
);
ALTER TABLE public.balloon_palette_pair_links ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.balloon_palette_pair_links TO anon, authenticated;
GRANT ALL ON public.balloon_palette_pair_links TO service_role;
CREATE POLICY "Public read palette pairs" ON public.balloon_palette_pair_links FOR SELECT USING (true);
CREATE POLICY "Admins manage palette pairs" ON public.balloon_palette_pair_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
