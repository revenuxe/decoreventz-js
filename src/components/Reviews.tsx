import Image from "next/image";
import { Play, Star } from "lucide-react";
import { testimonials } from "@/data";

export function Reviews() {
  return (
    <section className="pb-10 md:pb-16">
      <div className="mx-auto w-full max-w-md px-6 md:max-w-6xl md:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Loved by 500+</p>
        <h2 className="font-display text-3xl md:text-5xl">Real stories, in their words</h2>
      </div>

      <div className="no-scrollbar snap-x-mandatory mx-auto mt-4 flex max-w-md gap-3 overflow-x-auto scroll-px-6 px-6 pb-3 md:mt-8 md:max-w-6xl md:gap-5 md:scroll-px-8 md:px-8">
        {testimonials.map((r) => (
          <article
            key={r.id}
            className="snap-start-safe relative aspect-[9/16] w-56 shrink-0 overflow-hidden rounded-[1.75rem] shadow-elevated"
          >
            <Image
              src={r.image}
              alt={`${r.name} review`}
              loading="lazy"
              fill
              sizes="224px"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40"
            />
            <button
              aria-label={`Play review from ${r.name}`}
              className="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-full glass-dark text-primary-foreground transition-transform active:scale-90"
            >
              <Play className="h-5 w-5 fill-current" />
            </button>
            <div className="absolute inset-x-3 bottom-3 text-primary-foreground">
              <div className="mb-1 flex items-center gap-0.5 text-accent">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <p className="text-[13px] font-semibold leading-snug">&quot;{r.quote}&quot;</p>
              <p className="mt-1 text-[11px] opacity-80">
                {r.name} · {r.city}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
