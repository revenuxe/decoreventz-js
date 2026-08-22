"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, CalendarPlus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DecorBookingDraft } from "@/lib/decor-booking-store";

export function StepEvent({
  draft,
  update,
}: {
  draft: DecorBookingDraft;
  update: (p: Partial<DecorBookingDraft>) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const quickKeys = new Set(days.map((d) => d.toISOString().slice(0, 10)));
  const isCustomSelected = !!draft.eventDate && !quickKeys.has(draft.eventDate);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const windows = [
    { label: "Morning", range: "8–11 AM" },
    { label: "Afternoon", range: "11 AM–3 PM" },
    { label: "Evening", range: "3–7 PM" },
    { label: "Night", range: "7–10 PM" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Event</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          When&apos;s the big day?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll have your setup ready before your guests arrive.
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold">
            <CalendarIcon className="h-4 w-4" /> Event date
          </p>
          <Popover open={customOpen} onOpenChange={setCustomOpen}>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isCustomSelected
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-dashed border-border bg-card text-muted-foreground"
                }`}
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                {isCustomSelected
                  ? new Date(`${draft.eventDate}T00:00:00`).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })
                  : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={draft.eventDate ? new Date(`${draft.eventDate}T00:00:00`) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  update({ eventDate: date.toISOString().slice(0, 10) });
                  setCustomOpen(false);
                }}
                disabled={{ before: tomorrow }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {days.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const active = draft.eventDate === key;
            return (
              <button
                key={key}
                onClick={() => update({ eventDate: key })}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-center transition ${
                  active
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-[11px] font-bold uppercase opacity-80">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className="text-lg font-black leading-tight">{d.getDate()}</p>
                <p className="text-[10px] opacity-80">
                  {d.toLocaleDateString(undefined, { month: "short" })}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-sm font-bold">Preferred setup window</p>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Your decorator will arrive during this window to complete the setup before your event.</p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {windows.map((w) => {
            const value = `${w.label} (${w.range})`;
            const active = draft.eventTime === value;
            return (
              <button
                key={w.label}
                onClick={() => update({ eventTime: value })}
                className={`rounded-2xl border px-1.5 py-2.5 text-center transition sm:px-2 ${
                  active
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                <span className="block text-[12px] font-bold sm:text-sm">{w.label}</span>
                <span
                  className={`block text-[9px] leading-tight sm:text-[11px] ${active ? "opacity-80" : "text-muted-foreground"}`}
                >
                  {w.range}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold">Anything else we should know?</p>
        <textarea
          value={draft.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Theme details, color preferences, special requests…"
          rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </section>
    </div>
  );
}
