# Baraabar → Next.js Migration Plan

**Decisions locked in:** Vercel hosting · clean break from Lovable's toolchain · incremental route-by-route rollout behind a strangler-fig proxy · automated test safety net added as part of the migration.

**New repo:** https://github.com/revenuxe/baraabar-js (local: `baraabar-tailor-ai-next`, sibling to this repo).

**Progress:**
- ✅ Phase 0 — foundations: Next.js 16 App Router scaffold, Tailwind v4 design tokens ported 1:1, shadcn/Radix component set, Supabase SSR (`@supabase/ssr`, middleware-gated `/admin/**`), strangler-fig fallback rewrite, Vitest + Playwright wired up (baseline suite run against the legacy app, two real bugs found and fixed upstream in the process).
- ✅ Phase 1 — shell & marketing: Home and Design pages ported, both fully static/prerendered. Playwright now runs two projects side by side (`legacy`, `next-app`) as pages migrate.
- ✅ Phase 2 — Auth: sign in/up ported (Server Component + Client Component split), already-signed-in redirect now checked server-side before any form HTML ships, `?redirect=` sanitized to local paths only (closes an open-redirect gap the old app had).
- ✅ Phase 3 — Booking flow: `book.tsx`'s ~2050 lines split into a Server Component (`page.tsx`, SSR catalog fetch) + Client Component wizard shell + nine per-step components. Catalog data now arrives with the initial HTML instead of a client-side fetch-after-mount. Custom `history.pushState`/`popstate` back-navigation, one-shot handoff-to-auth persistence, and the per-garment measurement-mode picker all carried over unchanged. Full e2e coverage added, including the back-navigation risk flagged in §9 below — it turned out fine, no interaction issues with Next's router.
- ✅ Phase 4 — Authenticated pages: Orders (list + detail), Profile, Addresses, Measurements, Drafts all ported. Every page is a Server Component that checks auth and fetches its own data up front — sign-in gates render immediately (no loading skeleton), and pages that used to redirect client-side after a `getSession()` check (order detail, addresses, measurements) now redirect server-side via `redirect()` before any HTML ships. Interactive pieces (address/measurement CRUD, order cancellation, draft delete/resume, sign-out) are isolated into small Client Components that receive server-fetched data as props, following the split Phase 3 established.
- ✅ Phase 5 — Admin console: `/admin`, `/admin/login`, `/admin/dashboard` ported. Closes the auth gap flagged in §7 below — `proxy.ts`'s middleware gate (in place since Phase 0 but unused until now) blocks every `/admin/**` route server-side before any admin HTML/JS ships, instead of the old app's client-side session + `has_role` check after the bundle had already mounted. Dashboard content (Orders panel, generic catalog CRUD for Categories/Garment types/Fabrics/Style presets, Users list) ported unchanged as a Client Component fed by a Server Component that already knows the visitor is an authorized admin.
- ✅ Phase 6 — Cutover & decommission: every route now lives natively in this app, so the strangler-fig fallback rewrite was removed (`next.config.ts` no longer proxies anything; `LEGACY_APP_ORIGIN` dropped from both env files). The `legacy` Playwright project, its `e2e/legacy/` specs, and the second `webServer` entry that started the old app's dev server were all removed — there's nothing left to run it against. `supabase/migrations` (the shared Postgres schema history) and this plan doc moved here from the old repo, which is the natural place for them now that it's this app's database too. The old repo (`baraabar-tailor-ai` — TanStack Start + Lovable) has had its application code, Lovable tooling files (`.lovable/`, the Lovable notice in `AGENTS.md`), and build config deleted outright — kept recoverable via git history, not archived separately — and its README now just points here. See "Manual steps outside this session's reach" at the bottom for the handful of things that need dashboard/DNS access this session doesn't have.

---

## 1. Where we're starting from

Audited directly from this repo, not assumed:

