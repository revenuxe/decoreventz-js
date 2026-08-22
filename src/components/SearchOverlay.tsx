"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowUpRight, Layers, PartyPopper, Search, X } from "lucide-react";
import { useCatalogSearch } from "@/lib/use-catalog-search";

type PageHit = { href: string; name: string; description: string };

const STATIC_PAGES: PageHit[] = [
  { href: "/categories", name: "Browse Decorations", description: "All occasions & services" },
  { href: "/cart", name: "Your Cart", description: "Review items before booking" },
  { href: "/book", name: "Book an Event", description: "Complete your booking" },
  { href: "/profile", name: "Profile", description: "Your account and addresses" },
  { href: "/contact", name: "Contact Us", description: "Phone, email and studio address" },
  { href: "/terms", name: "Terms & Conditions", description: "" },
  { href: "/privacy", name: "Privacy Policy", description: "" },
];

export function SearchOverlay({
  open,
  onOpenChange,
  initialQuery,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seeds the search field when the overlay opens — e.g. a query already
   * typed into a trigger like SearchBar, so it isn't lost on handoff. */
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");

  useEffect(() => {
    if (open && initialQuery) setQuery(initialQuery);
  }, [open, initialQuery]);

  const { categories: categoryHits, services: serviceHits } = useCatalogSearch();

  const q = query.trim().toLowerCase();
  const matchedServices = q
    ? serviceHits.filter(
        (s) => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q),
      )
    : [];
  const matchedCategories = q
    ? categoryHits.filter(
        (c) => c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q),
      )
    : categoryHits;
  const matchedPages = q
    ? STATIC_PAGES.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      )
    : STATIC_PAGES.slice(0, 4);

  const noResults = q && matchedServices.length + matchedCategories.length + matchedPages.length === 0;

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };
  const close = () => handleOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-2xl p-4 pt-[max(1rem,env(safe-area-inset-top))] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4"
        >
          <DialogPrimitive.Title className="sr-only">Search Decor Eventz</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search our decoration categories, services and pages
          </DialogPrimitive.Description>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decorations, categories and more…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <DialogPrimitive.Close
                aria-label="Close search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-2">
              {noResults && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}

              {matchedServices.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Services
                  </p>
                  {matchedServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/categories/${s.categorySlug}/${s.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
                        <PartyPopper className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{s.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          From ₹{s.priceDiscounted.toLocaleString("en-IN")}
                        </span>
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {matchedCategories.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Categories
                  </p>
                  {matchedCategories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categories/${c.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                        <Layers className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{c.name}</span>
                        {c.tagline && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {c.tagline}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {matchedPages.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Pages
                  </p>
                  {matchedPages.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        {p.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {p.description}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
