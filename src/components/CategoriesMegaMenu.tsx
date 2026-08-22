"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMegaMenuData } from "@/lib/use-mega-menu-data";

export function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { categories, subcategories, products } = useMegaMenuData(open);

  const current = activeCategory ?? categories[0]?.slug ?? null;

  const currentSubcategories = useMemo(
    () => subcategories.filter((s) => s.categorySlug === current),
    [subcategories, current],
  );
  const currentTopSellers = useMemo(
    () => products.filter((p) => p.categorySlug === current).slice(0, 4),
    [products, current],
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-primary ${
          open ? "text-primary" : "text-foreground/80"
        }`}
      >
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(92vw,62rem)] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          <div className="grid grid-cols-[16rem_13rem_1fr]">
            {/* Categories */}
            <div className="thin-scrollbar max-h-[28rem] overflow-y-auto border-r border-border/60 bg-muted/30 py-3">
              {categories.map((c) => {
                const active = current === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    onMouseEnter={() => setActiveCategory(c.slug)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-2 px-5 py-2.5 text-sm transition ${
                      active
                        ? "bg-card font-semibold text-primary"
                        : "text-foreground/75 hover:bg-card/60 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </Link>
                );
              })}
            </div>

            {/* Subcategories */}
            <div className="thin-scrollbar max-h-[28rem] overflow-y-auto border-r border-border/60 p-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-accent">Browse</p>
              {currentSubcategories.length > 0 ? (
                <div className="space-y-3">
                  {currentSubcategories.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/categories/${current}/sub/${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="block truncate text-sm text-foreground/75 hover:text-primary"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Everything in this category.</p>
              )}
            </div>

            {/* Top sellers */}
            <div className="thin-scrollbar max-h-[28rem] overflow-y-auto p-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-accent">
                Top sellers
              </p>
              {currentTopSellers.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentTopSellers.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/categories/${current}/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="group block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl shadow-card">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="140px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-brand" />
                        )}
                      </div>
                      <p className="mt-2 truncate text-xs font-semibold text-foreground/90 group-hover:text-primary">
                        {p.name}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No products yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
