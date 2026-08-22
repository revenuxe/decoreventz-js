"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteCatalogImage } from "@/lib/s3-upload-client";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(row: CategoryRow) {
    if (!confirm(`Delete "${row.name}"? Products in this category will be affected.`)) return;
    const supabase = createClient();
    if (row.image_url) await deleteCatalogImage(row.image_url);
    const { error } = await supabase.from("categories").delete().eq("id", row.id);
    if (error) return alert(error.message);
    load();
  }

  async function swap(a: CategoryRow, b: CategoryRow) {
    const supabase = createClient();
    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Categories</h2>
          <p className="text-sm text-muted-foreground">{rows.length} categories</p>
        </div>
        <Link
          href="/admin/dashboard/categories/new"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> New category
        </Link>
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  onClick={() => i > 0 && swap(r, rows[i - 1])}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => i < rows.length - 1 && swap(r, rows[i + 1])}
                  disabled={i === rows.length - 1}
                  aria-label="Move down"
                  className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                {r.image_url ? (
                  <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Layers className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.slug} {r.tagline ? `· ${r.tagline}` : ""} {!r.is_active && "· hidden"}
                </p>
              </div>
              <Link
                href={`/admin/dashboard/categories/${r.id}`}
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
