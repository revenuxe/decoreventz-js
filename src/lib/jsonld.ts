import {
  BUSINESS_GEO,
  BUSINESS_HOURS,
  CONTACT,
  CONTACT_MAPS_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import type { DecorService } from "@/data/types";

// Escaping `<` prevents a `</script>`-like sequence in interpolated content
// (e.g. an admin-entered product description) from breaking out of the
// script tag — JSON.stringify alone doesn't guard against this.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/decor-eventz-logo.webp`,
    image: `${SITE_URL}/decor-eventz-logo.webp`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "₹₹",
    hasMap: CONTACT_MAPS_URL,
    geo: { "@type": "GeoCoordinates", ...BUSINESS_GEO },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: BUSINESS_HOURS.opens,
      closes: BUSINESS_HOURS.closes,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.state,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    areaServed: "Bengaluru",
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
    "@type": "Product",
    "@id": `${url}#product`,
    name: service.name,
    description:
      service.metaDescription || service.tagline || service.description,
    image: service.images,
    sku: service.id,
    category: categoryName,
    brand: { "@type": "Brand", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
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
