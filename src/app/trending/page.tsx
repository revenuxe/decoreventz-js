import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { ServiceGridSearch } from "@/components/ServiceGridSearch";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { getTrendingServices, getHomepageTopicById } from "@/data";

const TITLE = "Trending Now";
const DESCRIPTION = "Our most-loved event decoration setups, all in one place.";

export async function generateMetadata(): Promise<Metadata> {
  const topic = await getHomepageTopicById("00000000-0000-4000-8000-000000000001");
  const services = topic?.services || await getTrendingServices(200);
  return publicPageMetadata(TITLE, DESCRIPTION, topic ? `/topics/${topic.id}` : "/trending", services[0]?.images[0], services.length > 0);
}

export default async function TrendingPage() {
  const topic = await getHomepageTopicById("00000000-0000-4000-8000-000000000001");
  if (topic) permanentRedirect(`/topics/${topic.id}`);
  // No hard cap here, unlike the homepage teaser strip — this is the "view
  // all" destination for it.
  const services = await getTrendingServices(200);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Trending", path: "/trending" }])} />
      <JsonLd data={itemListJsonLd(services)} />
      <TopBar />
      <main>
        <section className="mx-auto w-full max-w-md px-5 pt-8 md:max-w-none md:px-12 xl:px-16 md:pt-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Trending now</p>
          <h1 className="collection-title mt-1 text-3xl leading-tight text-primary md:text-5xl">
            Trending <span className="collection-title-accent">setups</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">
            The setups our customers are booking the most, right now.
          </p>
        </section>

        <ServiceGridSearch services={services} searchPlaceholder="Search trending setups…" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
