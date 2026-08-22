-- New role for the vendor portal (decorators who execute bookings on-site).
-- Must be its own migration: Postgres requires ALTER TYPE ... ADD VALUE to
-- run in a transaction separate from anything that uses the new value.
ALTER TYPE public.app_role ADD VALUE 'vendor';
