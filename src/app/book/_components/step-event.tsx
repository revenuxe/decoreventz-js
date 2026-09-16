"use client";

import { EventSlotPicker } from "@/components/EventSlotPicker";
import type { DecorBookingDraft } from "@/lib/decor-booking-store";

export function StepEvent({ draft, update }: { draft: DecorBookingDraft; update: (patch: Partial<DecorBookingDraft>) => void }) {
  return <div className="space-y-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-accent">Event</p><h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">When&apos;s the big day?</h1><p className="mt-2 text-sm text-muted-foreground">We&apos;ll have your setup ready before your guests arrive.</p></header>
    <EventSlotPicker eventDate={draft.eventDate} eventTime={draft.eventTime} onChange={update} />
    <section className="space-y-3"><p className="text-sm font-bold">Anything else we should know?</p><textarea value={draft.notes} onChange={(event) => update({ notes: event.target.value })} placeholder="Theme details, color preferences, special requests..." rows={3} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></section>
  </div>;
}
