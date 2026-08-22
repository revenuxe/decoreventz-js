import Image from "next/image";
import Link from "next/link";
import type { DecorSubcategory } from "@/data/types";

function Thumb({
  subcategory,
  active,
}: {
  subcategory: DecorSubcategory;
  active?: boolean;
}) {
  return (
    <div
      className={`relative h-20 w-20 overflow-hidden rounded-full border shadow-card transition-transform active:scale-95 md:h-24 md:w-24 ${
        active ? "border-primary ring-2 ring-primary" : "border-border"
      }`}
    >
      {subcategory.image ? (
        <Image
          src={subcategory.image}
          alt={subcategory.name}
          fill
          loading="lazy"
          sizes="96px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="h-full w-full bg-gradient-brand" />
      )}
    </div>
  );
}

/** Two usage modes: pass `href` for a real navigation (e.g. the mega menu's
 * deep link to the dedicated subcategory page), or `onClick` to filter the
 * category page's product grid in place without navigating. */
export function SubcategoryCard({
  subcategory,
  href,
  onClick,
  active,
}: {
  subcategory: DecorSubcategory;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const label = (
    <p
      className={`line-clamp-2 text-xs font-semibold leading-tight ${
        active ? "text-primary" : "text-foreground/90 group-hover:text-primary"
      }`}
    >
      {subcategory.name}
    </p>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-pressed={active}
        className="group flex w-20 shrink-0 flex-col items-center gap-2 rounded-xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-24"
      >
        <Thumb subcategory={subcategory} active={active} />
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href ?? "#"}
      className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center md:w-24"
    >
      <Thumb subcategory={subcategory} active={active} />
      {label}
    </Link>
  );
}
