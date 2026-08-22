import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function PickupCta() {
  return (
    <section className="mx-auto w-full max-w-md px-5 pt-2 md:max-w-6xl md:px-8">
      <Link
        href="/categories"
        className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-brand p-4 shadow-elevated md:p-6"
      >
        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-primary-foreground md:h-14 md:w-14">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="relative min-w-0 flex-1 text-primary-foreground">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
            Planning something last-minute?
          </p>
          <p className="font-display text-xl leading-tight md:text-2xl">
            Same-week decorator slots available
          </p>
          <p className="mt-0.5 text-[12px] opacity-90 md:text-sm">
            Free venue visit, custom design, setup and teardown — all handled for you.
          </p>
        </div>
        <ArrowRight className="relative h-5 w-5 shrink-0 text-primary-foreground" />
      </Link>
    </section>
  );
}
