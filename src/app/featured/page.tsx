import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { ServiceGridSearch } from "@/components/ServiceGridSearch";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { getFeaturedServices } from "@/data";

const TITLE = "Featured Setups";
const DESCRIPTION = "Our team's hand-picked event decoration setups.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/featured" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/featured" },
};

export default async function FeaturedPage() {
  // No hard cap here, unlike the homepage teaser strip — this is the "view
  // all" destination for it.
  const services = await getFeaturedServices(200);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Featured", path: "/featured" }])} />
      <JsonLd data={itemListJsonLd(services)} />
      <TopBar />
      <main>
        <section className="mx-auto w-full max-w-md px-5 pt-8 md:max-w-6xl md:px-8 md:pt-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Hand-picked</p>
          <h1 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            Featured <span className="italic text-gradient-brand">setups</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">
            Our team&apos;s favourite setups, curated for you.
          </p>
        </section>

        <ServiceGridSearch services={services} searchPlaceholder="Search featured setups…" cardBadge="featured" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
