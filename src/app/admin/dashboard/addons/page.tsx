"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gift, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export default function AddonsPage() {
  const [rows, setRows] = useState<AddonRow[]>([]);
  const [linkCounts, setLinkCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: addons }, { data: links }] = await Promise.all([
      supabase.from("addons").select("*").order("sort_order"),
      supabase.from("product_addon_links").select("addon_id"),
    ]);
    setRows(addons ?? []);
    const counts: Record<string, number> = {};
    for (const l of links ?? []) counts[l.addon_id] = (counts[l.addon_id] ?? 0) + 1;
    setLinkCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalAssigned = useMemo(
    () => Object.values(linkCounts).reduce((a, b) => a + b, 0),
    [linkCounts],
  );

  async function remove(row: AddonRow) {
    if (!confirm(`Delete "${row.name}"? It will be removed from every product it's assigned to.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("addons").delete().eq("id", row.id);
    if (error) return alert(error.message);
    load();
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Add-ons</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} add-on{rows.length === 1 ? "" : "s"} · {totalAssigned} product assignment
            {totalAssigned === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/dashboard/addons/new"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> New add-on
        </Link>
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No add-ons yet — click New add-on to build your reusable library.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-muted">
                <Gift className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  ₹{r.price.toLocaleString("en-IN")} · {linkCounts[r.id] ?? 0} product
                  {(linkCounts[r.id] ?? 0) === 1 ? "" : "s"} {!r.is_active && "· hidden"}
                </p>
              </div>
              <Link
                href={`/admin/dashboard/addons/${r.id}`}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                Edit
              </Link>
              <button
                onClick={() => remove(r)}
                aria-label={`Delete ${r.name}`}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
