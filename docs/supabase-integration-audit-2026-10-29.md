# Supabase integration audit — 29 October 2026

## Connection and implementation

- CLI-linked project: `qnptiezbwylqhgniapyz`. The configured app URL matches it.
- All 34 local migrations match the remote migration history; no migration push was needed.
- Authentication, public catalog, bookings, customer profiles, and admin/vendor workflows already use Supabase. Browser, server, public catalog, and session-refresh clients are implemented.
- Fixed a blocking configuration mismatch: `.env` defines `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, while the app previously required `NEXT_PUBLIC_SUPABASE_ANON_KEY`. All four clients now share a configuration helper that prefers the publishable key and supports the legacy anon key. Missing configuration produces an explicit error.
- Public variables use direct `process.env` references so Next.js includes them in browser builds.

## Read-only live checks

The configured public key successfully queried the remote API. Anonymous visibility at audit time:

| Table | Visible rows |
| --- | ---: |
| categories | 15 |
| subcategories | 148 |
| products | 23 |
| addons | 0 |
| homepage_topics | 3 |
| homepage_topic_products | 46 |
| homepage_hero_slides | 3 |
| decoration_content_items | 1 |

Anonymous reads returned no rows for `profiles`, `user_roles`, `bookings`, `booking_items`, `vendors`, and `vendor_payments`. These results do not prove every authorization policy is correct or that the tables are empty. Anonymous access to `email_outbox` returned HTTP 401.

The Auth settings endpoint returned HTTP 200: email and Google providers are enabled, and signup is enabled. Interactive login, email delivery, OAuth redirect configuration, and authenticated role behavior still require end-to-end verification with test accounts.

## Remaining setup

- `.env` contains two assignments to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; consolidate them into one intended value. Values were not printed or copied into this report.
- Local configuration lacks `SUPABASE_SERVICE_ROLE_KEY` and Resend/email settings used by the contact and transactional email backend. See `docs/email-setup.md`. Keep these server-only.
- Superseded by the subsequent storage migration: uploads now use Supabase Storage. See `docs/image-storage.md` for verified migration results and current setup.
- These observations concern local environment files; deployed environment settings were not inspected.
- The Supabase executable is cached by npm but is not on this session's PATH. A cached CLI executable successfully accessed the linked migration history. Use `npx supabase` for normal CLI commands.
- Restart development after environment changes. Supply public Supabase variables before a production build because Next.js embeds them in browser assets.

No database rows, schema, remote authentication settings, or deployed services were changed during this audit.

References: [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
