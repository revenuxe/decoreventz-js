import type { Metadata } from "next";
import { siteImage } from "@/data/images";
import { SITE_NAME } from "./site";
import type { DecorService } from "@/data/types";

export function publicPageMetadata(title: string, description: string, path: string, image?: string | null, index = true): Metadata {
  const images = [image || siteImage("balloonArch")];
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index, follow: true },
    openGraph: { title, description, url: path, type: "website", siteName: SITE_NAME, locale: "en_IN", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

type ProductSeo = Pick<DecorService, "id" | "name" | "slug" | "categorySlug" | "metaTitle" | "metaDescription" | "tagline" | "description" | "ogImage" | "images">;

export function publicProductMetadata(service: ProductSeo, peers: ProductSeo[]): Metadata {
  const titleFor = (item: ProductSeo) => item.metaTitle?.trim() || item.name;
  const descriptionFor = (item: ProductSeo) => item.metaDescription?.trim() || item.tagline || item.description.slice(0, 160) || `Book ${item.name} decoration in Bengaluru with Decor Eventz.`;
  const matches = (left: string, right: string) => left.trim().toLowerCase() === right.trim().toLowerCase();
  const others = peers.filter((item) => item.id !== service.id);
  const label = (slug: string) => slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  let title = titleFor(service);
  if (others.some((item) => matches(titleFor(item), title))) {
    title = service.name;
    if (others.some((item) => matches(item.name, service.name))) {
      title = label(service.slug);
      if (others.some((item) => matches(item.slug, service.slug))) title += ` | ${label(service.categorySlug)}`;
    }
  }
  const description = others.some((item) => matches(descriptionFor(item), descriptionFor(service)))
    ? `${title}: ${descriptionFor(service)}`
    : descriptionFor(service);
  return publicPageMetadata(title, description, `/categories/${service.categorySlug}/${service.slug}`, service.ogImage || service.images[0]);
}
