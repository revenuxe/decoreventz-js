import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CategoryCard({ href, image, name, tagline }: { href: string; image?: string; name: string; tagline?: string }) {
  return (
    <Link
      href={href}
      className="group flex aspect-[4/5] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-elevated"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted">
        {image ? <Image src={image} alt={tagline ? `${name} — ${tagline}` : name} fill loading="lazy" sizes="(min-width: 768px) 16vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="h-full w-full bg-gradient-brand" />}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="flex min-h-[68px] items-center gap-1.5 px-3 py-2.5 md:min-h-[70px] md:px-3 md:py-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[12px] font-bold text-primary md:text-[13px]">{name}</h3>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground md:text-[11px]">{tagline || "Explore themed setups"}</p>
        </div>
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/8 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
