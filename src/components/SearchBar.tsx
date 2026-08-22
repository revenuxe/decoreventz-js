"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, PartyPopper, Search } from "lucide-react";
import { useCatalogSearch } from "@/lib/use-catalog-search";

const PHRASES = ["birthday decor", "wedding decor", "baby shower", "corporate event"];
const TYPE_MS = 70;
const DELETE_MS = 40;
const HOLD_MS = 1400;

// Typewriter placeholder — only runs while the field is empty and unfocused,
// so it never fights with what the user is actually typing.
function useTypingPlaceholder(active: boolean) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const phrase = PHRASES[phraseIndex];
      if (!deleting) {
        charIndex += 1;
        setText(phrase.slice(0, charIndex));
        if (charIndex === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, HOLD_MS);
          return;
        }
        timeout = setTimeout(tick, TYPE_MS);
      } else {
        charIndex -= 1;
        setText(phrase.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % PHRASES.length;
        }
        timeout = setTimeout(tick, DELETE_MS);
      }
    }

    timeout = setTimeout(tick, TYPE_MS);
    return () => clearTimeout(timeout);
  }, [active]);

  return text;
}

export function SearchBar({
  className,
  placeholder,
  mode = "dropdown",
  square = false,
  onQueryChange,
}: {
  className?: string;
  placeholder?: string;
  /** "dropdown" (default) shows a site-wide results popover — used on the
   * homepage where there's no local list to narrow. "filter" hides the
   * popover entirely and reports the query via onQueryChange instead, for
   * pages that filter their own already-loaded cards in place. */
  mode?: "dropdown" | "filter";
  square?: boolean;
  onQueryChange?: (query: string) => void;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTyping = !focused && value.length === 0;
  const typed = useTypingPlaceholder(showTyping);

  const { categories, services } = useCatalogSearch(mode === "dropdown");
  const q = value.trim().toLowerCase();
  const matchedCategories = useMemo(
    () =>
      q
        ? categories.filter(
            (c) => c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q),
          )
        : [],
    [q, categories],
  );
  const matchedServices = useMemo(
    () =>
      q
        ? services.filter(
            (s) => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q),
          )
        : [],
    [q, services],
  );

  useEffect(() => {
    if (mode === "filter") onQueryChange?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mode]);

  // Inline results only — no full-screen search popup here. Closes on
  // outside click so it behaves like a normal dropdown, not a modal.
  const showResults = mode === "dropdown" && focused && q.length > 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const noResults = showResults && matchedCategories.length + matchedServices.length === 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <div className={`flex w-full items-center gap-2 border border-border bg-card pl-5 pr-1.5 py-1.5 shadow-card transition focus-within:ring-2 focus-within:ring-primary ${square ? "rounded-sm" : "rounded-full"}`}>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFocused(false);
          }}
          placeholder={placeholder ?? (showTyping ? `Search ${typed}` : "Search decorations…")}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
          <Search className="h-4 w-4" />
        </span>
      </div>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-3xl border border-border bg-card p-2 shadow-elevated">
          {noResults && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results for &ldquo;{value}&rdquo;
            </p>
          )}

          {matchedServices.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Services
              </p>
              {matchedServices.slice(0, 4).map((s) => (
                <Link
                  key={s.slug}
                  href={`/categories/${s.categorySlug}/${s.slug}`}
                  onClick={() => setFocused(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
                    <PartyPopper className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 text-left">
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
            <div>
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Categories
              </p>
              {matchedCategories.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  onClick={() => setFocused(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                    <Layers className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.tagline}</span>
                  </span>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
