"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calendarDate } from "@/lib/calendar-date";
import { EVENT_WINDOWS, eventToday, eventDayOffset, validEventDate } from "@/lib/event-schedule";
import { useBrowserReady } from "@/lib/browser-storage";

type Props = { eventDate?: string; eventTime?: string; onChange: (selection: { eventDate?: string; eventTime?: string }) => void };

export function EventSlotPicker({ eventDate, eventTime, onChange }: Props) {
  const ready = useBrowserReady();
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => tick((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!ready) return <div className="h-60 max-w-lg animate-pulse rounded-2xl bg-muted/40" aria-label="Loading event dates" />;
  const today = eventToday();
  const tomorrow = eventDayOffset(today, 1);
  const days = Array.from({ length: 5 }, (_, index) => eventDayOffset(today, index));
  const validDate = validEventDate(eventDate);
  const custom = validDate && !days.includes(eventDate!);
  const chooseDate = (date: string) => {
    if (validEventDate(date)) onChange({ eventDate: date, eventTime: undefined });
  };
  const dateLabel = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return <section aria-label="Event date and time" className="w-full max-w-lg rounded-2xl border border-border bg-card p-3 shadow-card sm:p-4">
    <h2 className="flex items-center gap-2 text-sm font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">1</span>When is your event?</h2>
    <div className="mt-3 grid grid-cols-6 gap-1.5 sm:gap-2">
      {days.map((day, index) => <button key={day} type="button" disabled={index === 0} aria-label={dateLabel(day)} aria-pressed={validDate && eventDate === day} onClick={() => chooseDate(day)} className={"min-h-[72px] min-w-0 rounded-xl border px-0.5 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 " + (validDate && eventDate === day ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40")}>
        <span className="block text-[10px] font-semibold sm:text-xs">{index === 0 ? "Today" : index === 1 ? "Tmrw" : new Date(day + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</span>
        <span className="mt-0.5 block text-base font-bold">{Number(day.slice(-2))}</span>
        {index === 0 && <span className="mt-1 block text-[8px] font-semibold uppercase">Closed</span>}
      </button>)}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><button type="button" aria-label="Choose another event date" className={"flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-0.5 py-2 text-[10px] sm:text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary " + (custom ? "border-primary bg-primary/5 text-primary" : "border-border")}><CalendarDays className="h-5 w-5" />{custom ? new Date(eventDate! + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "More"}</button></PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" defaultMonth={new Date((validDate ? eventDate : tomorrow) + "T12:00:00")} selected={validDate ? new Date(eventDate + "T12:00:00") : undefined} disabled={{ before: new Date(tomorrow + "T00:00:00") }} onSelect={(date) => { if (date) { chooseDate(calendarDate(date)); setOpen(false); } }} /></PopoverContent>
      </Popover>
    </div>
    <p className="mb-2 mt-3 text-xs font-semibold text-muted-foreground">Time windows{validDate ? " - " + dateLabel(eventDate!) : " - Choose a date"}</p>
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Setup time window">
      {EVENT_WINDOWS.map((time) => <button key={time} type="button" disabled={!validDate} aria-pressed={validDate && eventTime === time} onClick={() => onChange({ eventTime: time })} className={"flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm " + (validDate && eventTime === time ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40")}>{time}{validDate && eventTime === time && <Check className="h-4 w-4" />}</button>)}
    </div>
    <p className="mt-2 text-[10px] text-muted-foreground">Times in IST. Book from tomorrow.</p>
    {eventDate && !validDate && <p role="alert" className="mt-2 text-xs text-destructive">Please choose a future event date.</p>}
  </section>;
}
