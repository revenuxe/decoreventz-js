"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import type { DecorService } from "@/data/types";

export function FeaturedCollections({
  services,
  eyebrow,
  title,
  titleAccent,
  viewAllHref,
  cardBadge = "trending",
}: {
  services: DecorService[];
  eyebrow: string;
  title: string;
  titleAccent: string;
  viewAllHref: string;
  cardBadge?: "trending" | "featured";
}) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const move = (direction: "left" | "right") => cardsRef.current?.scrollBy({ left: direction === "right" ? 360 : -360, behavior: "smooth" });
  if (services.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-md px-6 pb-10 md:max-w-6xl md:px-8 md:pb-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
          <h2 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            {title} <span className="italic text-gradient-brand">{titleAccent}</span>
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link href={viewAllHref} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primary/5 px-3 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm">View all <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4" /></Link>
          <div className="flex gap-2">
            <button onClick={() => move("left")} aria-label={`Previous ${title} cards`} className="grid h-9 w-9 place-items-center rounded-xl border border-[#dce4ed] text-primary transition hover:bg-[#f8fafc]"><ArrowLeft className="h-4 w-4" /></button>
            <button onClick={() => move("right")} aria-label={`Next ${title} cards`} className="grid h-9 w-9 place-items-center rounded-xl border border-[#dce4ed] text-primary transition hover:bg-[#f8fafc]"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div ref={cardsRef} className="no-scrollbar -mx-6 flex snap-x-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-0 md:gap-5 md:scroll-px-0 md:px-0">
        {services.map((s) => (
          <div key={s.id} className="w-60 shrink-0 snap-start-safe md:w-[calc((100%-3.75rem)/4)]">
            <ServiceCard service={s} badge={cardBadge} size="md" />
          </div>
        ))}
      </div>
    </section>
  );
}
