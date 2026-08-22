"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FolderTree, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteCatalogImage } from "@/lib/s3-upload-client";
import type { Database } from "@/lib/supabase/types";

type SubcategoryRow = Database["public"]["Tables"]["subcategories"]["Row"];
type CategoryOption = { id: string; name: string };

export default function SubcategoriesPage() {
  const [rows, setRows] = useState<SubcategoryRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: subs }, { data: cats }] = await Promise.all([
      supabase.from("subcategories").select("*").order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name").order("name"),
    ]);
    setRows(subs ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [categories]);

  const filtered = categoryFilter === "all" ? rows : rows.filter((r) => r.category_id === categoryFilter);

  async function remove(row: SubcategoryRow) {
    if (!confirm(`Delete "${row.name}"?`)) return;
    const supabase = createClient();
    if (row.image_url) await deleteCatalogImage(row.image_url);
    const { error } = await supabase.from("subcategories").delete().eq("id", row.id);
    if (error) return alert(error.message);
    load();
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Subcategories</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {rows.length} subcategories
          </p>
        </div>
        <Link
          href="/admin/dashboard/subcategories/new"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> New subcategory
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No subcategories yet — click New subcategory to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                {r.image_url ? (
                  <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {categoryName(r.category_id)} · {r.slug} {!r.is_active && "· hidden"}
                </p>
              </div>
              <Link
                href={`/admin/dashboard/subcategories/${r.id}`}
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
