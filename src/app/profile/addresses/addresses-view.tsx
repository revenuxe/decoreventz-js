"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

const emptyForm = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  is_default: false,
};

export function AddressesView({
  userId,
  initialRows,
}: {
  userId: string;
  initialRows: AddressRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [editingId]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setRows((data as AddressRow[]) ?? []);
  }

  function startEdit(row: AddressRow) {
    setForm({
      label: row.label ?? "",
      line1: row.line1,
      line2: row.line2 ?? "",
      city: row.city,
      state: row.state ?? "",
      pincode: row.pincode,
      phone: row.phone,
      is_default: row.is_default,
    });
    setEditingId(row.id);
  }

  function startNew() {
    setForm({ ...emptyForm, is_default: rows.length === 0 });
    setEditingId("new");
  }

  async function save() {
    if (!form.line1 || !form.city || !form.pincode || !form.phone) return;
    setSaving(true);
    const supabase = createClient();
    try {
      if (form.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId)
          .eq("is_default", true);
      }
      const payload = {
        user_id: userId,
        label: form.label || null,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state || null,
        pincode: form.pincode,
        phone: form.phone,
        is_default: form.is_default,
      };
      if (editingId && editingId !== "new") {
        await supabase.from("addresses").update(payload).eq("id", editingId);
      } else {
        await supabase.from("addresses").insert(payload);
      }
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this address?")) return;
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    await load();
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await load();
  }

  const isFormOpen = editingId !== null;

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        {isFormOpen ? (
          <>
            <button
              onClick={() => setEditingId(null)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Addresses
            </button>
            <h1 className="mt-3 font-display text-3xl">
              {editingId === "new" ? "Add address" : "Edit address"}
            </h1>

            <div className="mt-5 space-y-3">
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Label (Home, Office…)"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                placeholder="House / flat number, street"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                placeholder="Area, landmark (optional)"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                  }
                  placeholder="Pincode"
                  inputMode="numeric"
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State (optional)"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                placeholder="Contact number"
                inputMode="numeric"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="h-4 w-4 accent-[color:var(--brand-purple)]"
                />
                Set as default address
              </label>

              <button
                onClick={save}
                disabled={saving || !form.line1 || !form.city || !form.pincode || !form.phone}
                className="w-full rounded-full bg-gradient-brand px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/profile"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Profile
            </Link>
            <h1 className="mt-3 font-display text-3xl">Addresses</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save multiple pickup/delivery addresses and pick a default.
            </p>

            <div className="mt-5 space-y-2.5">
              {rows.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold">
                        {r.label || "Address"}
                        {r.is_default && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            <Check className="h-2.5 w-2.5" /> Default
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.line1}
                        {r.line2 ? `, ${r.line2}` : ""}, {r.city}
                        {r.state ? `, ${r.state}` : ""} — {r.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.phone}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!r.is_default && (
                        <button
                          onClick={() => setDefault(r.id)}
                          aria-label="Set as default"
                          className="grid h-8 w-8 place-items-center rounded-full border border-border"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        aria-label="Delete address"
                        className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">No addresses saved yet</p>
                </div>
              )}

              <button
                onClick={startNew}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border py-3.5 text-sm font-bold text-muted-foreground"
              >
                <Plus className="h-4 w-4" /> Add new address
              </button>
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
