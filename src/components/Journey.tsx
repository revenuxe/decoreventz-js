import { CalendarCheck, Palette, HardHat, ShieldCheck, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; sub: string };

const STEPS: Step[] = [
  { icon: CalendarCheck, title: "Book your date", sub: "Pick a category & event date" },
  { icon: Palette, title: "Design the theme", sub: "Colors, styling & add-ons" },
  { icon: HardHat, title: "Venue setup", sub: "Our team installs on-site" },
  { icon: ShieldCheck, title: "Quality check", sub: "Final walkthrough before you arrive" },
  { icon: PartyPopper, title: "Event day", sub: "You celebrate, we handle the rest" },
];

export function Journey() {
  return (
    <section className="mx-auto w-full max-w-md px-5 pt-4 pb-10 md:max-w-6xl md:px-8 md:pt-6 md:pb-16">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">The Decor Eventz way</p>
      <h2 className="mt-1 font-display text-3xl md:text-5xl">Your event, orchestrated</h2>

      <ol className="relative mt-6 space-y-4 pl-2">
        <span
          aria-hidden
          className="absolute left-[27px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-primary via-accent to-primary opacity-40"
        />
        {STEPS.map(({ icon: Icon, title, sub }, i) => (
          <li key={title} className="relative flex items-center gap-4">
            <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 rounded-2xl bg-card p-3 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  {i + 1}. {title}
                </h3>
              </div>
              <p className="text-[12px] text-muted-foreground">{sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
