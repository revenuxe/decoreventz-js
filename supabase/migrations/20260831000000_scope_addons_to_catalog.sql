ALTER TABLE public.addons
  ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE;

CREATE INDEX idx_addons_category_scope ON public.addons (category_id, subcategory_id, sort_order);

ALTER TABLE public.addons
  ADD CONSTRAINT addons_subcategory_matches_category
  CHECK (subcategory_id IS NULL OR category_id IS NOT NULL);