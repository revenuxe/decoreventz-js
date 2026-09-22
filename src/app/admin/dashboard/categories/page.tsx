"use client";

import { CatalogImage as Image } from "@/components/CatalogImage";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CatalogSortHandle } from "@/components/admin/CatalogSortHandle";
import { useCatalogSort } from "@/lib/use-catalog-sort";
import { Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteCatalogImage } from "@/lib/s3-upload-client";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    return supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }).then(({ data }) => {
    setRows(data ?? []);
    setLoading(false);
    });
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

  const sorting = useCatalogSort("categories", rows, setRows, load);

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

      <p className="mb-3 text-xs text-muted-foreground">Drag the handles to reorder categories. You can also focus a handle and use the arrow keys.</p>
      <p role="status" className="mb-3 text-xs text-muted-foreground">{sorting.status}</p>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              data-sort-id={r.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm data-[sort-target=true]:ring-2 data-[sort-target=true]:ring-primary"
            >
              <CatalogSortHandle id={r.id} name={r.name} ids={rows.map(row => row.id)} disabled={sorting.saving} onMove={sorting.move} />
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                {r.image_url ? (
                  <Image unoptimized width={40} height={40} src={r.image_url} alt="" className="h-full w-full object-cover" />
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
                disabled={sorting.saving}
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
