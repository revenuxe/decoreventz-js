import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { getCategoryBySlug, getServicesByCategory, getSubcategoriesByCategory } from "@/data";
import { CategoryProductsSection } from "./category-products-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  const title = `${category.name} Decoration`;
  const description =
    category.tagline ||
    `Book ${category.name.toLowerCase()} decoration — designed and installed by trained decorators.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${categorySlug}` },
    openGraph: { title, description, url: `/categories/${categorySlug}`, images: [category.heroImage] },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const [services, subcategories] = await Promise.all([
    getServicesByCategory(categorySlug),
    getSubcategoriesByCategory(categorySlug),
  ]);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${categorySlug}` },
        ])}
      />
      {services.length > 0 && <JsonLd data={itemListJsonLd(services)} />}
      <TopBar />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative h-56 w-full md:h-72">
            <Image
              src={category.heroImage}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-t ${category.accent} mix-blend-multiply opacity-70`}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            />
          </div>
          <div className="relative -mt-14 px-5 md:mx-auto md:max-w-6xl md:px-8">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated md:p-8">
              <h1 className="font-display text-3xl leading-tight md:text-5xl">{category.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{category.tagline}</p>
            </div>
          </div>
        </section>

        <CategoryProductsSection
          categorySlug={categorySlug}
          services={services}
          subcategories={subcategories}
        />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
