import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCategories, getAllSubcategories, getAllServices } from "@/data";

const staticEntries: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trending", changeFrequency: "daily", priority: 0.7 },
  { path: "/featured", changeFrequency: "daily", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, subcategories, services] = await Promise.all([
    getCategories(),
    getAllSubcategories(),
    getAllServices(),
  ]);

  const now = new Date();
  const staticPages = staticEntries.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const subcategoryIndexPages = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}/sub`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const subcategoryPages = subcategories.map((s) => ({
    url: `${SITE_URL}/categories/${s.categorySlug}/sub/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages = services.map((s) => ({
    url: `${SITE_URL}/categories/${s.categorySlug}/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...subcategoryIndexPages, ...subcategoryPages, ...productPages];
}
