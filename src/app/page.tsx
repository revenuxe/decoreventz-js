import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { PickupCta } from "@/components/PickupCta";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { Journey } from "@/components/Journey";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import {
  getCategories,
  getHomepageHeroSlides,
  getHomepageTopics,
} from "@/data";

// Below-the-fold and non-critical for first paint — split into its own
// chunk instead of the initial homepage bundle.
const Reviews = dynamic(() => import("@/components/Reviews").then((m) => m.Reviews));

export default async function Home() {
  const [categories, heroSlides, homepageTopics] = await Promise.all([
    getCategories(),
    getHomepageHeroSlides(),
    getHomepageTopics(),
  ]);
  const orderedTopics = [...homepageTopics].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const [trendingTopic, ...remainingTopics] = orderedTopics;

  return (
    <div className="min-h-dvh bg-background pb-24 md:pb-0">
      <TopBar />
      <main>
        <Hero slides={heroSlides} />
        {trendingTopic && (
          <FeaturedCollections
            services={trendingTopic.services}
            eyebrow={trendingTopic.eyebrow || "Trending now"}
            title={trendingTopic.title}
            titleAccent={trendingTopic.titleAccent}
            viewAllHref={`/topics/${trendingTopic.id}`}
          />
        )}
        <CategoryStrip categories={categories} />
        {remainingTopics.map((section) => (
          <FeaturedCollections
            key={section.id}
            services={section.services}
            eyebrow={section.eyebrow || "Curated for you"}
            title={section.title}
            titleAccent={section.titleAccent}
            viewAllHref={`/topics/${section.id}`}
          />
        ))}
        <PickupCta />
        <Journey />
        <Reviews />
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
