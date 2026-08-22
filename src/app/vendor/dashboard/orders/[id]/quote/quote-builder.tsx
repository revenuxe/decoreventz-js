"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type QuoteLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

function money(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export function QuoteBuilder({
  bookingId,
  initialItems,
  readOnly,
}: {
  bookingId: string;
  initialItems: QuoteLineItem[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<QuoteLineItem[]>(initialItems.length ? initialItems : [{ description: "", quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), [items]);

  function update(i: number, patch: Partial<QuoteLineItem>) {
    setItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    setItems((rows) => rows.filter((_, idx) => idx !== i));
  }
  function addLine() {
    setItems((rows) => [...rows, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  async function save() {
    const cleaned = items
      .map((it) => ({ ...it, description: it.description.trim() }))
      .filter((it) => it.description && it.quantity > 0 && it.unitPrice >= 0);
    if (cleaned.length === 0) return toast.error("Add at least one line item");
    const grandTotal = cleaned.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    if (grandTotal <= 0) return toast.error("Quote total must be greater than 0");

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_save_quote", {
      _booking_id: bookingId,
      _items: cleaned,
      _total: grandTotal,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Quote saved");
    router.push(`/vendor/dashboard/orders/${bookingId}`);
  }

  return (
    <div className="space-y-4">
      {readOnly && (
        <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600">
          This order is already paid — the quote can no longer be edited.
        </p>
      )}

      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2 rounded-2xl border border-border bg-card p-3">
            <input
              type="text"
              value={it.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              disabled={readOnly}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <input
              type="number"
              value={it.quantity}
              onChange={(e) => update(i, { quantity: Number(e.target.value) })}
              min={1}
              disabled={readOnly}
              className="w-16 shrink-0 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <input
              type="number"
              value={it.unitPrice}
              onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
              min={0}
              placeholder="Price"
              disabled={readOnly}
              className="w-24 shrink-0 rounded-xl border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            {!readOnly && (
              <button
                onClick={() => remove(i)}
                aria-label="Remove line"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          onClick={addLine}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Add line
        </button>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-dashed border-border p-4">
        <span className="text-sm font-semibold text-muted-foreground">Total</span>
        <span className="font-display text-2xl text-gradient-brand">{money(total)}</span>
      </div>

      {!readOnly && (
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Save quote"}
        </button>
      )}
    </div>
  );
}
