// Read-only audit of every sitemap URL, its SEO metadata, and image sources.
import { writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const base = process.argv[2] || "http://localhost:43188";
const output = process.argv[3] || "docs/production-seo-audit-2026-10-29.json";
const canonicalOrigin = "https://www.decoreventz.com";
const report = { base, checkedAt: new Date().toISOString(), pages: [], images: [], errors: [], warnings: [] };
async function request(url) {
  return fetch(url, { signal: AbortSignal.timeout(30000), headers: { "user-agent": "DecorEventz-LaunchAudit/1.0" } });
}
async function pool(values, task) {
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < values.length) await task(values[next++]);
  }));
}
const sitemapResponse = await request(`${base}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`Sitemap HTTP ${sitemapResponse.status}`);
const xml = new JSDOM(await sitemapResponse.text(), { contentType: "text/xml" });
const entries = [...xml.window.document.getElementsByTagName("url")].map((entry) => entry.getElementsByTagName("loc")[0].textContent);
xml.window.close();
const sources = new Set();
await pool(entries, async (canonical) => {
  const path = new URL(canonical).pathname;
  const expected = `${canonicalOrigin}${path}`;
  const page = { path, status: null, canonical: null, title: null, description: null, robots: null, headings: [], structuredTypes: [], errors: [], warnings: [] };
  try {
    const response = await request(`${base}${path}`);
    page.status = response.status;
    if (response.status !== 200) page.errors.push(`HTTP ${response.status}`);
    const dom = new JSDOM(await response.text());
    const doc = dom.window.document;
    const meta = (name) => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute("content");
    page.canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    page.title = doc.querySelector("title")?.textContent;
    page.description = meta("description");
    page.robots = [meta("robots"), response.headers.get("x-robots-tag")].filter(Boolean).join("; ");
    page.headings = [...doc.querySelectorAll("h1")].map((h) => h.textContent.trim());
    if (!page.canonical || new URL(page.canonical).href !== new URL(expected).href) page.errors.push("Missing or incorrect canonical");
    if (!page.title?.trim()) page.errors.push("Missing title");
    if (!page.description?.trim()) page.errors.push("Missing description");
    if (/noindex/i.test(page.robots)) page.errors.push("Sitemap URL is noindex");
    if (page.headings.length !== 1) page.warnings.push(`H1 count ${page.headings.length}`);
    if (!meta("og:url") || new URL(meta("og:url")).href !== new URL(expected).href) page.warnings.push("Open Graph URL differs from page canonical");
    if (!meta("og:image")) page.warnings.push("Missing Open Graph image");
    for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent);
        const types = Array.isArray(data["@type"]) ? data["@type"] : [data["@type"]];
        page.structuredTypes.push(...types.filter(Boolean));
        if (types.includes("Product")) {
          if (!(Number(data.offers?.price) > 0) || data.offers?.priceCurrency !== "INR") page.errors.push("Invalid product offer");
          for (const image of Array.isArray(data.image) ? data.image : [data.image]) if (image) sources.add(image);
        }
      } catch { page.errors.push("Invalid structured-data JSON"); }
    }
    for (const image of doc.querySelectorAll("img")) {
      const raw = image.getAttribute("src");
      if (!raw || raw.startsWith("data:")) continue;
      const source = new URL(raw, base);
      const original = source.pathname === "/_next/image" ? source.searchParams.get("url") : source.href;
      if (original) sources.add(new URL(original, base).href);
    }
    for (const name of ["og:image", "twitter:image"]) if (meta(name)) sources.add(new URL(meta(name), base).href);
    dom.window.close();
  } catch (error) { page.errors.push(error.message); }
  report.pages.push(page);
});
await pool([...sources], async (url) => {
  try {
    const response = await request(url);
    const type = response.headers.get("content-type");
    report.images.push({ url, status: response.status, type });
    if (!response.ok || !type?.startsWith("image/")) report.errors.push({ url, issue: "Image source unavailable or not an image" });
    await response.body?.cancel();
  } catch (error) { report.errors.push({ url, issue: error.message }); }
});
for (const page of report.pages) {
  for (const issue of page.errors) report.errors.push({ path: page.path, issue });
  for (const issue of page.warnings) report.warnings.push({ path: page.path, issue });
}
for (const property of ["title", "description", "canonical"]) {
  const groups = new Map();
  for (const page of report.pages) if (page[property]) groups.set(page[property], [...(groups.get(page[property]) || []), page.path]);
  for (const [value, paths] of groups) if (paths.length > 1) report.warnings.push({ issue: `Duplicate ${property}`, value, paths });
}
report.pages.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ base, pages: report.pages.length, images: report.images.length, errors: report.errors.length, warnings: report.warnings.length, output }));
console.log(JSON.stringify({ errors: report.errors.slice(0, 10), warnings: report.warnings.slice(0, 10) }));
if (report.errors.length) process.exitCode = 1;