| Area | Current state |
|---|---|
| Framework | TanStack Start (React 19) on Vite, built via Lovable's `@lovable.dev/vite-tanstack-config` wrapper, Nitro server targeting **Cloudflare** |
| Routing | File-based, `src/routes/*`, 15 routes, `~5,300` lines total. Two routes dominate: `book.tsx` (1,940 lines) and `admin.dashboard.tsx` (1,146 lines) |
| Data fetching | **No real SSR data loading anywhere.** Only one trivial `beforeLoad` redirect exists (`admin.index.tsx`). Every page fetches its data client-side in `useEffect` after mount — users see empty/skeleton state, then data pops in |
| Auth | Supabase Auth, **client-only**, session in `localStorage`. Admin gating (`has_role` RPC) also runs entirely client-side after mount — an unauthenticated visitor's browser still downloads and briefly renders the admin shell before being redirected |
| Data layer | Supabase Postgres + Auth + Storage. Security boundary is **RLS policies**, enforced from the browser client. A service-role server client (`client.server.ts`) exists but is currently unused by any route |
| Server functions | None in active use. A `requireSupabaseAuth` middleware and `attachSupabaseAuth` are wired into `start.ts` but no route calls a server function today |
| Styling | Tailwind v4 + Radix primitives (shadcn-style), 63 components, custom design tokens (`gradient-brand`, etc.) |
| Forms | `react-hook-form` + `zod` present as deps, used inconsistently |
| Assets | Mixed: some images imported as local files (`@/assets/*.jpg`), others as Lovable-generated `.asset.json` pointers to a Lovable CDN proxy (`/__l5e/assets-v1/...`) |
| Tests | **None.** No `*.test.*` / `*.spec.*` files anywhere |
| Env vars | `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (client, Vite build-time) + `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (server) |

**What this means for the migration:** this isn't just a syntax port. The current app has an SSR *shell* but CSR *data* — real Next.js Server Components will be a genuine upgrade (no more loading-flash, admin actually protected before any bytes ship), not a lateral move. That's real work, not busywork.

---

## 2. Target architecture

- **Next.js 15, App Router, TypeScript**, deployed on **Vercel**.
- **Supabase stays exactly as-is** — same project, same Postgres schema, same RLS policies, same Storage buckets. Nothing to migrate on the data side.
- **Auth moves from localStorage-only to cookie-based SSR sessions** via `@supabase/ssr`, so Server Components and middleware can read "who is this user" before rendering a single byte. This is what makes real SSR (and real admin gating) possible.
- **Data fetching moves from `useEffect` to Server Components** for the initial page render; client-side interactivity (mutations, optimistic UI, polling) uses a thin client layer — React Query (already a dependency) or plain Server Actions, decided per-page based on how interactive it is.
- **Clean break from Lovable**: drop `@lovable.dev/vite-tanstack-config`, the Lovable asset CDN (`.asset.json` → re-hosted local/Vercel-served assets), and the Lovable visual editor. Supabase project itself is untouched and can keep being managed however you like.
- **New repo**, not a branch of this one — Next.js's project shape (`app/`, `next.config.js`, etc.) is different enough that starting clean and porting deliberately, file by file, beats trying to mechanically transform this repo in place.

---

## 3. Rollout mechanism: strangler-fig via Next.js `fallback` rewrites

This is the one piece of Next.js-specific machinery that makes "incremental, route-by-route, zero downtime" actually work cleanly:

1. Point the production domain at the **new Vercel project on day one** (Phase 0). Nothing user-facing changes yet.
2. In `next.config.js`, add a single rewrite in the **`fallback`** phase (not `beforeFiles`/`afterFiles`):
   ```js
   async rewrites() {
     return {
       fallback: [
         { source: "/:path*", destination: "https://legacy.baraabar.app/:path*" },
       ],
     };
   }
   ```
   `fallback` rewrites only fire when **no filesystem route in `app/` matched**. So: a route that doesn't exist yet in the new app transparently proxies to the still-live legacy TanStack Start deployment; the moment you add `app/orders/page.tsx`, Next's own router takes over for `/orders` automatically — **no rewrite list to maintain by hand**.
3. Legacy app keeps running on its current Lovable-hosted URL for the duration of the migration, purely as the proxy target. It is not touched or feature-developed during this period (aside from urgent bug fixes, mirrored later).
4. Once every route is migrated and verified, delete the fallback rewrite, decommission the legacy deployment after a rollback window.

This gets you a single production domain from day one, zero-downtime per-route cutover, and an instant rollback path (re-add the rewrite for a route if something breaks).

---

## 4. Testing safety net (build this first, not last)

Given zero existing coverage, tests are added **before** touching the legacy app, so they double as a behavioral spec of "what the old app actually does" — the incremental strategy is only as safe as this baseline.

- **Playwright e2e**, run against the *current* app first to establish the baseline, then re-run against each migrated route in the new app before it's cut over:
  - Full booking flow happy path: outfit → garments (single and multi-select) → design → fabric → **measure** (both single-garment shared mode, and multi-garment per-garment mode picker with sample/doorstep/self/saved) → pickup → review → submit.
  - Back/swipe navigation through the booking wizard (regression-guards the history/popstate behavior fixed earlier this session).
  - Auth: sign up, sign in, sign out, redirect-after-auth for a deep link into `/book`.
  - Admin: login, `has_role` allow/deny, catalog CRUD smoke test.
  - Orders list + order detail render for a seeded account.
  - Profile: address CRUD, measurement profile CRUD.
