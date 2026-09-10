-- Run AFTER the transactional-email migration and Vercel deployment.
-- Enable pg_cron and pg_net in Supabase Database > Extensions first.
-- In Supabase Vault, create these two secrets before running this file:
--   email_worker_url     https://www.decoreventz.com/api/cron/email
--   email_worker_secret  exact same value as Vercel CRON_SECRET
-- Never commit actual secrets.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'email_worker_url')
    OR NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'email_worker_secret') THEN
    RAISE EXCEPTION 'Create email_worker_url and email_worker_secret in Supabase Vault first';
  END IF;
END $$;
-- Named schedule is updated on re-run rather than duplicated.
SELECT cron.schedule('decoreventz-email-worker', '* * * * *', $job$
  SELECT net.http_get(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_worker_url'),
    headers := jsonb_build_object('Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_worker_secret')),
    timeout_milliseconds := 60000
  ) WHERE EXISTS (
    SELECT 1 FROM public.email_outbox
    WHERE (status = 'pending' AND available_at <= now())
       OR (status = 'processing' AND locked_until < now())
  );
$job$);
