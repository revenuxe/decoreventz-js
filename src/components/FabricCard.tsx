"use client";

import { Check } from "lucide-react";

/** Distinct swatch treatment per fabric so cards read as material, not text. */
const SWATCH: Record<string, string> = {
  cotton: "linear-gradient(135deg,#f3efe7,#dcd3c3)",
  silk: "linear-gradient(135deg,#f7d9e6,#c9a2d6,#f3e3c7)",
  wool: "linear-gradient(135deg,#cfc7bd,#8e8579)",
  velvet: "linear-gradient(135deg,#5b1f52,#7b2d6b,#3a1233)",
  georgette: "linear-gradient(135deg,#efe4f5,#d6c2e8)",
  linen: "linear-gradient(135deg,#f1ece1,#cfc4ac)",
  chiffon: "linear-gradient(135deg,#fdf3f7,#e7d3ea)",
  denim: "linear-gradient(135deg,#4a6a92,#2b3d55)",
  rayon: "linear-gradient(135deg,#e9f0f2,#c2d3d8)",
  crepe: "linear-gradient(135deg,#f2e8e4,#d3bdb6)",
};

function swatchFor(label: string) {
  return SWATCH[label.trim().toLowerCase()] ?? "linear-gradient(135deg,#efe9f7,#d8cbe9)";
}

export function FabricCard({
  label,
  description,
  image,
  selected,
  onSelect,
}: {
  label: string;
  description?: string | null;
  image: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative overflow-hidden rounded-3xl border text-left shadow-card transition active:scale-[0.98] ${
        selected
          ? "border-transparent ring-2 ring-primary"
          : "border-border hover:-translate-y-0.5 hover:shadow-glow/30"
      }`}
    >
      <div className="relative h-24 w-full overflow-hidden md:h-28">
        {image ? (
          // Admins can paste any external image URL for a fabric (see
          // ImageUploadField), so next/image's remotePatterns allowlist
          // can't cover it — plain <img> loads any domain.
          <img
            src={image}
            alt={label}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full" style={{ backgroundImage: swatchFor(label) }} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/45 via-foreground/5 to-transparent" />
        {selected && (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow ring-2 ring-background">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="bg-card px-3 py-2.5">
        <p className="truncate text-sm font-bold">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {description || "Tap to select"}
        </p>
      </div>
    </button>
  );
}
