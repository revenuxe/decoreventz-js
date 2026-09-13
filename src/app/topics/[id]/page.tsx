import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ServiceGridSearch } from "@/components/ServiceGridSearch";
import { getHomepageTopicById } from "@/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const topic = await getHomepageTopicById(id);
  if (!topic) return {};
  const title = [topic.title, topic.titleAccent].filter(Boolean).join(" ");
  const description = `Explore curated ${title.toLowerCase()} decoration setups from Decor Eventz in Bengaluru.`;
  const path = `/topics/${id}`;
  const image = topic.services[0]?.ogImage || topic.services[0]?.images[0];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: "Decor Eventz",
      locale: "en_IN",
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await getHomepageTopicById(id);
  if (!topic) notFound();
  return (
    <div className="min-h-dvh bg-background pb-24 md:pb-0">
      <TopBar />
      <main>
        <section className="mx-auto w-full max-w-md px-5 pt-8 md:max-w-none md:px-12 md:pt-12 xl:px-16">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            {topic.eyebrow || "Curated for you"}
          </p>
          <h1 className="collection-title mt-1 text-3xl leading-tight text-primary md:text-5xl">
            {topic.title}{" "}
            {topic.titleAccent && (
              <span className="collection-title-accent">
                {topic.titleAccent}
              </span>
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Explore all selected setups in this collection.
          </p>
        </section>
        <ServiceGridSearch
          services={topic.services}
          searchPlaceholder={`Search ${topic.title} ${topic.titleAccent}`.trim()}
        />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
