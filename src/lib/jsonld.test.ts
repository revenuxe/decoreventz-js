import { describe, expect, it } from "vitest";
import { productJsonLd } from "./jsonld";
import type { DecorService } from "@/data/types";

const service: DecorService = {
  id: "service-123",
  slug: "birthday-backdrop",
  categorySlug: "birthdays",
  name: "Birthday Backdrop",
  tagline: "A colourful birthday setup",
  description: "A complete birthday backdrop package.",
  images: ["https://example.com/backdrop.jpg"],
  priceOriginal: 12000,
  priceDiscounted: 10000,
  discountPct: 17,
  rating: 4.8,
  reviewCount: 12,
  included: [],
  notIncluded: [],
  balloonOptions: [],
  faqs: [],
  tags: [],
  addOns: [],
  sortOrder: 1,
  updatedAt: "2026-08-08T00:00:00.000Z",
};

describe("productJsonLd", () => {
  it("uses a Google-compatible Product with typed linked entities", () => {
    const jsonLd = productJsonLd(service, "Birthdays");

    expect(jsonLd).toMatchObject({
      "@type": "Product",
      "@id": "https://www.baraabar.com/categories/birthdays/birthday-backdrop#product",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://www.baraabar.com/categories/birthdays/birthday-backdrop",
      },
      offers: {
        "@type": "Offer",
        seller: {
          "@type": "Organization",
          "@id": "https://www.baraabar.com/#organization",
        },
      },
    });
  });
});
