CREATE TYPE public.decoration_content_kind AS ENUM ('balloon_palette', 'included_set', 'faq_set', 'delivery_note', 'care_note');

CREATE TABLE public.decoration_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.decoration_content_kind NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(kind, name)
);
CREATE INDEX idx_decoration_content_items_kind ON public.decoration_content_items(kind, name);
GRANT SELECT ON public.decoration_content_items TO anon, authenticated;
GRANT ALL ON public.decoration_content_items TO service_role;
ALTER TABLE public.decoration_content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active decoration content" ON public.decoration_content_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins read all decoration content" ON public.decoration_content_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage decoration content" ON public.decoration_content_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_decoration_content_items_updated BEFORE UPDATE ON public.decoration_content_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_decoration_content_links (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.decoration_content_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, content_item_id)
);
CREATE INDEX idx_product_decoration_content_links_item ON public.product_decoration_content_links(content_item_id);
GRANT SELECT ON public.product_decoration_content_links TO anon, authenticated;
GRANT ALL ON public.product_decoration_content_links TO service_role;
ALTER TABLE public.product_decoration_content_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read decoration links" ON public.product_decoration_content_links FOR SELECT USING (true);
CREATE POLICY "Admins manage decoration links" ON public.product_decoration_content_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
