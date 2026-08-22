-- A palette is the reusable source of truth. Pairs are stored as ordered JSON
-- inside the existing decoration_content_items row so saving a palette is one
-- atomic write, rather than a partially-updated set of child records.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS balloon_palette_id UUID
  REFERENCES public.decoration_content_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_balloon_palette_id
  ON public.products (balloon_palette_id)
  WHERE balloon_palette_id IS NOT NULL;

-- Preserve any earlier Pair Group data by materialising the existing links
-- into the palette's content. The legacy tables are intentionally retained:
-- this migration never deletes production data and the application no longer
-- writes to them.
WITH palette_pairs AS (
  SELECT
    link.palette_id,
    jsonb_agg(
      jsonb_build_object(
        'id', link.pair_group_id::text,
        'sortOrder', link.sort_order,
        'color1', jsonb_build_object(
          'name', COALESCE(pair.balloons->0->>'name', 'Color 1'),
          'hex', COALESCE(pair.balloons->0->>'color', '#ffffff')
        ),
        'color2', jsonb_build_object(
          'name', COALESCE(pair.balloons->1->>'name', 'Color 2'),
          'hex', COALESCE(pair.balloons->1->>'color', '#ffffff')
        )
      ) ORDER BY link.sort_order
    ) AS pairs
  FROM public.balloon_palette_pair_links link
  JOIN public.balloon_pair_groups pair ON pair.id = link.pair_group_id
  GROUP BY link.palette_id
)
UPDATE public.decoration_content_items palette
SET content = jsonb_set(COALESCE(palette.content, '{}'::jsonb), '{pairs}', palette_pairs.pairs, true)
FROM palette_pairs
WHERE palette.id = palette_pairs.palette_id
  AND palette.kind = 'balloon_palette';
