-- SEO overrides for product detail pages — all optional, storefront falls
-- back to name/tagline/first gallery image when left blank.
ALTER TABLE public.products
  ADD COLUMN meta_title TEXT,
  ADD COLUMN meta_description TEXT,
  ADD COLUMN og_image_url TEXT;
