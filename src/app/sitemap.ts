import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  getCategories,
  getAllSubcategories,
  getAllServices,
  getHomepageTopics,
} from "@/data";

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
  const [categories, subcategories, services, topics] = await Promise.all([
    getCategories(),
    getAllSubcategories(),
    getAllServices(),
    getHomepageTopics(),
  ]);

  const populatedCategories = categories.filter((category) => services.some((service) => service.categorySlug === category.slug));
  const populatedSubcategories = subcategories.filter((sub) => services.some((service) => service.categorySlug === sub.categorySlug && service.subcategorySlug === sub.slug));
  const staticPages = staticEntries.filter((entry) => {
    if (entry.path === "/trending") return !topics.some((topic) => topic.id === "00000000-0000-4000-8000-000000000001") && services.some((service) => service.isTrending);
    if (entry.path === "/featured") return !topics.some((topic) => topic.id === "00000000-0000-4000-8000-000000000002") && services.some((service) => service.isFeatured);
    return true;
  }).map((e) => ({
    url: `${SITE_URL}${e.path}`,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));

  const categoryPages = populatedCategories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: c.heroImage ? [c.heroImage] : [],
  }));

  const subcategoryIndexPages = populatedCategories.filter((category) => populatedSubcategories.some((sub) => sub.categorySlug === category.slug)).map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}/sub`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const subcategoryPages = populatedSubcategories.map((s) => ({
    url: `${SITE_URL}/categories/${s.categorySlug}/sub/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: s.image ? [s.image] : [],
  }));

  const productPages = services.map((s) => ({
    url: `${SITE_URL}/categories/${s.categorySlug}/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
    images: s.images,
  }));

  const topicPages = topics.map((topic) => ({
    url: `${SITE_URL}/topics/${topic.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: topic.services.flatMap((service) => service.images).slice(0, 10),
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryIndexPages,
    ...subcategoryPages,
    ...productPages,
    ...topicPages,
  ];
}
