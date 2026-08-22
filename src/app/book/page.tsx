import type { Metadata } from "next";
import { BookWizard } from "./book-wizard";

// Checkout flow gated behind a non-empty cart — no organic value, keep out
// of the index (see robots.ts, which also disallows crawling it).
export const metadata: Metadata = {
  title: "Book Your Event Decoration",
  description:
    "Pick your event date and venue, and we'll take care of the rest — free venue visit, custom setup, no payment now.",
  robots: { index: false, follow: true },
};

export default function BookPage() {
  return <BookWizard />;
}
