"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MegaMenuCategory = { slug: string; name: string };
export type MegaMenuSubcategory = { slug: string; name: string; categorySlug: string };
export type MegaMenuProduct = { slug: string; categorySlug: string; subcategorySlug: string; name: string; image: string };

type MegaMenuData = {
  categories: MegaMenuCategory[];
  subcategories: MegaMenuSubcategory[];
  products: MegaMenuProduct[];
};

const EMPTY: MegaMenuData = { categories: [], subcategories: [], products: [] };

// Module-level cache — fetched once per tab, shared by every open of the
// menu (mirrors the pattern in use-catalog-search.ts).
let cache: MegaMenuData | null = null;
let inflight: Promise<MegaMenuData> | null = null;

async function fetchMegaMenuData(): Promise<MegaMenuData> {
  const supabase = createClient();
  const [{ data: cats, error: categoriesError }, { data: subs, error: subcategoriesError }, { data: prods, error: productsError }] = await Promise.all([
    supabase.from("categories").select("slug,name").eq("is_active", true).order("sort_order"),
    supabase
      .from("subcategories")
      .select("slug,name,categories(slug)")
      .eq("is_active", true)
      .order("sort_order"),
    // Featured products first within each category, so "Top sellers" favors
    // admin-curated picks over whatever happens to sort first.
    supabase
      .from("products")
      .select("slug,name,images,categories(slug),subcategories(slug)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .limit(300),
  ]);
  if (categoriesError || subcategoriesError || productsError) throw new Error("Catalog temporarily unavailable");

  return {
    categories: (cats ?? []).map((c) => ({ slug: c.slug, name: c.name })),
    subcategories: (subs ?? []).map((s) => ({
      slug: s.slug,
      name: s.name,
      categorySlug: s.categories?.slug ?? "",
    })),
    products: (prods ?? []).map((p) => ({
      slug: p.slug,
      categorySlug: p.categories?.slug ?? "",
      subcategorySlug: p.subcategories?.slug ?? "",
      name: p.name,
      image: p.images[0] ?? "",
    })),
  };
}

export function useMegaMenuData(enabled: boolean): MegaMenuData {
  const [data, setData] = useState<MegaMenuData>(cache ?? EMPTY);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    if (!cache && !inflight) {
      inflight = fetchMegaMenuData().then((result) => (cache = result)).finally(() => { inflight = null; });
    }
    (cache ? Promise.resolve(cache) : inflight!).then((result) => {
      if (active) setData(result);
    }).catch(() => { /* Leave cache empty so the next opening retries. */ });
    return () => { active = false; };
  }, [enabled]);

  return data;
}
