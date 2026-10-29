# Production readiness — 29 October 2026

## Decision

The updated source passes production build, TypeScript, repository-wide lint, unit/database/API tests, browser smoke tests, and a full local-production SEO crawl. It is prepared for deployment, with the verification limits below. This is not confirmation that every authenticated production workflow has been exercised.

The public domain already responds successfully. The reviewed compression, security and SEO changes are included in this release. Production deployment and signed-in acceptance remain to be verified. Existing Supabase image migration and storage policies were applied in the preceding work.

## Verified checks

| Check | Result |
| --- | --- |
| Unit, database and upload API tests | 93 passed |
| Production browser smoke suite | 16 passed |
| Production build and TypeScript | Passed on Next.js 16.4.3 |
| Repository-wide ESLint | Passed |
| npm audit, including development dependencies | Zero reported vulnerabilities |
| Updated production sitemap crawl | 63 canonical destinations; zero errors or warnings |
| Original image availability | 41 public image sources responded successfully |
| Empty listing exclusions | All 146 excluded category/subcategory URLs remained accessible and emitted noindex |
| Unknown category/product URLs | HTTP 404 with noindex |
| Authentication configuration (public endpoint) | Email and Google enabled; email confirmation required |
| Non-www public domain | HTTP 308 to HTTPS www |

The browser tests exercise public pages, booking/cart navigation, signed-out dashboard protection, image recovery, a real Supabase image load and signed-out image API rejection. They do not authenticate an administrator or vendor.

## Fixes made

- Removed the homepage testimonial section, including its unused component and testimonial data. The built homepage was checked to confirm it is absent.

- Updated Next.js to 16.4.3 and Zod to the patched 4.6.x line, then applied non-breaking dependency audit fixes. Both production-only and full dependency audits report zero vulnerabilities at review time.
- Removed an incorrect redirect from `/categories/corporate` to the nonexistent `/categories/corporate-events`. The actual category now renders correctly in the updated build. It remains noindex while empty.
- Excluded empty category/subcategory placeholders and their empty indexes from the sitemap. Their metadata automatically emits noindex/follow while empty and restores indexing when active products populate them. Inactive parent categories no longer produce orphan public product/subcategory URLs.
- Consolidated old `/featured` and `/trending` destinations into the populated canonical topic pages when the migrated topics exist. This fixes empty legacy collections and avoids duplicate collection destinations in the sitemap.
- Added shared, complete public metadata with canonical URLs, Open Graph and Twitter images. Empty category imagery uses the existing Supabase-hosted site artwork for previews. Reused product SEO titles/descriptions fall back to distinct product names or readable variant labels without changing database content.
- Added vendor and API paths to robots exclusions; existing protected-route noindex metadata and authorization remain in place.
- Category/subcategory saves now refresh the public catalog, alongside products and homepage slides. Cache refresh failure produces a warning without turning a successful save into a failed create.
- Admin product/category/subcategory deletion checks the database result before image cleanup. Cleanup runs after successful deletion and retains images still referenced by other catalog records or historical bookings. Product social-preview images are included in cleanup.
- New admin/vendor uploads are resized and converted to WebP before Storage. See [image-storage.md](image-storage.md) for original upload limits, output byte budgets, metadata stripping, transparency and orientation behavior.

## Upload confidence and limits

The admin upload API tests use a mocked Supabase client and real Sharp conversion. They check authenticated admin upload results, actual WebP bytes, stored size limits, unauthorized/invalid/corrupt/oversized input rejection, and reference-safe deletion. Database tests execute storage policies against PostgreSQL-compatible local test data to verify booking-photo access restrictions. These checks provide strong code-level coverage, but do not replace a real signed-in production upload.

Before treating the admin workflow as accepted, sign in to the deployed dashboard and create or update a test category/subcategory, product gallery/social image, and desktop/mobile hero. Confirm saved URLs end in `.webp`, the objects have `image/webp` content types and fit their documented budgets, and the new images appear on the storefront. Also verify a test vendor's private proof photo is readable by its authorized participants and rejected for an unrelated account. No production test accounts, orders or customer data were created during this review.

## Remaining launch work

1. Deploy the reviewed source after its GitHub push. Recheck the deployed build: the current live site still has the corporate redirect and older SEO behavior. Re-run `node scripts/audit-seo.mjs https://www.decoreventz.com docs/production-seo-live-2026-10-29.json` after deployment.
2. Confirm the hosting environment has the public Supabase URL and publishable key at build time. Image upload/download routes use the user's session and do not need a service-role key.
3. Verify production contact/email configuration and delivery. Locally absent: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `CONTACT_RATE_LIMIT_SECRET`, and `RESEND_WEBHOOK_SECRET`. Their production values were not inspected. Use [email-setup.md](email-setup.md), configure the verified sender/scheduler/webhook, then explicitly test delivery. No contact message or email was sent in this review.
4. Complete the signed-in acceptance checks above, plus checkout/booking/vendor/PDF/payment-record operations using test accounts. SMTP delivery, OAuth redirects and password reset have not been tested interactively.
5. Submit the canonical sitemap in Search Console and inspect important product URLs. HTML/crawl checks establish technical accessibility, not Google's actual indexing or ranking. Search Console and field Core Web Vitals were not accessible in this review.

## Evidence

- [Live baseline crawl](production-seo-live-2026-10-29.json): 211 sitemap entries checked before deploying these fixes. One broken corporate route produced three error diagnostics; many listing preview images were missing.
- [Updated local production crawl](production-seo-local-2026-10-29.json): full canonical sitemap, headings, metadata, structured JSON and image-source checks.
- [Empty listing checks](production-empty-listings-2026-10-29.json): 146 excluded listing routes, zero failures.
- Reusable read-only crawler: `scripts/audit-seo.mjs`.

References: [Next.js advisory](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
