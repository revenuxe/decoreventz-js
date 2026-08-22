-- Turns add-ons from one-off per-product rows into a reusable library that
-- can be assigned to any number of products (many-to-many), so an add-on
-- like "Themed cake" only needs to be created once and then attached to
-- whichever products should offer it.

CREATE TABLE public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.addons TO anon, authenticated;
GRANT ALL ON public.addons TO service_role;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read addons" ON public.addons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins read all addons" ON public.addons FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage addons" ON public.addons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_addons_updated BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_addon_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, addon_id)
);
CREATE INDEX idx_product_addon_links_product ON public.product_addon_links(product_id);
CREATE INDEX idx_product_addon_links_addon ON public.product_addon_links(addon_id);
GRANT SELECT ON public.product_addon_links TO anon, authenticated;
GRANT ALL ON public.product_addon_links TO service_role;
ALTER TABLE public.product_addon_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product addon links" ON public.product_addon_links FOR SELECT USING (true);
CREATE POLICY "Admins manage product addon links" ON public.product_addon_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing per-product add-on rows into the shared library, merging
-- ones with the same name+price into a single reusable addon.
INSERT INTO public.addons (name, price)
SELECT DISTINCT name, price FROM public.product_addons;

INSERT INTO public.product_addon_links (product_id, addon_id)
SELECT DISTINCT pa.product_id, a.id
FROM public.product_addons pa
JOIN public.addons a ON a.name = pa.name AND a.price = pa.price;

DROP TABLE public.product_addons;
