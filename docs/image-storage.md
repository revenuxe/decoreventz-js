# Supabase image storage

All application uploads use Supabase Storage with the signed-in user's session. No separate storage credentials are required. The service-role key is not used by upload or download routes.

## Buckets and access

- `catalog-images` is public. Admins upload catalog artwork through `/api/upload`. Only admins can delete files, and files referenced by saved records are retained. Object names are unique; uploads never overwrite existing objects.
- `booking-images` is private. An approved vendor can upload proof photos only for a booking assigned to them. The booking's customer, assigned approved vendor, and admins can read its photos. Vendors cannot overwrite or delete proof photos.
- Both buckets accept JPEG, PNG, WebP, GIF, AVIF, HEIC, HEIF and BMP images up to 4 MB. The application checks file signatures as well as size.

Policies and buckets are defined in `supabase/migrations/20261029000000_supabase_image_storage.sql`. Apply pending migrations with `npx supabase db push --linked`.

## Dashboard and database fields

| Screen or record | Supabase table and image fields | Storage |
| --- | --- | --- |
| Categories | `categories.image_url` | Public catalog |
| Subcategories | `subcategories.image_url` | Public catalog |
| Product gallery and cover | `products.images` (ordered array; first image is cover) | Public catalog |
| Product social preview | `products.og_image_url` | Public catalog |
| Homepage hero | `homepage_hero_slides.desktop_image_url`, `mobile_image_url` | Public catalog |
| Vendor order completion | `bookings.decoration_image_url`, `team_image_url` | Private booking photos |
| Historical order lines | `booking_items.image`, image references inside `addons` and `customizations` | Retained catalog references |
| Reusable decoration content | `decoration_content_items.content` | Existing references retained |
| Profile avatar | `profiles.avatar_url` | Existing references retained; no avatar upload feature |

The business records were already in Supabase Postgres. No duplicate tables or database provider changes are needed. Admin image controls upload files or reuse an existing catalog URL from this project. Editing a draft does not delete saved images.

Category, subcategory, product gallery/social-preview, and homepage slide saves wait for pending image uploads. Image controls are locked during upload so edits cannot race with a late upload result. Admin and vendor upload clients reject empty/oversized files before sending and handle expired sessions, malformed JSON, and hosting-platform size-limit responses with readable errors.

Vendor photo fields store stable `/api/booking-images/bookings/<booking-id>/<kind>/<filename>` routes. Every request authenticates the caller; Storage RLS authorizes the read, then the route redirects to a signed URL valid for 60 seconds. Redirect responses are private and not cached. These photos bypass the Next.js optimizer so browser authentication is preserved. Signed URLs are never stored in database fields.

## Existing catalog migration

On 29 October 2026, 36 distinct catalog source images were copied into `catalog-images/imported/` and verified byte-for-byte before updating 34 catalog records, including inactive entries. The migration covered category, subcategory, product gallery, product social preview, and homepage hero fields. `docs/catalog-image-migration-report.json` preserves public source/destination mappings for audit and recovery; source objects were not deleted. Five existing static testimonial/social-preview images were also copied and verified, bringing the total to 41. Their Supabase URLs are recorded in `src/data/image-assets.json`; application image configuration now allows only Supabase Storage.

`node scripts/migrate-catalog-images.mjs` inspects public image sources without changing data. `--apply` copies and updates catalog image fields, including inactive records, using a server-only migration credential. Set `SUPABASE_CLI_BINARY` to a CLI executable authenticated to the linked project, or supply `SUPABASE_SERVICE_ROLE_KEY` in the local environment. The CLI credential is captured only in memory. The script never reads private business tables. It retains failed source references, verifies destination bytes, and compares old image field values to avoid overwriting concurrent edits. Repeated runs reuse deterministic object names.

Aggregate checks found no legacy provider URLs in booking proof fields, booking snapshots, decoration content or profile avatars. Those tables required no image data changes.

Historical audit documents and the migration mapping may mention previous providers. They are evidence, not application dependencies or setup instructions.

## Deployment and checks

Deploy the updated application source to activate the new routes and remove old cached catalog URLs. Restart local development after environment changes. Public Supabase variables must be supplied before a production build.

Verify a new catalog image is publicly readable, anonymous uploads fail, private proof photos reject unrelated accounts, and existing catalog pages render. Unit/database tests cover private storage authorization, deletion protection and URL boundaries. Login-based browser verification still needs test accounts.

Validated on 29 October 2026: 81 unit/database/API tests passed, covering successful authenticated admin upload behavior with a mocked Storage service, rejection of invalid files and unauthorized callers, safe deletion, upload-state coordination, and platform-error handling. The 16 production browser smoke checks cover real Supabase catalog image loading and signed-out API rejection. Production build, TypeScript, changed-file lint and whitespace checks passed. Live anonymous Storage uploads and private-photo signing were rejected. Aggregate database checks found zero external image references in all four catalog tables, including inactive rows. The dependency lockfile contains no AWS SDK packages, and active application/source checks found no legacy storage-provider references.

The remote storage migration and catalog URL updates are applied. The application source changes have not been deployed to production.

See [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) and [private downloads](https://supabase.com/docs/guides/storage/serving/downloads).
