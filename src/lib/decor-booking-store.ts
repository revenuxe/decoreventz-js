"use client";

import { useMemo } from "react";
import { readStorage, writeStorage, useStoredValue, useBrowserReady } from "./browser-storage";

export type VenueAddress = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  phone: string;
  /** Home / Work / Other — only meaningful when addressId is unset (i.e.
   * this is a new address about to be saved), see step-venue.tsx. */
  label: string;
  /** Set when the venue was populated by picking a saved address, so
   * book-wizard.tsx knows not to re-save it as a new one. */
  addressId?: string;
};

export type DecorBookingDraft = {
  eventDate?: string;
  eventTime?: string;
  venue: VenueAddress;
  notes: string;
};

const KEY = "baraabar_decor_booking_draft_v1";
const STEP_KEY = "baraabar_decor_booking_step_v1";

const empty: DecorBookingDraft = {
  venue: { name: "", line1: "", line2: "", city: "", pincode: "", phone: "", label: "Home" },
  notes: "",
};

function normalizeDraft(raw: unknown): DecorBookingDraft {
  const data = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const venue = data.venue && typeof data.venue === "object" ? data.venue as Record<string, unknown> : {};
  const text = (value: unknown) => typeof value === "string" ? value : "";
  return {
    eventDate: text(data.eventDate) || undefined, eventTime: text(data.eventTime) || undefined,
    notes: text(data.notes),
    venue: {
      name: text(venue.name), line1: text(venue.line1), line2: text(venue.line2),
      city: text(venue.city), pincode: text(venue.pincode), phone: text(venue.phone),
      label: text(venue.label) || "Home", addressId: text(venue.addressId) || undefined,
    },
  };
}

// Local-only draft state — just enough persistence to survive an
// accidental page refresh mid-flow. The account-level address book lives
// in the `addresses` table (see step-venue.tsx), separate from this draft.
export function useDecorBookingDraft() {
  const raw = useStoredValue(KEY);
  const rawStep = Number(useStoredValue(STEP_KEY));
  const ready = useBrowserReady();
  const draft = useMemo(() => {
    try { return raw ? normalizeDraft(JSON.parse(raw)) : empty; } catch { return empty; }
  },[raw]);
  const step = Number.isInteger(rawStep) && rawStep >= 0 && rawStep <= 2 ? rawStep : 0;
  const setStep = (value: number) => writeStorage(STEP_KEY,String(Math.max(0,Math.min(2,value))));
  const update = (patch: Partial<DecorBookingDraft>) => {
    let current = draft;
    try { current = normalizeDraft(JSON.parse(readStorage(KEY) ?? "null")); } catch {}
    writeStorage(KEY,JSON.stringify({ ...current, ...patch }));
  };
  const reset = () => { writeStorage(KEY,null); writeStorage(STEP_KEY,null); };
  return { draft, update, reset, ready, step, setStep };
}
