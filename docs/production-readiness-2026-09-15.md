# Production readiness review ? 15 September 2026

## Decision

Not ready for an unrestricted launch. The code improvements below must be deployed with the database migration. The user reports S3 is now working; email setup and coordinated database deployment remain blockers. Passing these checks does not guarantee zero failures.

## Verified and fixed locally

- Upgraded Next.js and eslint-config-next from 16.2.12 to 16.3.5. Updated vulnerable transitive and test dependencies. npm audit reports zero known vulnerabilities after updates.
- Replaced browser-priced, two-request checkout with create_booking. Database prices and permitted add-ons determine snapshots and totals; unavailable items and changed prices fail before creating an order.
- Orders, line items and notification triggers share one transaction. A per-user request ID deduplicates retries, including a reload after a lost response. Changed payloads cannot reuse an existing request ID.
- Removed customer direct-insert booking policies. Restricted vendor applications to pending status and empty review metadata. Review updates stamp the acting administrator in the database.
- Fixed calendar selection converting local midnight to the previous UTC day.
- Restricted authentication redirects against backslash and control-character URL normalization bypasses. Preserved refreshed session cookies on redirects and added bookings routes to session refresh.
- Validated persisted cart/draft data; malformed storage cannot crash cart totals. Cart updates now synchronize across tabs.
- Failed search/menu catalog requests no longer permanently cache an empty catalog or a rejected request promise.

## Checks and evidence

- Production build and TypeScript check pass.
- 52 unit/database tests pass, including real PostgreSQL-compatible tests for rollback, price tampering, duplicate requests, anonymous checkout and row-level security.
- 12 current-app browser smoke tests pass: public pages, protected dashboard redirects, corrupted cart recovery, setup selection, event date persistence and sign-in handoff.
- npm audit: zero reported vulnerabilities, including development dependencies.
- Lint and TypeScript pass. Effect-driven browser state was replaced with external-store subscriptions; draft hydration, asynchronous loaders, image previews and carousel cleanup were corrected.
- The legacy browser suite still describes the previous tailoring business. Use npm run test:smoke for the new smoke coverage; the legacy suite needs replacement before it can be a reliable release gate.
- The database configured in local .env answered read-only catalog checks: 1 active category, 2 subcategories, 3 products; no missing product images or negative/inverted catalog prices found. Booking and vendor counts were zero. This does not establish that the local configuration matches the production deployment.
- Anonymous probes returned no booking, vendor, profile or role rows. Because some tables are empty, this is only a smoke check; the isolated database tests exercise actual denied writes.
- Requests to email_outbox and contact_submissions return schema-cache table-not-found errors in the configured database. HEAD counts returned null, so they were not interpreted as empty tables.
- Browser image fetches reproduce S3 403 for the reported Kids Birthday image. Vercel previously reported OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED. Optimized image dimensions do not solve source authorization failures.

## Launch blockers and deployment order

1. Confirm which Supabase project Vercel production uses and verify backups/recovery before migrations. Compare migration history; do not blindly rerun old seed migrations.
2. Apply missing migrations in order, including 20260910000000_transactional_email.sql, then 20260915000000_secure_checkout.sql. The checkout migration requires earlier catalog, vendor and customization migrations. Test in staging first.
3. Coordinate the checkout migration with deploying the updated app. The old client uses direct inserts that the migration blocks; the new client requires the new RPC. Use a maintenance window for checkout. Do not deploy the frontend alone. Existing open tabs must refresh after the coordinated release. A frontend-only rollback is insufficient after direct customer inserts are disabled.
4. Fix access to the original S3 object or replace its catalog URL with the correct public CDN URL. Verify the original and several fresh optimized sizes from an uncached browser. Local AWS credentials are absent, so bucket existence/ownership/permissions could not be inspected.
5. Verify production RESEND_API_KEY, RESEND_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY, CONTACT_RATE_LIMIT_SECRET, CRON_SECRET and RESEND_WEBHOOK_SECRET. These email/AWS settings are absent locally; production settings were not inspected. Configure the verified sender, webhook and the schedule in supabase/email-scheduler.sql. Run an explicitly authorized test submission and confirm delivery, retries and webhook updates before launch.
6. Verify email confirmation is required and existing administrator accounts are controlled. Older migrations auto-grant administrator status on signup for a fixed email address; email ownership must be verified. No authentication configuration or existing account privileges were changed in this review.
7. Complete authenticated staging acceptance tests: signup/sign-in/expiry, checkout, admin assignment, vendor approval/acceptance, quote/bill/payment records, PDFs and cancellation. No real orders, payments, customer communications or production mutations were made by this audit.
8. Replace legacy end-to-end tests and establish error alerting, uptime checks and backup restore testing. Runtime errors currently go to console; external error tracking remains a TODO in the app.

## Running the checks

Use npm ci, npm test, npx tsc --noEmit, npm run build, npm run test:smoke, npm run lint and npm audit. Browser smoke tests require Playwright Chromium and the configured public catalog (including birthday). They run a production server on port 43187. Successful page-render tests do not assert that every image loaded; the known S3 failure is recorded separately.

## Status

No live database migrations, AWS permission changes or production deployment were performed. The verified changes are prepared for the release/production-readiness-20260915 branch because production migration completion was not confirmed. Existing .env.example edits are preserved and excluded from the commit.


## Resend follow-up

The configured onboarding@resend.dev sender is restricted by Resend to the account owner. The worker now rejects this configuration before claiming queue messages, and the admin email page gives actionable setup instructions. Contact enquiries can be persisted while sender setup is incomplete. Sender validation does not verify domain ownership remotely. Set RESEND_FROM_EMAIL to an address on a domain verified in your Resend account, redeploy, and configure Supabase SMTP separately for authentication emails. Actual delivery has not been tested: no local Resend or deployment/database administration credentials are available. See docs/email-setup.md.

The latest local browser test still received 403 for the old catalog image URL despite the user's report that S3 is working. Compare the configured local catalog with the production project; do not treat page-render smoke tests as image-delivery verification.
