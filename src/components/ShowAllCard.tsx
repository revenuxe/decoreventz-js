import Link from "next/link";
import { Compass, LayoutGrid } from "lucide-react";

type Common = { label?: string };

function Circle({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid h-20 w-20 place-items-center rounded-full border shadow-card transition-transform active:scale-95 md:h-24 md:w-24 ${
        active
          ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </div>
  );
}

/** "Show all" (onClick) resets an in-page filter back to everything —
 * "Browse all" (href) navigates to the full subcategories index instead.
 * Same visual chip, two distinct jobs — don't conflate them. */
export function ShowAllCard(
  props: Common & ({ onClick: () => void; active?: boolean; href?: never } | { href: string; onClick?: never; active?: never }),
) {
  const label = props.label ?? (props.href ? "Browse all" : "Show all");
  const icon = props.href ? <Compass className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />;

  const inner = (
    <>
      <Circle active={"active" in props ? props.active : false}>{icon}</Circle>
      <p
        className={`text-xs font-semibold leading-tight ${
          "active" in props && props.active
            ? "text-primary"
            : "text-foreground/90 group-hover:text-primary"
        }`}
      >
        {label}
      </p>
    </>
  );

  if (props.href) {
    return (
      <Link href={props.href} className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center md:w-24">
        {inner}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center md:w-24"
    >
      {inner}
    </button>
  );
}
