"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp, Flame, Layers, Loader2, Plus, Search, Sparkles, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteCatalogImage } from "@/lib/s3-upload-client";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  categories: { name: string; slug: string } | null;
};
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };

type Selection = { type: "all" } | { type: "category"; id: string } | { type: "subcategory"; id: string };

const PRODUCTS_DIRECTORY_QUERY_KEY = ["admin", "products-directory"];
const EMPTY_PRODUCTS: ProductRow[] = [];
const EMPTY_CATEGORIES: CategoryOption[] = [];
const EMPTY_SUBCATEGORIES: SubcategoryOption[] = [];

async function fetchProductsDirectory() {
  const supabase = createClient();
  const [{ data: products, error: productsError }, { data: categoryRows, error: categoriesError }, { data: subcategoryRows, error: subcategoriesError }] = await Promise.all([
    supabase.from("products").select("*, categories(name,slug)").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("subcategories").select("id,name,category_id").order("name"),
  ]);
  if (productsError || categoriesError || subcategoriesError) throw productsError ?? categoriesError ?? subcategoriesError;
  return {
    products: (products as unknown as ProductRow[]) ?? [],
    categories: categoryRows ?? [],
    subcategories: subcategoryRows ?? [],
  };
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: directory, isLoading: loading } = useQuery({
    queryKey: PRODUCTS_DIRECTORY_QUERY_KEY,
    queryFn: fetchProductsDirectory,
  });
  const rows = directory?.products ?? EMPTY_PRODUCTS;
  const categories = directory?.categories ?? EMPTY_CATEGORIES;
  const subcategories = directory?.subcategories ?? EMPTY_SUBCATEGORIES;
  const [query, setQuery] = useState("");
  const [treeQuery, setTreeQuery] = useState("");
  const [selection, setSelection] = useState<Selection>({ type: "all" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [treeVisible, setTreeVisible] = useState(true);

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.category_id, (map.get(r.category_id) ?? 0) + 1);
    return map;
  }, [rows]);

  const countBySubcategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (!r.subcategory_id) continue;
      map.set(r.subcategory_id, (map.get(r.subcategory_id) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  const visibleTree = useMemo(() => {
    const q = treeQuery.trim().toLowerCase();
    if (!q) return categories.map((c) => ({ category: c, subs: subcategories.filter((s) => s.category_id === c.id) }));
    return categories
      .map((c) => {
        const subs = subcategories.filter((s) => s.category_id === c.id);
        const categoryMatches = c.name.toLowerCase().includes(q);
        const matchingSubs = subs.filter((s) => s.name.toLowerCase().includes(q));
        if (!categoryMatches && matchingSubs.length === 0) return null;
        return { category: c, subs: categoryMatches ? subs : matchingSubs };
      })
      .filter((x): x is { category: CategoryOption; subs: SubcategoryOption[] } => x !== null);
  }, [categories, subcategories, treeQuery]);

  const treeSearching = treeQuery.trim().length > 0;

  function toggleExpanded(categoryId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  const filtered = rows.filter((r) => {
    if (selection.type === "category" && r.category_id !== selection.id) return false;
    if (selection.type === "subcategory" && r.subcategory_id !== selection.id) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || r.tags.some((t) => t.includes(q));
  });

  async function remove(row: ProductRow) {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await Promise.all(row.images.map((url) => deleteCatalogImage(url)));
    await supabase.from("products").delete().eq("id", row.id);
    await queryClient.invalidateQueries({ queryKey: PRODUCTS_DIRECTORY_QUERY_KEY });
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Products</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {rows.length} products
          </p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> New product
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Category / subcategory tree */}
        <aside className="shrink-0 rounded-2xl border border-border bg-card p-2 lg:w-64">
          <button
            onClick={() => setSelection({ type: "all" })}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
              selection.type === "all" ? "bg-gradient-brand text-primary-foreground shadow-glow" : "hover:bg-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> All products
            <span className="ml-auto text-xs opacity-80">{rows.length}</span>
          </button>

          <div className="mt-2 flex items-center gap-1.5 px-0.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <input
                value={treeQuery}
                onChange={(e) => setTreeQuery(e.target.value)}
                placeholder="Filter categories…"
                className="w-full rounded-full border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setTreeVisible((v) => !v)}
              aria-label={treeVisible ? "Hide categories" : "Show categories"}
              title={treeVisible ? "Hide categories" : "Show categories"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary"
            >
              {treeVisible ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {treeVisible && (
          <div className="thin-scrollbar mt-1 max-h-[24rem] space-y-0.5 overflow-y-auto pr-1 lg:max-h-[32rem]">
            {visibleTree.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">No matches.</p>
            )}
            {visibleTree.map(({ category: c, subs }) => {
              const isExpanded = treeSearching ? subs.length > 0 : expanded.has(c.id);
              const isSelected = selection.type === "category" && selection.id === c.id;
              return (
                <div key={c.id} className="group/row">
                  <div
                    className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[13px] ${
                      isSelected ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {subs.length > 0 ? (
                      <button
                        onClick={() => toggleExpanded(c.id)}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        className="grid h-4 w-4 shrink-0 place-items-center text-muted-foreground"
                      >
                        <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <button
                      onClick={() => setSelection({ type: "category", id: c.id })}
                      className="min-w-0 flex-1 truncate text-left"
                    >
                      {c.name}
                    </button>
                    <span className="text-[11px] text-muted-foreground">{countByCategory.get(c.id) ?? 0}</span>
                    <Link
                      href={`/admin/dashboard/subcategories/new?category=${c.id}`}
                      aria-label={`New subcategory under ${c.name}`}
                      title="New subcategory"
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 hover:bg-background hover:text-primary group-hover/row:opacity-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Link>
                  </div>
                  {isExpanded && subs.length > 0 && (
                    <div className="ml-5 space-y-0.5 border-l border-border pl-2">
                      {subs.map((s) => {
                        const subSelected = selection.type === "subcategory" && selection.id === s.id;
                        return (
                          <div key={s.id} className="group/subrow flex items-center">
                            <button
                              onClick={() => setSelection({ type: "subcategory", id: s.id })}
                              className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1 text-left text-[12px] ${
                                subSelected ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate">{s.name}</span>
                              <span>{countBySubcategory.get(s.id) ?? 0}</span>
                            </button>
                            <Link
                              href={`/admin/dashboard/products/new?category=${c.id}&subcategory=${s.id}`}
                              aria-label={`New product in ${s.name}`}
                              title="New product in this subcategory"
                              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 hover:bg-background hover:text-primary group-hover/subrow:opacity-100"
                            >
                              <Plus className="h-3 w-3" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </aside>

        {/* Listing */}
        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or tag…"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No products match — try a different search or click New product.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Price</th>
                      <th className="px-3 py-2 text-left">Tags</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-3 py-2">
                          <Link href={`/admin/dashboard/products/${r.id}`} className="flex items-center gap-2.5">
                            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                              {r.images[0] ? (
                                <img src={r.images[0]} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Sparkles className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{r.name}</p>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-current text-accent" /> {r.rating} ({r.review_count})
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{r.categories?.name ?? "—"}</td>
                        <td className="px-3 py-2">
                          <span className="font-semibold">
                            ₹{(r.sale_price ?? r.price).toLocaleString("en-IN")}
                          </span>
                          {r.sale_price != null && (
                            <span className="ml-1.5 text-xs text-muted-foreground line-through">
                              ₹{r.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {r.tags.slice(0, 2).map((t) => (
                              <span key={t} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {r.is_trending && <Flame className="h-3.5 w-3.5 text-orange-500" />}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                r.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => remove(r)}
                            aria-label={`Delete ${r.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
