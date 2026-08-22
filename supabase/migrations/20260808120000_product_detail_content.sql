-- Product-detail content managed from Admin > Products > Content.
-- JSON keeps each product's optional sections together while allowing the
-- storefront to evolve without creating a separate CMS for a small catalog.
ALTER TABLE public.products
  ADD COLUMN balloon_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN not_included TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN delivery_info TEXT,
  ADD COLUMN care_info TEXT;
