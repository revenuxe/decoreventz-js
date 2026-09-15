"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SearchCategory = { slug: string; name: string; tagline: string };
export type SearchService = {
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  priceDiscounted: number;
};

type SearchCatalog = { categories: SearchCategory[]; services: SearchService[] };

// Module-level cache — the overlay and the hero search bar both use this
// hook, and re-fetching the whole catalog every time either one opens would
// be wasteful. Good for the lifetime of the tab; a hard refresh re-fetches.
let cache: SearchCatalog | null = null;
let inflight: Promise<SearchCatalog> | null = null;

async function fetchCatalog(): Promise<SearchCatalog> {
  const supabase = createClient();
  const [{ data: categoryRows, error: categoriesError }, { data: productRows, error: productsError }] = await Promise.all([
    supabase
      .from("categories")
      .select("slug,name,tagline")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select("slug,name,tagline,price,sale_price,categories(slug)")
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  if (categoriesError || productsError) throw new Error("Catalog temporarily unavailable");

  const categories: SearchCategory[] = (categoryRows ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline ?? "",
  }));
  const services: SearchService[] = (productRows ?? []).map((p) => ({
    slug: p.slug,
    categorySlug: p.categories?.slug ?? "",
    name: p.name,
    tagline: p.tagline ?? "",
    priceDiscounted: p.sale_price ?? p.price,
  }));

  return { categories, services };
}

export function useCatalogSearch(enabled: boolean = true): SearchCatalog {
  const [data, setData] = useState<SearchCatalog>(cache ?? { categories: [], services: [] });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    if (!cache && !inflight) {
      inflight = fetchCatalog().then((result) => (cache = result)).finally(() => { inflight = null; });
    }
    (cache ? Promise.resolve(cache) : inflight!).then((result) => {
      if (active) setData(result);
    }).catch(() => { /* Leave cache empty so the next opening retries. */ });
    return () => { active = false; };
  }, [enabled]);

  return data;
}
