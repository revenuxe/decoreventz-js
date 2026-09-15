# Decor Eventz email setup

The integration is implemented in code. Live delivery requires the migration, environment variables, verified sender, scheduler, and webhook below. No production credentials are included.

## Coverage

| Action | Recipients |
| --- | --- |
| Contact form | Operations gets enquiry with customer Reply-To; customer gets generic acknowledgement |
| Booking request after line items are saved | Customer and operations |
| Booking status/cancellation and event/venue/total updates | Customer, operations, currently assigned vendor |
| Vendor application and approval/rejection | Vendor and operations |
| Vendor assignment/acceptance, quote, bill, payment-summary changes | Operations and currently assigned vendor |
| Account confirmation/recovery/email change | Supabase Auth via Resend SMTP (separate setup below) |

Catalogue editing, address saving, ordinary profile edits, sign-in, and uploads do not generate emails. Passwords and authentication tokens never enter the application queue. Vendor payment notifications describe vendor records, not customer receipts. Existing PDF downloads remain available through authenticated booking/dashboard pages.

## 1. Verify your Resend sender

Add `decoreventz.com` in Resend Domains, add the exact DNS records Resend provides, and wait for verification. Use `notifications@decoreventz.com` as the sender. If you verify a subdomain instead, use an address on that subdomain. Gmail can receive notifications and replies but cannot be your verified sending domain.

