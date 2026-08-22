import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { getCategoryBySlug, getServicesByCategory, getSubcategoryBySlug } from "@/data";
import { SubcategoryProductsSection } from "./subcategory-products-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategoryBySlug(categorySlug, subcategorySlug),
  ]);
  if (!subcategory) return {};
  const title = subcategory.name;
  const description =
    subcategory.tagline || `${subcategory.name} decoration${category ? ` for your ${category.name.toLowerCase()}` : ""}.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${categorySlug}/sub/${subcategorySlug}` },
    openGraph: {
      title,
      description,
      url: `/categories/${categorySlug}/sub/${subcategorySlug}`,
      images: [subcategory.image || category?.heroImage].filter((u): u is string => !!u),
    },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategoryBySlug(categorySlug, subcategorySlug),
  ]);
  if (!category || !subcategory) notFound();

  const allServices = await getServicesByCategory(categorySlug);
  const services = allServices.filter((s) => s.subcategorySlug === subcategorySlug);
  const heroImage = subcategory.image || category.heroImage;

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${categorySlug}` },
          { name: subcategory.name, path: `/categories/${categorySlug}/sub/${subcategorySlug}` },
        ])}
      />
      {services.length > 0 && <JsonLd data={itemListJsonLd(services)} />}
      <TopBar />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative h-56 w-full md:h-72">
            <Image
              src={heroImage}
              alt={subcategory.name}
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
              <Link
                href={`/categories/${categorySlug}`}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {category.name}
              </Link>
              <h1 className="font-display text-3xl leading-tight md:text-5xl">{subcategory.name}</h1>
              {subcategory.tagline && (
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{subcategory.tagline}</p>
              )}
            </div>
          </div>
        </section>

        <SubcategoryProductsSection services={services} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
