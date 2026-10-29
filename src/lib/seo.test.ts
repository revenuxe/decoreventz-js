import { expect, it } from "vitest";
import { publicPageMetadata, publicProductMetadata } from "./seo";

it("keeps page identity and preview images aligned with its canonical path", () => {
  const result = publicPageMetadata("Birthday", "Birthday decorations", "/categories/birthday");
  expect(result.alternates?.canonical).toBe("/categories/birthday");
  expect(result.openGraph).toMatchObject({ title: "Birthday", description: "Birthday decorations", url: "/categories/birthday", images: [expect.stringContaining("supabase.co/storage/")] });
  expect(result.twitter).toMatchObject({ title: "Birthday", images: [expect.stringContaining("supabase.co/storage/")] });
});

it("marks empty listings noindex while leaving their links crawlable", () => {
  expect(publicPageMetadata("Empty listing", "Coming soon", "/empty", null, false).robots).toEqual({ index: false, follow: true });
});

it("distinguishes products when catalog SEO titles and descriptions were reused", () => {
  const first = { id: "a", name: "Black Gold Birthday", slug: "black-gold", categorySlug: "birthday", metaTitle: "Birthday Balloons", tagline: "Stylish celebration", description: "", images: [] };
  const second = { ...first, id: "b", name: "Pastel Birthday", slug: "pastel" };
  const peers = [first, second];
  expect(publicProductMetadata(first, peers).title).toBe(first.name);
  expect(publicProductMetadata(second, peers).title).toBe(second.name);
  expect(publicProductMetadata(first, peers).description).toBe("Black Gold Birthday: Stylish celebration");
  expect(publicProductMetadata(second, peers).description).toBe("Pastel Birthday: Stylish celebration");
});

it("distinguishes product variants even when their display names are identical", () => {
  const first = { id: "a", name: "Birthday Balloons", slug: "black-gold-birthday-balloons", categorySlug: "birthday", tagline: "Stylish celebration", description: "", images: [] };
  const second = { ...first, id: "b", slug: "pastel-birthday-balloons" };
  const peers = [first, second];
  expect(publicProductMetadata(first, peers).title).toBe("Black Gold Birthday Balloons");
  expect(publicProductMetadata(second, peers).title).toBe("Pastel Birthday Balloons");
});
