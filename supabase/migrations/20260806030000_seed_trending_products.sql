-- Mock data for the homepage's "Trending now" section — no products had
-- is_trending set yet, so the section rendered empty. Reuses the same
-- products (and therefore the same images) already marked is_featured, as
-- a quick way to populate it; admin can re-curate the Trending flag per
-- product independently going forward.
UPDATE public.products SET is_trending = true WHERE is_featured = true;
