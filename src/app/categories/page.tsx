import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getCategories } from "@/data";
import { CategoriesGrid } from "./categories-grid";

const TITLE = "All Decoration Categories";
const DESCRIPTION =
  "Browse every occasion we decorate for — birthdays, weddings, baby showers, corporate events and more.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/categories" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Categories", path: "/categories" }])} />
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Explore</p>
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            Every <span className="italic text-gradient-brand">occasion</span>, covered
          </h1>
        </header>

        <CategoriesGrid categories={categories} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
