"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorService } from "@/data/types";

export function SubcategoryProductsSection({ services }: { services: DecorService[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visibleServices = q
    ? services.filter((s) => s.name.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q)))
    : services;

  return (
    <section className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
      <SearchBar className="mb-6 max-w-xl" mode="filter" onQueryChange={setQuery} />

      {visibleServices.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {visibleServices.map((s) => (
            <ServiceCard key={s.id} service={s} compact />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {q ? `No results for "${query}" here.` : "No services listed here yet — check back soon."}
        </p>
      )}
    </section>
  );
}
