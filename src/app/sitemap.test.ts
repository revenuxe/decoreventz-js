import { beforeEach, expect, it, vi } from "vitest";
import sitemap from "./sitemap";

const data = vi.hoisted(() => ({ categories: vi.fn(), subcategories: vi.fn(), services: vi.fn(), topics: vi.fn() }));
vi.mock("@/data", () => ({ getCategories: data.categories, getAllSubcategories: data.subcategories, getAllServices: data.services, getHomepageTopics: data.topics }));

beforeEach(() => {
  data.categories.mockResolvedValue([
    { slug: "birthday", updatedAt: "2026-10-29T00:00:00Z" },
    { slug: "empty", updatedAt: "2026-10-29T00:00:00Z" },
  ]);
  data.subcategories.mockResolvedValue([
    { slug: "balloons", categorySlug: "birthday", updatedAt: "2026-10-29T00:00:00Z" },
    { slug: "empty-type", categorySlug: "birthday", updatedAt: "2026-10-29T00:00:00Z" },
  ]);
  data.services.mockResolvedValue([{ slug: "pink-party", categorySlug: "birthday", subcategorySlug: "balloons", updatedAt: "2026-10-29T00:00:00Z", images: ["https://example.supabase.co/photo.webp"], isFeatured: true, isTrending: false }]);
  data.topics.mockResolvedValue([{ id: "00000000-0000-4000-8000-000000000002", services: [{ images: ["https://example.supabase.co/photo.webp"] }] }]);
});

it("publishes only populated listings, products and canonical topic destinations", async () => {
  const entries = await sitemap();
  const paths = entries.map((entry) => new URL(entry.url).pathname);
  expect(paths).toContain("/categories/birthday");
  expect(paths).toContain("/categories/birthday/sub");
  expect(paths).toContain("/categories/birthday/sub/balloons");
  expect(paths).toContain("/categories/birthday/pink-party");
  expect(paths).toContain("/topics/00000000-0000-4000-8000-000000000002");
  expect(paths).not.toContain("/categories/empty");
  expect(paths).not.toContain("/categories/birthday/sub/empty-type");
  expect(paths).not.toContain("/featured");
  expect(paths).not.toContain("/trending");
  expect(entries.find((entry) => new URL(entry.url).pathname === "/categories/birthday/pink-party")?.images).toHaveLength(1);
});

it("restores a legacy collection only when populated and no canonical topic exists", async () => {
  data.topics.mockResolvedValue([]);
  expect((await sitemap()).some((entry) => entry.url.endsWith("/featured"))).toBe(true);
});
