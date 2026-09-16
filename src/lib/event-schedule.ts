import { calendarDate } from "./calendar-date";

export const EVENT_WINDOWS = ["10 AM – 1 PM", "1 – 4 PM", "4 – 7 PM", "7 – 10 PM"] as const;

export function eventToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function eventDayOffset(day: string, offset: number): string {
  const date = new Date(day + "T12:00:00");
  date.setDate(date.getDate() + offset);
  return calendarDate(date);
}

export function validEventDate(day: string | undefined, now = new Date()): boolean {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(day + "T12:00:00");
  return !Number.isNaN(date.getTime()) && calendarDate(date) === day && day > eventToday(now);
}

export function validEventSchedule(day?: string, time?: string): boolean {
  return validEventDate(day) && EVENT_WINDOWS.some((window) => window === time);
}
