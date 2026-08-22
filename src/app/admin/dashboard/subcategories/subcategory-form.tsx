"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Database } from "@/lib/supabase/types";

type SubcategoryRow = Database["public"]["Tables"]["subcategories"]["Row"];
type CategoryOption = { id: string; name: string };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function SubcategoryForm({
  subcategory,
  defaultCategoryId,
}: {
  subcategory: SubcategoryRow | null;
  /** Pre-selects the category when arriving from a category's "+" shortcut. */
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  const isNew = !subcategory;
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState(subcategory?.name ?? "");
  const [slug, setSlug] = useState(subcategory?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [categoryId, setCategoryId] = useState(subcategory?.category_id ?? defaultCategoryId ?? "");
  const [tagline, setTagline] = useState(subcategory?.tagline ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(subcategory?.image_url ?? null);
  const [sortOrder, setSortOrder] = useState(subcategory?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(subcategory?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id,name").order("name");
      setCategories(data ?? []);
      if (!categoryId && data?.[0]) setCategoryId(data[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) return setError("Name is required");
    if (!slug.trim()) return setError("Slug is required");
    if (!categoryId) return setError("Category is required");

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      tagline: tagline.trim() || null,
      image_url: imageUrl,
      sort_order: sortOrder,
      is_active: isActive,
    };
    const { error: saveError } = isNew
      ? await supabase.from("subcategories").insert(payload)
      : await supabase.from("subcategories").update(payload).eq("id", subcategory.id);

    setSaving(false);
    if (saveError) return setError(saveError.message);
    router.push("/admin/dashboard/subcategories");
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href="/admin/dashboard/subcategories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to subcategories
      </Link>

      <h2 className="mb-6 font-display text-2xl">
        {isNew ? "New subcategory" : `Edit ${subcategory.name}`}
      </h2>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" required>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Slug" required>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
        </div>

        <Field label="Category" required>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tagline">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>

        <Field label="Image">
          <ImageUploadField
            value={imageUrl}
            onChange={setImageUrl}
            pathPrefix={`subcategories/${subcategory?.id ?? "new"}`}
          />
        </Field>

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
            Active (visible on storefront)
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Link
            href="/admin/dashboard/subcategories"
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
            {isNew ? "Create subcategory" : "Save changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
