# Decor Eventz indexing and search visibility audit

Audit date: 1 October 2026. Domain: https://www.decoreventz.com.

## Conclusion and limits

The current product pages are technically accessible and discoverable. The live audit found no general product robots block, authentication gate, incorrect product canonical, or client-only product content. That does not establish that Google has indexed them. Search Console URL Inspection and the Page Indexing report are needed to establish Google's actual exclusion reasons.

The strongest observed concerns are an excessive number of empty listing pages, weak differentiation and local relevance on product pages, a broken corporate redirect, and an inaccessible product image. These are actionable findings, not proof of an algorithmic penalty or the exact reason Google excludes a URL. Products updated overnight have also had very little time to be recrawled; updated_at does not establish their original publication date.

Indexing and ranking are separate. A product can be indexed but not appear prominently for competitive queries such as birthday decoration in Bangalore.

## Scope and evidence

Read repository metadata, sitemap, robots, public catalog, admin publishing, structured data, middleware, product components and the installed Next.js metadata documentation. Requested all 198 URLs in the live sitemap with six concurrent workers. Responses were 197 HTTP 200 and one final HTTP 404 after a redirect. Checked all 11 product pages and all 14 distinct original product image URLs. Checked representative product responses using Googlebot and Bingbot user-agent strings; these requests do not originate from actual Google or Bing crawler infrastructure.

Machine-readable results, page text, metadata, links, statuses, bot checks and image checks are in `seo-live-audit-2026-10-01.json`. Word counts are approximate counts of initial HTML text including navigation, related products and footer, not main-content counts or a Google word-count requirement. Response timings are single observations, not Core Web Vitals measurements.

## What is working

- Homepage, robots.txt and sitemap.xml respond successfully.
- robots.txt allows public category/product paths and advertises the correct HTTPS www sitemap.
- All 11 product URLs return HTTP 200, contain their product name and description in server-rendered HTML, have a self-referencing canonical, and have no observed noindex directive or X-Robots-Tag exclusion.
- Product JSON-LD includes Product, price, INR currency, availability and product URL. Breadcrumb JSON-LD is present.
- Every product has incoming HTML anchor links from sitemap-listed pages. Counts range from 5 to 15 source pages, excluding external backlinks.
- The non-www homepage and HTTP www homepage permanently redirect to HTTPS www.
- A deliberately nonexistent product returns 404 with noindex.
- The live sitemap includes products updated on 30 September UTC / overnight on 1 October IST. The current deployment is not showing a universally stale product sitemap.

## Findings in priority order

### 1. Empty listings dominate the sitemap

198 sitemap URLs include 15 categories, 15 subcategory indexes, 148 subcategory detail pages, 11 products, 2 topics and 7 other pages. Twelve category pages and 140 subcategory detail pages explicitly show no services: 152 empty listing pages, approximately 77% of the sitemap. Examples include `/categories/anniversary` and `/categories/anniversary/sub/anniversary-backdrop-decoration`.

These pages mostly repeat navigation/footer and a no-services message. They provide little independent value. This may lead Google to ignore these URLs or treat some as soft 404s; only Search Console can confirm that classification. At this site size, exhausting a large-site crawl budget is not established. The practical issue is publishing many low-value destinations alongside a small useful catalog.

Recommendation: include populated listings and genuinely useful editorial service pages in the sitemap. Keep empty placeholders out of the sitemap and mark them noindex while empty; allow crawling so Google can read that directive. Automatically restore indexability when they gain products or substantive useful content. Evaluate empty category indexes too. Do not remove genuine services solely because they temporarily have zero bookable products if their page still provides useful service information.

Source: `src/app/sitemap.ts`, category/subcategory page implementations, and `src/data/index.ts`.

### 2. Product content and metadata do not distinguish the packages sufficiently

`/categories/birthday/birthday-balloon-decoration` and `/categories/birthday/black-gold-birthday-balloon-decoration` both render the title and H1 `Birthday Balloon Decoration`. The black/gold URL is specific, but the visible name/title are generic. Two other products share the description `Simple & Stylish Birthday Celebration`.

Product pages contain approximately 212–291 words including common navigation, related products and footer. Their own descriptions are short, often promotional. No audited product's initial visible text mentions Bangalore or Bengaluru, although the business's JSON-LD areaServed does. This limits clarity for local booking searches. There is no minimum SEO word count; add useful facts rather than filler.

Recommendation: give each package a distinct factual product name and title. Example: `Black & Gold Birthday Balloon Decoration in Bangalore | Decor Eventz`. Describe actual quantities, dimensions, installation time, venue requirements, customization, delivery coverage, booking lead time and exclusions when verified by the business. Add original completed-installation photos and useful package-specific FAQs. Do not invent these details.

The metadata implementation uses `metaDescription || tagline`, without falling back to the product description. It therefore often exposes a slogan instead of the package's useful details. Add a sensible description fallback and publication checks for missing or duplicate metadata. Meta descriptions help communicate a result; they do not guarantee indexing or directly fix ranking.

### 3. Corporate category permanently redirects to a nonexistent category

