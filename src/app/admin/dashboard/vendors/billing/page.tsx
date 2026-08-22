"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Wallet, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"] & {
  vendors: { business_name: string } | null;
};
type PaymentRow = Database["public"]["Tables"]["vendor_payments"]["Row"];

function money(n: number | null): string {
  return `Rs. ${Number(n ?? 0).toLocaleString("en-IN")}`;
}

function pendingAmount(b: BookingRow): number | null {
  if (b.vendor_bill_amount == null) return null;
  return Math.max(0, Number(b.vendor_bill_amount) - Number(b.vendor_paid_amount));
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
] as const;

const BILLING_QUERY_KEY = ["admin", "vendor-billing"];

// One embedded-resource select via the assigned_vendor_id FK instead of a
// second, sequential `vendors.in(...)` round trip once bookings resolve.
async function fetchBilling(): Promise<BookingRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, vendors!assigned_vendor_id(business_name)")
    .not("vendor_bill_amount", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}

export default function AdminVendorBillingPage() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: BILLING_QUERY_KEY, queryFn: fetchBilling });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Cached per booking id — reopening a booking you already viewed shows
  // its payment history instantly instead of a fresh spinner every time.
  const { data: payments } = useQuery({
    queryKey: ["admin", "vendor-payments", selectedId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vendor_payments")
        .select("*")
        .eq("booking_id", selectedId!)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedId,
  });

  function openBooking(id: string) {
    setSelectedId(id);
    setAmount("");
    setNote("");
  }

  // recorded_by fills in via vendor_payments' column default (auth.uid()).
  async function recordPayment(booking: BookingRow) {
    const value = Number(amount);
    if (!value || value <= 0) return alert("Enter an amount greater than 0");
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("vendor_payments")
      .insert({ booking_id: booking.id, amount: value, note: note.trim() || null });
    setSaving(false);
    if (error) return alert(error.message);

    setAmount("");
    setNote("");
    // The DB trigger updates the booking's paid/pending summary, so both
    // the list totals and this booking's payment history need a refresh.
    queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["admin", "vendor-payments", booking.id] });
  }

  const filtered = useMemo(() => {
    if (!bookings) return [];
    if (filter === "all") return bookings;
    return bookings.filter((b) => (filter === "paid" ? b.vendor_payment_status === "paid" : b.vendor_payment_status === "unpaid"));
  }, [bookings, filter]);

  const totals = useMemo(() => {
    const rows = bookings ?? [];
    return {
      billed: rows.reduce((s, b) => s + Number(b.vendor_bill_amount ?? 0), 0),
      paid: rows.reduce((s, b) => s + Number(b.vendor_paid_amount), 0),
      pending: rows.reduce((s, b) => s + (pendingAmount(b) ?? 0), 0),
    };
  }, [bookings]);

  const selected = selectedId ? (bookings ?? []).find((b) => b.id === selectedId) ?? null : null;

  return (
    <section>
      {isLoading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total billed", value: totals.billed },
              { label: "Total paid", value: totals.paid },
              { label: "Pending", value: totals.pending },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-xl">{money(value)}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 mt-5 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-card"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No billed orders yet — set a bill amount from the Orders Assigned tab first.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => {
                const pending = pendingAmount(b);
                return (
                  <button
                    key={b.id}
                    onClick={() => openBooking(b.id)}
                    className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left text-sm transition active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        #{b.order_code} · {b.vendors?.business_name ?? "Unknown vendor"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Billed {money(b.vendor_bill_amount)} · Paid {money(b.vendor_paid_amount)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        b.vendor_payment_status === "paid" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {b.vendor_payment_status === "paid" ? "Paid" : `${money(pending)} pending`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-card shadow-elevated md:max-h-[85vh] md:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur-lg">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">#{selected.order_code}</p>
                <p className="truncate text-xs text-muted-foreground">{selected.vendors?.business_name}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border p-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Billed</p>
                  <p className="mt-1 font-bold">{money(selected.vendor_bill_amount)}</p>
                </div>
                <div className="rounded-xl border border-border p-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Paid</p>
                  <p className="mt-1 font-bold">{money(selected.vendor_paid_amount)}</p>
                </div>
                <div className="rounded-xl border border-border p-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Pending</p>
                  <p className="mt-1 font-bold">{money(pendingAmount(selected))}</p>
                </div>
              </div>

              {selected.vendor_payment_status !== "paid" && (
                <div className="space-y-2 border-t border-border pt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Record a payment
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note (e.g. Advance, Final settlement)"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => recordPayment(selected)}
                    disabled={saving}
                    className="w-full rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Record payment"}
                  </button>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" /> Payment history
                </p>
                {!payments ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : payments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((p: PaymentRow) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-2.5">
                        <div>
                          <p className="font-semibold">{money(p.amount)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(p.paid_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            {p.note ? ` · ${p.note}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
