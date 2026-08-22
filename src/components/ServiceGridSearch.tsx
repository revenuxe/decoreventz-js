"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorService } from "@/data/types";

export function ServiceGridSearch({
  services,
  searchPlaceholder,
  cardBadge = "trending",
}: {
  services: DecorService[];
  searchPlaceholder: string;
  cardBadge?: "trending" | "featured";
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? services.filter((s) => s.name.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q)))
    : services;

  return (
    <>
      <div className="mx-auto w-full max-w-md px-5 pt-6 md:max-w-6xl md:px-8">
        <SearchBar className="max-w-xl" mode="filter" onQueryChange={setQuery} placeholder={searchPlaceholder} />
      </div>

      <section className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {visible.map((s) => (
              <ServiceCard key={s.id} service={s} badge={cardBadge} compact />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;.</p>
        )}
      </section>
    </>
  );
}
