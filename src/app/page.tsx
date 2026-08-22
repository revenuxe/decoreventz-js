import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { PickupCta } from "@/components/PickupCta";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { SubcategoryGrid } from "@/components/SubcategoryGrid";
import { Journey } from "@/components/Journey";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import {
  getCategories,
  getTrendingServices,
  getFeaturedServices,
  getServicesByCategory,
  getCategoryBySlug,
  getHomepageHeroSlides,
} from "@/data";

// Below-the-fold and non-critical for first paint — split into its own
// chunk instead of the initial homepage bundle.
const Reviews = dynamic(() => import("@/components/Reviews").then((m) => m.Reviews));

export default async function Home() {
  const [categories, trendingServices, featuredServices, weddingCategory, heroSlides] = await Promise.all([
    getCategories(),
    getTrendingServices(8),
    getFeaturedServices(8),
    getCategoryBySlug("wedding"),
    getHomepageHeroSlides(),
  ]);
  const weddingServices = weddingCategory ? await getServicesByCategory("wedding") : [];

  return (
    <div className="min-h-dvh bg-background pb-24 md:pb-0">
      <TopBar />
      <main>
        <Hero slides={heroSlides} />
        <FeaturedCollections
          services={trendingServices}
          eyebrow="Trending now"
          title="Trending"
          titleAccent="setups"
          viewAllHref="/trending"
          cardBadge="trending"
        />
        <CategoryStrip categories={categories} />
        <FeaturedCollections
          services={featuredServices}
          eyebrow="Hand-picked"
          title="Featured"
          titleAccent="setups"
          viewAllHref="/featured"
          cardBadge="featured"
        />
        <PickupCta />
        {weddingCategory && (
          <SubcategoryGrid
            category={weddingCategory}
            services={weddingServices}
            eyebrow="From Haldi to Honeymoon"
          />
        )}
        <Journey />
        <Reviews />
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
