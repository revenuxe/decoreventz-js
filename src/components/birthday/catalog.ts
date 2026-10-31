import "server-only";
import { getAllServices, getCategories } from "@/data";
import type { BirthdayDesign } from "./DecorationGallery";

export async function getBirthdayDesigns(): Promise<BirthdayDesign[]> {
  const [services, categories] = await Promise.all([
    getAllServices(),
    getCategories(),
  ]);
  const slugs = new Set(
    categories
      .filter((category) =>
        /birthday/i.test(`${category.slug} ${category.name}`),
      )
      .map((category) => category.slug),
  );
  return services
    .filter((service) => slugs.has(service.categorySlug))
    .map((service) => ({
      id: service.id,
      name: service.name,
      image: service.images[0] || "",
      href: `/categories/${service.categorySlug}/${service.slug}`,
      description: service.tagline,
      search:
        `${service.name} ${service.tagline} ${service.subcategorySlug ?? ""} ${service.tags.join(" ")}`.toLowerCase(),
    }));
}
