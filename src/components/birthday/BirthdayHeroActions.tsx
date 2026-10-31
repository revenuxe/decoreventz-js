import { ArrowDown } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LeadLink } from "./LeadLink";

export function BirthdayHeroActions({
  context = "birthday decoration",
}: {
  context?: string;
}) {
  return (
    <div className="birthday-hero-actions mt-6 grid grid-cols-[1.2fr_1fr] gap-2 sm:flex sm:gap-3">
      <a
        href="#decorations"
        className="birthday-button min-w-0 whitespace-nowrap"
      >
        <span>Explore Decorations</span>
        <ArrowDown className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
      <LeadLink
        context={context}
        className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-primary px-3 text-sm font-bold sm:px-6"
      >
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        WhatsApp
      </LeadLink>
    </div>
  );
}
