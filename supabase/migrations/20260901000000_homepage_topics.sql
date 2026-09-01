CREATE TABLE public.homepage_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_accent TEXT NOT NULL DEFAULT '',
  eyebrow TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT homepage_topics_subcategory_needs_category CHECK (subcategory_id IS NULL OR category_id IS NOT NULL)
);

CREATE TABLE public.homepage_topic_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.homepage_topics(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_id, product_id)
);

CREATE INDEX idx_homepage_topics_active_order ON public.homepage_topics (is_active, sort_order);
CREATE INDEX idx_homepage_topic_products_topic_order ON public.homepage_topic_products (topic_id, sort_order);

GRANT SELECT ON public.homepage_topics, public.homepage_topic_products TO anon, authenticated;
GRANT ALL ON public.homepage_topics, public.homepage_topic_products TO service_role;

ALTER TABLE public.homepage_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_topic_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active homepage topics" ON public.homepage_topics FOR SELECT USING (is_active = true);
CREATE POLICY "Admins read all homepage topics" ON public.homepage_topics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage homepage topics" ON public.homepage_topics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read homepage topic products" ON public.homepage_topic_products FOR SELECT USING (EXISTS (SELECT 1 FROM public.homepage_topics t WHERE t.id = topic_id AND t.is_active = true));
CREATE POLICY "Admins read homepage topic products" ON public.homepage_topic_products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage homepage topic products" ON public.homepage_topic_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_homepage_topics_updated BEFORE UPDATE ON public.homepage_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();