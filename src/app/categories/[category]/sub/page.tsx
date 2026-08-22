import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getCategoryBySlug, getSubcategoriesByCategory } from "@/data";
import { SubcategoriesGrid } from "./subcategories-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  const title = `All ${category.name} Types`;
  const description = `Every type of ${category.name.toLowerCase()} decor we offer.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${categorySlug}/sub` },
    openGraph: { title, description, url: `/categories/${categorySlug}/sub` },
  };
}

export default async function AllSubcategoriesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const subcategories = await getSubcategoriesByCategory(categorySlug);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${categorySlug}` },
          { name: "All types", path: `/categories/${categorySlug}/sub` },
        ])}
      />
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        <Link
          href={`/categories/${categorySlug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {category.name}
        </Link>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Shop by type</p>
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            All <span className="italic text-gradient-brand">{category.name}</span> types
          </h1>
        </header>

        <SubcategoriesGrid categorySlug={categorySlug} subcategories={subcategories} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
