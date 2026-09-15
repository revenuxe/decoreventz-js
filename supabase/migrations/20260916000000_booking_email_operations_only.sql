-- Booking notifications go only to the business inbox. No customer/vendor mail.
BEGIN;
CREATE OR REPLACE FUNCTION public.queue_email(_key text, _recipient text, _payload jsonb, _reply_to text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  INSERT INTO public.email_outbox(event_key, recipient, payload, reply_to)
  SELECT _key, 'decoreventz.com@gmail.com', _payload, _reply_to
  WHERE _recipient IS NULL AND _key LIKE 'booking/%/admin'
  ON CONFLICT (event_key) DO NOTHING;
$$;
-- Preserve delivery history; cancel unsent notifications outside the new scope.
-- Never rewrite an already frozen provider request under the same idempotency key.
UPDATE public.email_outbox SET status = 'failed',
  last_error = 'disabled_by_booking_only_email_policy', locked_until = NULL, lock_token = NULL
WHERE status IN ('pending','processing') AND (
  event_key NOT LIKE 'booking/%/admin'
  OR (recipient IS NOT NULL AND recipient <> 'decoreventz.com@gmail.com')
  OR (request IS NOT NULL AND (request->'to') IS DISTINCT FROM '["decoreventz.com@gmail.com"]'::jsonb)
);
COMMIT;
