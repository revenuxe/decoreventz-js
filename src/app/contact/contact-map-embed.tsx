import { Navigation } from "lucide-react";
import { CONTACT_MAPS_URL } from "@/lib/site";

const LOCATION_QUERY =
  "Decor Eventz, Shop 4, 5th Main, Dr. M. C. Modi Eye Hospital Building, Mahalakshmipuram, Bengaluru, Karnataka 560086";

export function ContactMapEmbed() {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(LOCATION_QUERY)}&z=16&output=embed`;

  return (
    <section
      aria-labelledby="location-heading"
      className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Find us
          </p>
          <h2
            id="location-heading"
            className="mt-1 text-2xl font-bold text-primary"
          >
            Decor Eventz, Mahalakshmipuram
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shop 4, 5th Main, Dr. M. C. Modi Eye Hospital Building, Bengaluru
          </p>
        </div>
        <a
          href={CONTACT_MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      </div>
      <iframe
        title="Decor Eventz location in Mahalakshmipuram, Bengaluru"
        src={src}
        className="block h-[360px] w-full border-0 sm:h-[440px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}
