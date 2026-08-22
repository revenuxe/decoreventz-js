"use client";

import { useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorSubcategory } from "@/data/types";

export function SubcategoriesGrid({ categorySlug, subcategories }: { categorySlug: string; subcategories: DecorSubcategory[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visible = normalizedQuery ? subcategories.filter((subcategory) => subcategory.name.toLowerCase().includes(normalizedQuery)) : subcategories;

  return <><SearchBar className="mb-8 max-w-xl" mode="filter" onQueryChange={setQuery} />{visible.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{visible.map((subcategory) => <CategoryCard key={subcategory.slug} href={`/categories/${categorySlug}/sub/${subcategory.slug}`} image={subcategory.image} name={subcategory.name} tagline={subcategory.tagline} />)}</div> : <p className="text-center text-sm text-muted-foreground">No types match &ldquo;{query}&rdquo;.</p>}</>;
}
