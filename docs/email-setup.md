# Booking email setup

## Recipient policy

Booking-related notifications go only to **decoreventz.com@gmail.com**: new bookings, status/cancellation, details, assignments, vendor quotes, bills and payment-record updates. No customer/vendor emails, contact acknowledgements or standalone vendor application emails are sent. Contact enquiries remain stored in the database. Supabase Auth confirmation/recovery emails are separate and unchanged.

Both the database queue and the application worker enforce this policy. EMAIL_ADMIN_TO cannot override the recipient.

## Resend sender

RESEND_FROM_EMAIL can be Decor Eventz <onboarding@resend.dev> only if decoreventz.com@gmail.com is the email associated with your Resend account. Otherwise verify a sending domain in Resend and use an address on that domain. Gmail is the recipient, not the sending domain.

See https://resend.com/docs/knowledge-base/403-error-resend-dev-domain.

## Production environment

Set RESEND_API_KEY, RESEND_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, CRON_SECRET and RESEND_WEBHOOK_SECRET in Vercel Production. Set EMAIL_REPLY_TO to decoreventz.com@gmail.com. CONTACT_RATE_LIMIT_SECRET is separately required for contact persistence. Do not include surrounding quotes when pasting the sender into Vercel. Redeploy after changes.

## Database and scheduler

Apply migrations through 20260916000000_booking_email_operations_only.sql. This migration suppresses unsent messages outside the new policy while preserving history and frozen provider requests. A message already accepted by the provider cannot be recalled.

Enable pg_cron and pg_net in Supabase. Create Vault entries email_worker_url = https://www.decoreventz.com/api/cron/email and email_worker_secret = the exact Vercel CRON_SECRET. Execute supabase/email-scheduler.sql after those settings exist. The worker checks for queued notifications every minute, processing up to ten per invocation.

Create a Resend webhook for https://www.decoreventz.com/api/webhooks/resend with sent/delivered/delayed/bounced/complained/failed/suppressed events and set its signing secret in Vercel. Admin > Emails shows queue and delivery status; provider acceptance alone does not guarantee inbox delivery.

## Retry safety

Requests are frozen under stable idempotency keys. Transient errors retry with backoff up to eight attempts within a 23-hour window. Never rewrite a frozen request or blindly replay messages after changing sender configuration. Inspect Resend first. Notifications disabled by the recipient policy must not be retried.

Code deployment does not configure Resend account settings or the scheduler. Verify those separately before expecting delivery.
