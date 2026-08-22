// Shapes deliberately parallel the Supabase `categories`/`subcategories`/
// `products` tables (see src/lib/supabase/types.ts) — src/data/index.ts maps
// DB rows into these exact shapes, so no page/component beyond it needs to
// know the storefront is DB-backed.

export type DecorCategory = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  /** Tailwind gradient-overlay classes, same role as categories.accent */
  accent: string;
  heroImage: string;
  sortOrder: number;
  updatedAt: string;
};

export type DecorSubcategory = {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  image: string;
  sortOrder: number;
  updatedAt: string;
};

export type ServiceAddOn = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type BalloonOption = { name: string; colors: string[] };
export type ProductFaq = { question: string; answer: string };

export type DecorService = {
  id: string;
  slug: string;
  categorySlug: string;
  subcategorySlug?: string;
  name: string;
  tagline: string;
  description: string;
  /** Gallery images, [0] is the cover image. */
  images: string[];
  priceOriginal: number;
  priceDiscounted: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  included: string[];
  notIncluded: string[];
  balloonOptions: BalloonOption[];
  faqs: ProductFaq[];
  deliveryInfo?: string;
  careInfo?: string;
  tags: string[];
  addOns: ServiceAddOn[];
  sortOrder: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  /** SEO overrides — storefront falls back to name/tagline/images[0] when unset. */
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
  image: string;
};

export type ServiceCity = {
  slug: string;
  name: string;
};
