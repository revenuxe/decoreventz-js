-- Lets the DB fill these audit columns itself instead of the client doing
-- an extra auth.getUser() round trip purely to stamp who acted, before its
-- actual write. auth.uid() already resolves to the calling user's id
-- server-side for free.
ALTER TABLE public.vendor_payments ALTER COLUMN recorded_by SET DEFAULT auth.uid();
ALTER TABLE public.vendors ALTER COLUMN reviewed_by SET DEFAULT auth.uid();
