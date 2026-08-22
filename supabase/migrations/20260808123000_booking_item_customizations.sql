-- Snapshot shopper choices at checkout so admin/vendor fulfilment always sees
-- the exact balloon palette requested, even if product content changes later.
ALTER TABLE public.booking_items
  ADD COLUMN customizations JSONB NOT NULL DEFAULT '{}'::jsonb;
