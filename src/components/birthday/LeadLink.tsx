"use client";

import { track } from "@vercel/analytics";
import { CONTACT } from "@/lib/site";

export function LeadLink({
  children,
  context = "birthday page",
  quote = false,
  className = "",
}: {
  children: React.ReactNode;
  context?: string;
  quote?: boolean;
  className?: string;
}) {
  const message = `Hi DecorEventz, I'm interested in ${context}. I'd like to know the available decoration options and pricing.`;
  return (
    <a
      href={
        quote
          ? "/contact"
          : `${CONTACT.whatsappHref}?text=${encodeURIComponent(message)}`
      }
      onClick={() =>
        track("birthday_lead_click", {
          context,
          channel: quote ? "contact" : "whatsapp",
        })
      }
      className={className}
    >
      {children}
    </a>
  );
}