Create a Resend API key with sending permission for that domain. [Resend domain setup](https://resend.com/docs/knowledge-base/getting-started-with-resend-and-supabase).

## 2. Vercel environment variables

Add these in Project → Settings → Environment Variables → Production. Use separate test credentials/database for local and preview testing.

```dotenv
RESEND_API_KEY=re_REPLACE_WITH_YOUR_KEY
RESEND_FROM_EMAIL="Decor Eventz <notifications@decoreventz.com>"
EMAIL_ADMIN_TO=decoreventz.com@gmail.com
EMAIL_REPLY_TO=decoreventz.com@gmail.com
RESEND_WEBHOOK_SECRET=whsec_REPLACE_WITH_SIGNING_SECRET
CRON_SECRET=REPLACE_WITH_RANDOM_SECRET_1
CONTACT_RATE_LIMIT_SECRET=REPLACE_WITH_DIFFERENT_RANDOM_SECRET_2

# Existing settings also required:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_EXISTING_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://www.decoreventz.com
```

In Vercel's UI, paste the sender without the surrounding dotenv quotes. All keys/secrets above are server-only except the existing public Supabase/site variables. Never prefix email secrets with `NEXT_PUBLIC_`. Generate each secret independently:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Redeploy after setting or changing variables. The anon key cannot substitute for the service-role key.

## 3. Apply the database migration

Apply `supabase/migrations/20260910000000_transactional_email.sql` using your normal migration workflow, or run the entire file once in Supabase SQL Editor. It requires the existing booking/vendor migrations. Do not re-run it once applied.

This creates private `contact_submissions`, `email_outbox`, and `email_delivery_events` tables, privileged RPCs, and booking/vendor triggers. Historical bookings are not emailed. Future database changes queue messages regardless of the form that made them. An incomplete booking header does not send a request email; saved line items trigger it.

Queue entries commit with their source changes. Queue write failures roll back the triggering write rather than silently losing notifications. Resend failures cannot roll back bookings: sending happens later.

## 4. Minute scheduler for Vercel Hobby

Vercel Hobby cron only runs once daily, so this integration uses Supabase Cron every minute. [Vercel limits](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Supabase scheduling](https://supabase.com/docs/guides/functions/schedule-functions).

1. Deploy the code and environment variables.
2. Enable `pg_cron` and `pg_net` in Supabase Database → Extensions.
3. In Supabase Vault, create `email_worker_url` = `https://www.decoreventz.com/api/cron/email`, and `email_worker_secret` = the exact Vercel `CRON_SECRET`.
4. Run `supabase/email-scheduler.sql` in SQL Editor. Re-running this scheduler file updates the named job.
5. Check Supabase Cron history, `net._http_response`, and Vercel function logs. A successful SQL cron invocation only means the HTTP call was queued.

Use the final canonical hostname (no redirects). The worker is `GET /api/cron/email` with `Authorization: Bearer YOUR_CRON_SECRET`. It returns 401 without the secret. Ensure deployment protection permits Supabase to reach it.

The scheduler calls Vercel only when due entries exist. Normal load is processed in about a minute, up to ten emails per invocation; large backlogs take longer. Contact submissions also attempt delivery after responding. A paused database or exhausted provider/platform quota stops delivery; monitor account limits and the queue.

## 5. Resend delivery webhook

Create a webhook targeting:

```text
https://www.decoreventz.com/api/webhooks/resend
```

Select `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed` where available. Copy its signing secret into `RESEND_WEBHOOK_SECRET` and redeploy.

The official SDK verifies the raw-body signature and timestamp. Replayed events are deduplicated; append-only events preserve out-of-order delivery history. Stored webhook data contains email IDs, event types, and timestamps, not message bodies. [Webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests).

Open **Admin → Emails** (`/admin/dashboard/emails`) for the latest 100 notifications, attempts, errors, and delivery status. “Accepted by Resend” does not guarantee inbox delivery. Review bounces/complaints in Resend rather than repeatedly resending.

## 6. Authentication emails: Supabase SMTP

In Supabase Authentication → Email → SMTP settings, enable custom SMTP, or use Resend's native Supabase integration:

| Setting | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` (TLS) |
| Username | `resend` |
| Password | Your Resend API key |
| Sender email | `notifications@decoreventz.com` |
| Sender name | `Decor Eventz` |

Set the Supabase Auth Site URL to `https://www.decoreventz.com` and configure approved redirect URLs for production and intentional testing. Disable click/open tracking for authentication messages to avoid rewritten links. Supabase owns authentication templates, token generation, and Auth rate limits. These settings go in **Supabase, not Vercel**. [Resend SMTP](https://resend.com/docs/send-with-smtp).

Test confirmation links with the current account flows before enabling confirmation in production. Existing vendor signup assumes an immediate session; enabling confirmation requires validating how vendors finish their application after confirming.

## Reliability and operations

- Separate queue entry per recipient; one failed recipient does not lose the others.
- PostgreSQL locks, two-minute leases, and fencing tokens protect overlapping workers.
- Frozen provider requests and stable UUID idempotency keys protect retries. Transient errors retry with exponential backoff, at most eight attempts; permanent configuration/validation errors require review.
- Resend keys expire after 24 hours. Automatic retries stop after 23 hours to avoid ambiguous duplicate sends outside that window. This is not an unlimited exactly-once guarantee. [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
- Contact success means the message was saved, not that an email arrived.
- Server validation, escaped email HTML, private tables/RPCs, a honeypot, and atomic limits protect contact submissions: five/IP/hour, three/email/hour, 200 total/day. IPs are HMAC-hashed. Monitor traffic; add stricter WAF/CAPTCHA controls if abuse requires it.
- Queue payloads include contact/booking details. Restrict database access and define retention for old contacts and sent messages. Preserve active and unresolved entries.

For failed messages, inspect `last_error`, `resend_id`, and Resend first. Within the original 23-hour window, an operator may reset a confirmed-retryable row to `status='pending'`, `attempts=0`, `available_at=now()`, `locked_until=NULL`, preserving its ID and frozen request. Do not change the frozen sender/payload after an ambiguous attempt. Beyond that window, verify the original outcome before deliberately creating a new notification. There is no unsafe one-click replay of old messages.

## Launch verification

1. Submit a contact enquiry to an inbox you control; confirm on-page success, admin notification, customer acknowledgement, and working Reply-To.
2. Create a booking; verify customer/operations notifications, reference, venue/date, and working authenticated booking link.
3. Test status change/cancellation, vendor application/review/assignment, quote, bill, and vendor payment. Verify customer emails contain no vendor financial details.
4. Replay a Resend test webhook and confirm the delivery event appears once.
5. Test account confirmation and enabled recovery flows via Supabase SMTP.
6. Simulate temporary delivery failure only in a separate test environment; confirm retries.

Automated tests use a local in-memory PostgreSQL engine and mocked provider requests. They do not send real email or change the live database. DNS, real sending, SMTP, scheduler, and production webhooks still require account setup and live smoke tests.


## If you used onboarding@resend.dev

Resend limits that sender to the email address attached to your Resend account. It cannot send customer notifications. Verify your domain at https://resend.com/domains and change RESEND_FROM_EMAIL in Vercel Production to Decor Eventz <notifications@decoreventz.com>, without surrounding quotes. If you verified a subdomain, use that exact subdomain. Redeploy afterward. Also update the Supabase SMTP sender separately for account confirmation/recovery mail.

The worker now refuses this restricted sender before claiming queue entries. Contact enquiries can still be saved while delivery configuration is being repaired, provided the contact migration and rate-limit secret exist. Admin > Emails displays the configuration problem. The sender check does not establish that a domain is verified; verify it in Resend.

Previously failed/frozen requests are not silently rewritten after changing the sender: that would violate the provider's idempotency contract. Inspect failed messages in Resend and the queue before deliberately retrying them under the procedure above.
