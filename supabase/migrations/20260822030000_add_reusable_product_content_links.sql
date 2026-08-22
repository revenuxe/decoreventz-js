-- Keep existing per-product content as the Custom option while allowing a
-- product to reference reusable Decoration groups. SET NULL makes deleting a
-- group safe: products keep working and simply fall back to their custom data.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS included_group_id UUID REFERENCES public.decoration_content_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS faq_group_id UUID REFERENCES public.decoration_content_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_group_id UUID REFERENCES public.decoration_content_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS care_group_id UUID REFERENCES public.decoration_content_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_included_group_id ON public.products (included_group_id) WHERE included_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_faq_group_id ON public.products (faq_group_id) WHERE faq_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_delivery_group_id ON public.products (delivery_group_id) WHERE delivery_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_care_group_id ON public.products (care_group_id) WHERE care_group_id IS NOT NULL;