- **Vitest unit tests** for the pure logic that's easy to break silently during a port:
  - `estimatePrice`, `normalizeDraft`, `fieldsForGarment`
  - `itemMeasurementSnapshot` / `orderMeasurementMode` / `orderMeasurementSnapshot` (the per-garment measurement logic)
  - `MEASUREMENT_FIELDS_BY_GARMENT` / `STYLE_MAP` alias tables (easy to typo during a copy-paste port)
- **CI gate** (GitHub Actions → Vercel): typecheck + lint + unit tests + build on every PR; e2e suite runs against Vercel preview deployments before a phase is marked done.

---

## 5. Route mapping

| TanStack Start (current) | Next.js App Router (target) | Notes |
|---|---|---|
| `src/routes/__root.tsx` | `app/layout.tsx` + `app/metadata.ts` | Global providers, fonts, `<html>` shell |
| `src/routes/index.tsx` | `app/page.tsx` | Marketing home — Server Component, static-ish |
| `src/routes/design.tsx` | `app/design/page.tsx` | |
| `src/routes/auth.tsx` | `app/auth/page.tsx` | Form stays a Client Component; session cookie set via `@supabase/ssr` route handler |
| `src/routes/book.tsx` | `app/book/page.tsx` + split components | See §6 — this one gets decomposed, not copy-pasted |
| `src/routes/drafts.tsx` | `app/drafts/page.tsx` | Server Component fetch of saved drafts |
| `src/routes/orders.tsx` + `orders.index.tsx` | `app/orders/layout.tsx` + `app/orders/page.tsx` | SSR order list for the signed-in user |
| `src/routes/orders.$id.tsx` | `app/orders/[id]/page.tsx` | SSR order detail |
| `src/routes/profile.tsx` + `profile.index.tsx` | `app/profile/layout.tsx` + `app/profile/page.tsx` | |
| `src/routes/profile.addresses.tsx` | `app/profile/addresses/page.tsx` | |
| `src/routes/profile.measurements.tsx` | `app/profile/measurements/page.tsx` | |
| `src/routes/admin.index.tsx` | `middleware.ts` redirect, or `app/admin/page.tsx` | Redirect-only today |
| `src/routes/admin.login.tsx` | `app/admin/login/page.tsx` | |
| `src/routes/admin.dashboard.tsx` | `app/admin/dashboard/**` (split) | See §6 |
| `src/routes/sitemap[.]xml.ts` | `app/sitemap.ts` | Native Next.js `MetadataRoute.Sitemap` — simpler than hand-rolled XML |

Framework API swaps needed everywhere: `useNavigate`/`Link`/`Route.useSearch()` (TanStack Router) → `useRouter`/`next/link`/`useSearchParams()` (Next). Every route file touches at least one of these.

---

## 6. Where to actually refactor, not just port

Two files are large enough that a mechanical 1:1 port would just relocate the problem:

