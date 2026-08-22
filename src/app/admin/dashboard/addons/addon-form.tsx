"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };
type ProductOption = { id: string; name: string; category_id: string; subcategory_id: string | null };

export function AddonForm({ addon }: { addon: AddonRow | null }) {
  const router = useRouter();
  const isNew = !addon;

  const [name, setName] = useState(addon?.name ?? "");
  const [price, setPrice] = useState<number | "">(addon?.price ?? "");
  const [sortOrder, setSortOrder] = useState(addon?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(addon?.is_active ?? true);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [loadingPicker, setLoadingPicker] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: cats }, { data: subs }, { data: prods }, linksRes] = await Promise.all([
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("subcategories").select("id,name,category_id").order("name"),
        supabase.from("products").select("id,name,category_id,subcategory_id").order("name"),
        addon
          ? supabase.from("product_addon_links").select("product_id").eq("addon_id", addon.id)
          : Promise.resolve({ data: [] as { product_id: string }[] }),
      ]);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      setProducts(prods ?? []);
      setSelectedProductIds(new Set((linksRes.data ?? []).map((l) => l.product_id)));
      setLoadingPicker(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSubcategories = useMemo(
    () => (categoryFilter === "all" ? subcategories : subcategories.filter((s) => s.category_id === categoryFilter)),
    [subcategories, categoryFilter],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (subcategoryFilter !== "all" && p.subcategory_id !== subcategoryFilter) return false;
      return true;
    });
  }, [products, categoryFilter, subcategoryFilter]);

  function toggleProduct(id: string) {
    setSelectedProductIds((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedProductIds((ids) => new Set([...ids, ...filteredProducts.map((p) => p.id)]));
  }

  function clearAllVisible() {
    const visible = new Set(filteredProducts.map((p) => p.id));
    setSelectedProductIds((ids) => new Set([...ids].filter((id) => !visible.has(id))));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) return setError("Name is required");
    if (price === "" || price <= 0) return setError("Price must be greater than 0");

    setSaving(true);
    const supabase = createClient();
    const payload = { name: name.trim(), price: Number(price), sort_order: sortOrder, is_active: isActive };

    const { data: savedAddon, error: saveError } = isNew
      ? await supabase.from("addons").insert(payload).select("id").single()
      : await supabase.from("addons").update(payload).eq("id", addon.id).select("id").single();

    if (saveError || !savedAddon) {
      setError(saveError?.message ?? "Could not save add-on");
      setSaving(false);
      return;
    }

    const addonId = savedAddon.id;
    await supabase.from("product_addon_links").delete().eq("addon_id", addonId);
    if (selectedProductIds.size) {
      await supabase.from("product_addon_links").insert(
        [...selectedProductIds].map((productId) => ({ product_id: productId, addon_id: addonId })),
      );
    }

    setSaving(false);
    router.push("/admin/dashboard/addons");
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/admin/dashboard/addons"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to add-ons
      </Link>

      <h2 className="mb-6 font-display text-2xl">{isNew ? "New add-on" : `Edit ${addon.name}`}</h2>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Name" required className="md:col-span-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Themed cake"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Price (₹)" required>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 499"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sort order">
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--brand-purple)]"
            />
            Active (selectable on storefront)
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold">Assign to products</h3>
            <p className="text-xs text-muted-foreground">
              {selectedProductIds.size} product{selectedProductIds.size === 1 ? "" : "s"} selected
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={selectAllVisible}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Select all shown
            </button>
            <button
              type="button"
              onClick={clearAllVisible}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Clear shown
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter("all");
            }}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">All subcategories</option>
            {filteredSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {loadingPicker ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        ) : filteredProducts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No products match this filter.
          </p>
        ) : (
          <div className="grid max-h-80 gap-1.5 overflow-y-auto md:grid-cols-2">
            {filteredProducts.map((p) => {
              const selected = selectedProductIds.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                    selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                      selected ? "border-brand-pink bg-brand-pink text-primary-foreground" : "border-border"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate text-sm font-semibold">{p.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Link
          href="/admin/dashboard/addons"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Create add-on" : "Save changes"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
