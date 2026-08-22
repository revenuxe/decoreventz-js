"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { DecorBookingDraft } from "@/lib/decor-booking-store";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
const LABELS = ["Home", "Work", "Other"];

export function StepVenue({
  draft,
  update,
}: {
  draft: DecorBookingDraft;
  update: (p: Partial<DecorBookingDraft>) => void;
}) {
  const V = draft.venue;
  const setV = (k: keyof DecorBookingDraft["venue"], v: string) => update({ venue: { ...V, [k]: v } });

  const [savedAddresses, setSavedAddresses] = useState<AddressRow[] | null>(null);
  // Manual entry is shown whenever there's no matching saved address
  // selected yet — starts collapsed only once we know there's something to
  // pick from instead.
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSavedAddresses([]);
        setAddingNew(true);
        return;
      }
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      setSavedAddresses(rows);

      // Pre-fill from the default address the first time this step loads
      // with an empty draft, so a returning customer doesn't retype it.
      if (!V.line1 && rows.length > 0) {
        const def = rows.find((r) => r.is_default) ?? rows[0];
        update({
          venue: {
            name: V.name,
            line1: def.line1,
            line2: def.line2 ?? "",
            city: def.city,
            pincode: def.pincode,
            phone: def.phone,
            label: def.label || "Home",
            addressId: def.id,
          },
        });
      } else {
        setAddingNew(rows.length === 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectSaved(row: AddressRow) {
    setAddingNew(false);
    update({
      venue: {
        name: V.name,
        line1: row.line1,
        line2: row.line2 ?? "",
        city: row.city,
        pincode: row.pincode,
        phone: row.phone,
        label: row.label || "Home",
        addressId: row.id,
      },
    });
  }

  function startNew() {
    setAddingNew(true);
    update({ venue: { name: V.name, line1: "", line2: "", city: "", pincode: "", phone: "", label: "Home" } });
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Venue</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          Where should we set up?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Our decorators will arrive ahead of your setup window with everything ready.
        </p>
      </header>

      {savedAddresses && savedAddresses.length > 0 && (
        <section className="space-y-2.5">
          <p className="text-sm font-bold">Saved addresses</p>
          {savedAddresses.map((row) => {
            const selected = !addingNew && V.addressId === row.id;
            return (
              <button
                key={row.id}
                onClick={() => selectSaved(row)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    selected ? "border-brand-pink bg-brand-pink text-primary-foreground" : "border-border"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">{row.label || "Address"}</span>
                    {row.is_default && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                        DEFAULT
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {row.line1}
                    {row.line2 ? `, ${row.line2}` : ""}, {row.city} — {row.pincode}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            onClick={startNew}
            className={`flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed py-3 text-sm font-bold transition ${
              addingNew ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            <Plus className="h-4 w-4" /> Add a new address
          </button>
        </section>
      )}

      {addingNew && (
        <section className="space-y-3">
          {savedAddresses && savedAddresses.length > 0 && (
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <MapPin className="h-4 w-4" /> New address
            </p>
          )}
          <input
            value={V.name}
            onChange={(e) => setV("name", e.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={V.line1}
            onChange={(e) => setV("line1", e.target.value)}
            placeholder="Venue / house number, street"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={V.line2}
            onChange={(e) => setV("line2", e.target.value)}
            placeholder="Area, landmark (optional)"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={V.city}
              onChange={(e) => setV("city", e.target.value)}
              placeholder="City"
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={V.pincode}
              onChange={(e) => setV("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Pincode"
              inputMode="numeric"
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <input
            value={V.phone}
            onChange={(e) => setV("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Contact number"
            inputMode="numeric"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Save this address as</p>
            <div className="flex gap-2">
              {LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setV("label", l)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    V.label === l
                      ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
