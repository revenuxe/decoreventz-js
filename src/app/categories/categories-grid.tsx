"use client";

import { useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorCategory } from "@/data/types";

export function CategoriesGrid({ categories }: { categories: DecorCategory[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visible = normalizedQuery ? categories.filter((category) => category.name.toLowerCase().includes(normalizedQuery)) : categories;

  return <><SearchBar className="mb-8 max-w-xl" mode="filter" onQueryChange={setQuery} />{visible.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{visible.map((category) => <CategoryCard key={category.slug} href={`/categories/${category.slug}`} image={category.heroImage} name={category.name} tagline={category.tagline} />)}</div> : <p className="text-center text-sm text-muted-foreground">No categories match &ldquo;{query}&rdquo;.</p>}</>;
}
