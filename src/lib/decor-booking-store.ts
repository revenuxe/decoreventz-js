"use client";

import { useEffect, useState } from "react";

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

function normalizeDraft(raw: any): DecorBookingDraft {
  return {
    ...empty,
    ...raw,
    venue: { ...empty.venue, ...raw?.venue },
  };
}

// Local-only draft state — just enough persistence to survive an
// accidental page refresh mid-flow. The account-level address book lives
// in the `addresses` table (see step-venue.tsx), separate from this draft.
export function useDecorBookingDraft() {
  const [draft, setDraft] = useState<DecorBookingDraft>(empty);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDraft(normalizeDraft(JSON.parse(raw)));
      const rawStep = Number(localStorage.getItem(STEP_KEY));
      if (Number.isFinite(rawStep) && rawStep > 0) setStep(rawStep);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, ready]);

  // Persisted separately from the draft so a mid-flow remount (e.g. the
  // redirect out to /auth and back for the sign-in gate between Event and
  // Venue) resumes on the same step instead of snapping back to Event.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STEP_KEY, String(step));
    } catch {}
  }, [step, ready]);

  const update = (patch: Partial<DecorBookingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const reset = () => {
    setDraft(empty);
    setStep(0);
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(STEP_KEY);
    } catch {}
  };

  return { draft, update, reset, ready, step, setStep };
}
