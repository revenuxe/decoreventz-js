"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDownUp, Sparkles, Tag, TrendingUp } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { ShowAllCard } from "@/components/ShowAllCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorService, DecorSubcategory } from "@/data/types";

export function CategoryProductsSection({
  categorySlug,
  services,
  subcategories,
}: {
  categorySlug: string;
  services: DecorService[];
  subcategories: DecorSubcategory[];
}) {
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popular" | "newest" | "price-low">("popular");
  const [priceBand, setPriceBand] = useState<"all" | "under-3000" | "3000-6000" | "over-6000">("all");

  const q = query.trim().toLowerCase();
  const visibleServices = useMemo(() => services.filter((s) => {
    if (activeSub && s.subcategorySlug !== activeSub) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.tags.some((t) => t.includes(q))) return false;
    if (priceBand === "under-3000") return s.priceDiscounted < 3000;
    if (priceBand === "3000-6000") return s.priceDiscounted >= 3000 && s.priceDiscounted <= 6000;
    if (priceBand === "over-6000") return s.priceDiscounted > 6000;
    return true;
  }).toSorted((a, b) => sort === "price-low" ? a.priceDiscounted - b.priceDiscounted : sort === "newest" ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : b.rating - a.rating || b.reviewCount - a.reviewCount), [activeSub, priceBand, q, services, sort]);

  return (
    <>
      {subcategories.length > 0 && (
        <section className="mx-auto w-full max-w-md px-6 pt-8 md:max-w-6xl md:px-8 md:pt-10">
          <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-widest text-accent">Choose a style</p><span className="text-xs font-semibold text-muted-foreground">{visibleServices.length} setup{visibleServices.length === 1 ? "" : "s"}</span></div>
          <div className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 md:mx-0 md:scroll-px-0 md:px-0">
            <ShowAllCard active={activeSub === null} onClick={() => setActiveSub(null)} />
            {subcategories.map((s) => (
              <SubcategoryCard
                key={s.id}
                subcategory={s}
                active={activeSub === s.slug}
                onClick={() => setActiveSub(s.slug)}
              />
            ))}
            <ShowAllCard href={`/categories/${categorySlug}/sub`} />
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-md px-6 pt-6 md:max-w-6xl md:px-8">
        <SearchBar className="max-w-xl" mode="filter" onQueryChange={setQuery} />
      </div>

      <section aria-label="Sort and filter products" className="mx-auto w-full max-w-md px-6 pt-5 md:max-w-6xl md:px-8"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort &amp; filter</p><span className="text-sm font-semibold text-primary">{visibleServices.length} products</span></div><div className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:px-0"><FilterChip active={sort === "popular"} onClick={() => setSort("popular")} icon={<TrendingUp className="h-4 w-4" />}>Popularity</FilterChip><FilterChip active={sort === "newest"} onClick={() => setSort("newest")} icon={<Sparkles className="h-4 w-4" />}>New arrivals</FilterChip><FilterChip active={sort === "price-low"} onClick={() => setSort("price-low")} icon={<ArrowDownUp className="h-4 w-4" />}>Price low</FilterChip></div><div className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto border-t border-border px-6 pt-3 md:mx-0 md:px-0"><span className="inline-flex h-10 shrink-0 items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Tag className="h-4 w-4" /> Price</span><FilterChip active={priceBand === "all"} onClick={() => setPriceBand("all")}>All</FilterChip><FilterChip active={priceBand === "under-3000"} onClick={() => setPriceBand("under-3000")}>Under ₹3,000</FilterChip><FilterChip active={priceBand === "3000-6000"} onClick={() => setPriceBand("3000-6000")}>₹3,000 – ₹6,000</FilterChip><FilterChip active={priceBand === "over-6000"} onClick={() => setPriceBand("over-6000")}>Over ₹6,000</FilterChip></div></section>

      <section aria-live="polite" className="mx-auto w-full max-w-md px-6 py-8 md:max-w-6xl md:px-8 md:py-12">
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
    </>
  );
}

function FilterChip({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon?: ReactNode; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-brand-purple/35 bg-gradient-brand-soft text-primary shadow-sm" : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:bg-[#edf7f8] hover:text-accent"}`}>{icon}{children}</button>; }