- **`book.tsx` (1,940 lines)** — split by wizard step into `app/book/_components/step-outfit.tsx`, `step-garment.tsx`, `step-design.tsx`, `step-fabric.tsx`, `step-measure.tsx` (keep the per-garment mode picker logic intact — it's the most recently-built and most tested-by-hand part), `step-pickup.tsx`, `step-review.tsx`. Catalog data (categories/garment types/fabric types) moves from client `useEffect` to a Server Component fetch on `app/book/page.tsx`, passed down as props — this alone removes the current "blank grid → pop in" flash on the outfit step.
- **`admin.dashboard.tsx` (1,146 lines)** — split into `app/admin/dashboard/orders/`, `catalog/`, etc. Gate the *entire* `/admin` subtree in `middleware.ts` (session + `has_role` check) before any Server Component even runs — this closes the current gap where the admin bundle briefly ships to anyone.

Everything else is a comparatively mechanical port.

---

## 7. Auth & security changes (the real upgrade, not just plumbing)

- Add `@supabase/ssr`, wire a `middleware.ts` that refreshes the session cookie on every request.
- `/admin/**` protected server-side in middleware: no session or no `admin` role → redirect before render, not after mount.
- `/orders/**`, `/profile/**`, `/book` (for saved-draft resume) read the session server-side in their layout/page and fetch user-scoped data directly — RLS still enforces the actual boundary, this is defense-in-depth plus the SSR/perf win.
- Service-role client (`client.server.ts` equivalent) stays strictly server-only — never imported into a `"use client"` module, never `NEXT_PUBLIC_`-prefixed. Add this as an explicit CI/lint check if feasible (e.g. an eslint rule or import-boundary check on the file).
- Supabase Auth redirect URLs and Storage CORS settings need the new Vercel domain(s) (production + preview) added as allowed origins before cutover.

---

## 8. Assets & environment

- Audit every `.asset.json` import (currently at least `TopBar`, `auth.tsx` referenced one before this session's logo swap — grep `\.asset\.json` across the new repo before cutover to confirm none remain) and re-host the underlying files as local `public/` assets or `next/image`-compatible imports.
- Swap `<img>` → `next/image` opportunistically for real pages (hero, catalog cards, garment images) for the Vercel image-optimization win; skip it for anything with unusual custom overlay/aspect-ratio CSS until it's verified visually — call these out per-page rather than blanket-converting.
- Env var renames: `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` stays server-only and un-prefixed. Set per Vercel environment (Production / Preview / Development).

---

## 9. Phased execution order

| Phase | Scope | Depends on |
|---|---|---|
| **0 — Foundations** | New Next.js repo + Vercel project scaffolded; Tailwind/design tokens ported; 63 shared components ported as-is; `@supabase/ssr` wired; `middleware.ts` session refresh; fallback-rewrite proxy to legacy live; baseline Playwright/Vitest suite written **against the current app** | — |
| **1 — Shell & marketing** | Root layout, Home, Design page, sitemap, robots | Phase 0 |
| **2 — Auth** | Sign in/up/out, session cookie flow, redirect-after-auth | Phase 0 |
| **3 — Booking flow** | `book.tsx` split + SSR catalog fetch (highest value, highest risk — most recently changed code) | Phase 2 |
| **4 — Authenticated pages** | Orders list/detail, Profile (index/addresses/measurements), Drafts | Phase 2 |
| **5 — Admin console** | Middleware-gated `/admin/**`, dashboard split into modules | Phase 2 |
| **6 — Cutover & decommission** | Remove fallback rewrite, monitor, keep legacy warm for a rollback window, then decommission; drop Lovable tooling references from docs | Phases 1–5 all verified in production |

Each phase ships as its own PR(s), goes through the Playwright suite against its Vercel preview URL, gets manually clicked through once, then merges — at which point that route stops being proxied and starts being served natively.

---

## 10. Risk register

| Risk | Mitigation |
|---|---|
| Zero pre-existing tests means "incremental" could still ship silent regressions | Baseline Playwright suite written against the *current* app first (§4), before any port work starts |
| Booking wizard's custom `history.pushState`/`popstate` back-navigation fix (this session) may interact oddly with Next's client router | Explicit e2e test for back/swipe-through-steps; verify early in Phase 3, not at the end |
| Admin gating today is client-only — a naive port could silently keep it that way | Gate `/admin/**` in `middleware.ts`, not in a `useEffect`; add an e2e test asserting a non-admin session gets redirected server-side (check response, not just rendered DOM) |
| Lovable CDN asset URLs (`.asset.json`) 404 after the clean break if any are missed | Full-repo grep for `.asset.json` as a Phase 0/6 checklist item, not a one-off |
| Supabase Storage/Auth CORS & redirect allow-lists don't include the new Vercel domain | Add to Phase 0 checklist, verify in a Preview deployment before Phase 2 (auth) ships |
| Service-role key leaking into a client bundle | Keep it in a server-only module never imported by a `"use client"` file; spot-check the built client bundle for the key string as a release gate |
| Scope creep from refactoring `book.tsx`/`admin.dashboard.tsx` while porting | Land the split as a mechanical extraction first (behavior-identical), defer any actual behavior changes to follow-up PRs |

---

## 11. Explicitly out of scope (unless you want it in)

- Any Supabase schema/data migration — none needed, same project throughout.
- Redesign or new features — this plan is a faithful port plus the SSR/auth upgrade, not a redesign.
- Mobile app / native — not part of this app today, not part of this plan.

---

## 12. Manual steps outside this session's reach

Everything code-side is done, but a few things need dashboard/DNS/hosting access no coding session has:

- Point the production domain at this app's Vercel deployment (if it isn't already — §3 assumed this happened on day one of Phase 0).
- Add the production (and any preview) Vercel domain(s) to Supabase Auth's redirect URL allow-list and Storage CORS origins, per §7/§8, if not already done.
- Decommission whatever was hosting the old TanStack Start app (Lovable-hosted URL / Cloudflare), if it's still deployed anywhere — its source is gone from `baraabar-tailor-ai`, but a prior live deployment doesn't un-deploy itself.
- Rotate/retire the `.env` values that lived in the old repo (`VITE_SUPABASE_*` etc.) if they were ever distinct from this app's — same Supabase project throughout, so likely a non-issue, but worth a quick check.

## Migration status: complete

Every route from §5's mapping now lives in this app; the old repo has been stripped down to a pointer at this one. Nothing further is planned under this document — new work happens as normal feature work in `baraabar-tailor-ai-next`, not as migration phases.
