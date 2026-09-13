import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getHomepageHeroSlides,
  getTrendingServices,
} from "@/data";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { CategoryStrip } from "@/components/CategoryStrip";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in or create your Decor Eventz account to book decorations and track your bookings.",
  robots: { index: false, follow: true },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo =
    params.redirect?.startsWith("/") && !params.redirect.startsWith("//")
      ? params.redirect
      : "/";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  const [heroSlides, trendingServices, categories] = await Promise.all([
    getHomepageHeroSlides(),
    getTrendingServices(8),
    getCategories(),
  ]);

  return (
    <div className="min-h-dvh overflow-hidden bg-background">
      <TopBar />
      <main aria-hidden>
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
      </main>
      <AuthForm redirectTo={redirectTo} />
    </div>
  );
}