The sitemap lists `/categories/corporate`. `next.config.ts` redirects that exact path to `/categories/corporate-events`. The destination currently returns 404. The live catalog evidently uses corporate, while the configuration comment assumes corporate-events is canonical.

Recommendation: align the redirect with the actual catalog slug. For the current catalog, corporate should resolve and any legacy corporate-events path should redirect to it. Do not rename database content without inspecting existing links and products. This is a confirmed technical bug affecting that category, not an explanation for the birthday products' indexing status.

### 4. Kids Jungle Theme Decor has an inaccessible original image

The only original image supplied for `/categories/kids-special/kids-birthday-balloon-decor` returns 403 AccessDenied for both HEAD and GET. It is also the image advertised in Product structured data. Frontend retries cannot make a denied S3 object accessible.

Recommendation: replace the product reference with a working uploaded image or repair that object's intended public access. Check the original URL returns 200. Do not broadly weaken bucket permissions without inspecting the intended storage policy. The image failure affects image discoverability and presentation, but does not by itself prove HTML indexing is blocked.

Three accessible PNG originals are approximately 2.1–2.2 MB each. Compress them for practical performance, especially because fallback rendering can load originals. Next image optimization means original sizes alone do not establish poor LCP or a ranking cause.

### 5. Useful detail tabs are absent from initial HTML until clicked

`ServiceDetailView` conditionally mounts FAQs, delivery and care content only when their tab is active. The default is included items. Their labels are present in initial HTML, but the content of inactive tabs is not. Serialized React data is not equivalent to rendered page content, and crawlers should not be expected to click tabs.

Recommendation: render useful details into HTML with accessible tabs/panels or expandable sections that preserve the text in the DOM. Verify with JavaScript disabled or an HTML response inspection. FAQ rich-result eligibility is separate and should not be promised for this business.

### 6. Ratings require verification against real reviews

All 11 products publish ratings around 4.8–4.9 and counts from 134 to 284. The repository has manually editable rating/review-count fields and seeded review counts; no product-review collection route was found. This does not prove current ratings are fabricated or that no external evidence exists.

Recommendation: establish the source of these counts. Publish aggregateRating only when supported by genuine relevant customer reviews. If they are placeholder counts, remove them from the storefront and schema. This is a trust and rich-result compliance concern, not an observed manual action or proven indexing cause.

### 7. Sitemap hygiene and publication reliability

Static and subcategory-index lastmod values are set to the generation time, regardless of actual changes. Google advises using verifiably accurate modification times. Omit dates when no reliable source exists; otherwise use actual content-change timestamps. Priority 0.9 is not an instruction to Google to rank/index a product.

Next's installed documentation says sitemap handlers are cached by default. Here the catalog uses a tagged 60-second cache, and the publishing endpoint invalidates catalog/homepage tags. Live evidence shows recent products present, so permanent sitemap staleness is not established. Make the freshness contract explicit if needed and verify publish-to-sitemap behavior. The product form currently awaits cache invalidation without checking its HTTP result, so a failed invalidation could still appear to have completed.

The catalog's Supabase selects have no explicit pagination. If the catalog later exceeds the project's PostgREST row cap, products can be omitted from the catalog and sitemap. That is a future scalability concern, not the current cause with 11 live products. Public catalog loading also depends on reusable-content queries and homepage topics for sitemap generation; monitor failures so unrelated content problems do not make public discovery unavailable.

## Search Console checks needed to establish the reason

Use the domain property covering both www and non-www. Inspect an older product and a recently uploaded one. Record: URL is on Google; exclusion reason; last crawl; crawl allowed; page fetch; indexing allowed; referring sitemap; user-declared canonical; Google-selected canonical. Run Test Live URL and inspect rendered content.

Interpretation:

- Discovered, currently not indexed: Google knows the URL but has not selected it for crawling yet. Confirm links/sitemap, remove low-value placeholders, and allow time.
- Crawled, currently not indexed: examine whether useful distinctive content and actual service information justify a separate page. Do not conclude the sitemap is broken.
- Duplicate / alternate canonical: compare Google's chosen URL with the intended product and inspect duplication/canonical consistency.
- Soft 404: identify empty listings or pages whose visible content looks like an error.
- Server error or blocked: use Crawl Stats, hosting logs and live inspection to identify failures seen by actual Google infrastructure.
- Indexed but no impressions: investigate search demand, local relevance and competition using the Performance report. This is a ranking/visibility issue.

Also inspect sitemap submission status, Manual Actions, Security Issues and Crawl Stats. No access to these private reports was available during this audit. Public search-tool results are not a complete inventory of Google's index and were not used to conclude that the domain is entirely unindexed.

## Suggested implementation order

1. Repair corporate redirect and kids product image.
2. Remove empty placeholders from sitemap and make their indexability content-dependent.
3. Distinguish product names/titles and improve verified package/local content.
4. Include useful detail-tab content in rendered HTML and verify review data.
5. Use accurate lastmod values and check publication invalidation errors.
6. Submit the corrected sitemap, inspect a representative older and newer product, request indexing once for key corrected URLs, and monitor actual indexing/impressions.

No application code, database rows, deployment settings or storage permissions were changed by this audit.

## Primary references

- https://developers.google.com/search/docs/fundamentals/how-search-works
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
