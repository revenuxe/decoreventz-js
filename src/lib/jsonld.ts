import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/site";
import type { DecorService } from "@/data/types";

// Escaping `<` prevents a `</script>`-like sequence in interpolated content
// (e.g. an admin-entered product description) from breaking out of the
// script tag — JSON.stringify alone doesn't guard against this.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Real profile URLs only (Footer.tsx's YouTube/Twitter icons are still
// placeholder "#" links) — schema.org sameAs should only list working
// social profiles.
const SAME_AS = ["https://www.instagram.com/baraabarmade/", "https://www.linkedin.com/company/baraabar"];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/decor-eventz-logo.webp`,
    image: `${SITE_URL}/decor-eventz-logo.webp`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.state,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    areaServed: "Bengaluru",
    sameAs: SAME_AS,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function itemListJsonLd(services: DecorService[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/categories/${s.categorySlug}/${s.slug}`,
    })),
  };
}

export function productJsonLd(service: DecorService, categoryName: string) {
  const url = `${SITE_URL}/categories/${service.categorySlug}/${service.slug}`;

  return {
    "@context": "https://schema.org",
    // Google Product rich results require a Product root. These are booked
    // event-decoration packages, so they belong to Google's product-snippet
    // use case (a customer requests a booking rather than checking out here).
    "@type": "Product",
    "@id": `${url}#product`,
    name: service.name,
    description: service.metaDescription || service.tagline || service.description,
    image: service.images,
    sku: service.id,
    category: categoryName,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    // A typed page node is important: an @id on its own is an invalid object
    // type for Google's structured-data parser and produces the parent_node
    // indexing error in Search Console.
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: service.priceDiscounted,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
      },
      areaServed: "Bengaluru",
    },
    ...(service.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: service.rating,
            reviewCount: service.reviewCount,
          },
        }
      : {}),
  };
}
