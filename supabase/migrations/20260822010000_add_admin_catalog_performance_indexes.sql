-- Supports the filter and ordering patterns used throughout the admin
-- catalog without changing product data or public-facing behavior.
CREATE INDEX IF NOT EXISTS idx_products_category_sort_created
  ON public.products (category_id, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_subcategory_sort_created
  ON public.products (subcategory_id, sort_order, created_at DESC)
  WHERE subcategory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_active_sort_created
  ON public.products (is_active, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order
  ON public.categories (sort_order);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_sort_order
  ON public.subcategories (category_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_addons_sort_order
  ON public.addons (sort_order);
