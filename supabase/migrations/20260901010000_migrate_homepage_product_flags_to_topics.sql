-- Move the legacy product-level homepage collections into editable Topics.
WITH created AS (
  INSERT INTO public.homepage_topics (id, eyebrow, title, title_accent, sort_order, is_active)
  SELECT '00000000-0000-4000-8000-000000000001', 'Trending now', 'Trending', 'setups', 1, true
  WHERE NOT EXISTS (SELECT 1 FROM public.homepage_topics WHERE title = 'Trending' AND title_accent = 'setups')
  RETURNING id
), topic AS (
  SELECT id FROM created
  UNION ALL
  SELECT id FROM public.homepage_topics WHERE title = 'Trending' AND title_accent = 'setups' LIMIT 1
)
INSERT INTO public.homepage_topic_products (topic_id, product_id, sort_order)
SELECT topic.id, p.id, ROW_NUMBER() OVER (ORDER BY p.sort_order, p.name)
FROM topic CROSS JOIN public.products p
WHERE p.is_trending = true
ON CONFLICT (topic_id, product_id) DO NOTHING;

WITH created AS (
  INSERT INTO public.homepage_topics (id, eyebrow, title, title_accent, sort_order, is_active)
  SELECT '00000000-0000-4000-8000-000000000002', 'Hand-picked', 'Featured', 'setups', 2, true
  WHERE NOT EXISTS (SELECT 1 FROM public.homepage_topics WHERE title = 'Featured' AND title_accent = 'setups')
  RETURNING id
), topic AS (
  SELECT id FROM created
  UNION ALL
  SELECT id FROM public.homepage_topics WHERE title = 'Featured' AND title_accent = 'setups' LIMIT 1
)
INSERT INTO public.homepage_topic_products (topic_id, product_id, sort_order)
SELECT topic.id, p.id, ROW_NUMBER() OVER (ORDER BY p.sort_order, p.name)
FROM topic CROSS JOIN public.products p
WHERE p.is_featured = true
ON CONFLICT (topic_id, product_id) DO NOTHING;