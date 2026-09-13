"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Gift,
  HelpCircle,
  Loader2,
  Palette,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { GalleryUploadField } from "@/components/admin/GalleryUploadField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TagInput } from "@/components/admin/TagInput";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };
type AddonOption = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  subcategory_id: string | null;
};
type BalloonOption = { name: string; colors: string[] };
type ProductFaq = { question: string; answer: string };
type BalloonPaletteOption = {
  id: string;
  name: string;
  pairs: {
    id: string;
    color1: { name: string; hex: string };
    color2: { name: string; hex: string };
  }[];
};
type ReusableContentOption = {
  id: string;
  name: string;
  content: Record<string, unknown>;
};

const TABS = [
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "media", label: "Media" },
  { key: "content", label: "Content" },
  { key: "seo", label: "SEO" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
type ProductDraft = {
  tab: TabKey;
  name: string;
  slug: string;
  slugTouched: boolean;
  categoryId: string;
  subcategoryId: string;
  tagline: string;
  description: string;
  tags: string[];
  isTrending: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  price: number | "";
  salePrice: number | "";
  images: string[];
  included: string[];
  notIncluded: string[];
  balloonOptions: BalloonOption[];
  balloonPaletteId: string;
  includedGroupId: string;
  faqGroupId: string;
  deliveryGroupId: string;
  careGroupId: string;
  faqs: ProductFaq[];
  deliveryInfo: string;
  careInfo: string;
  selectedAddonIds: string[];
  rating: number;
  reviewCount: number;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
};
const PRODUCT_DRAFT_PREFIX = "admin-product-draft:v1:";
function readProductDraft(key: string): ProductDraft | null {
  try {
    const stored = window.sessionStorage.getItem(key);
    return stored ? (JSON.parse(stored) as ProductDraft) : null;
  } catch {
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  product,
  categories,
  subcategories,
  allTags,
  allAddons,
  selectedAddonIds: initialSelectedAddonIds,
  defaultCategoryId,
  defaultSubcategoryId,
  balloonPalettes = [],
  reusableContent = { included: [], faqs: [], delivery: [], care: [] },
}: {
  /** null = creating a new product */
  product: ProductRow | null;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  allTags: string[];
  /** The shared add-ons library to pick from. */
  allAddons: AddonOption[];
  /** Add-on ids already linked to this product. */
  selectedAddonIds?: string[];
  /** Pre-selects category/subcategory when arriving from the sidebar's "+" shortcut. */
  defaultCategoryId?: string;
  defaultSubcategoryId?: string;
  balloonPalettes?: BalloonPaletteOption[];
  reusableContent?: {
    included: ReusableContentOption[];
    faqs: ReusableContentOption[];
    delivery: ReusableContentOption[];
    care: ReusableContentOption[];
  };
}) {
  const router = useRouter();
  const isNew = !product;
  const draftKey = `${PRODUCT_DRAFT_PREFIX}${product?.id ?? `new:${defaultCategoryId ?? ""}:${defaultSubcategoryId ?? ""}`}`;
  const [draftRestored, setDraftRestored] = useState(false);
  const [tab, setTab] = useState<TabKey>("details");

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [subcategoryId, setSubcategoryId] = useState(
    product?.subcategory_id ?? defaultSubcategoryId ?? "",
  );
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [isTrending, setIsTrending] = useState(product?.is_trending ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0);

  const [price, setPrice] = useState<number | "">(product?.price ?? "");
  const [salePrice, setSalePrice] = useState<number | "">(
    product?.sale_price ?? "",
  );

  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const [included, setIncluded] = useState<string[]>(product?.included ?? [""]);
  const [notIncluded, setNotIncluded] = useState<string[]>(
    product?.not_included ?? [],
  );
  const [balloonOptions, setBalloonOptions] = useState<BalloonOption[]>(
    (product?.balloon_options as unknown as BalloonOption[] | undefined) ?? [],
  );
  const [balloonPaletteId, setBalloonPaletteId] = useState(
    product?.balloon_palette_id ?? "",
  );
  const [includedGroupId, setIncludedGroupId] = useState(
    product?.included_group_id ?? "",
  );
  const [faqGroupId, setFaqGroupId] = useState(product?.faq_group_id ?? "");
  const [deliveryGroupId, setDeliveryGroupId] = useState(
    product?.delivery_group_id ?? "",
  );
  const [careGroupId, setCareGroupId] = useState(product?.care_group_id ?? "");
  const [faqs, setFaqs] = useState<ProductFaq[]>(
    (product?.faqs as unknown as ProductFaq[] | undefined) ?? [],
  );
  const [deliveryInfo, setDeliveryInfo] = useState(
    product?.delivery_info ?? "",
  );
  const [careInfo, setCareInfo] = useState(product?.care_info ?? "");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    initialSelectedAddonIds ?? [],
  );
  const [rating, setRating] = useState(product?.rating ?? 4.8);
  const [reviewCount, setReviewCount] = useState(product?.review_count ?? 0);

  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    product?.meta_description ?? "",
  );
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(
    product?.og_image_url ?? null,
  );

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = readProductDraft(draftKey);
    if (saved) {
      setTab(saved.tab);
      setName(saved.name);
      setSlug(saved.slug);
      setSlugTouched(saved.slugTouched);
      setCategoryId(saved.categoryId);
      setSubcategoryId(saved.subcategoryId);
      setTagline(saved.tagline);
      setDescription(saved.description);
      setTags(saved.tags);
      setIsTrending(saved.isTrending);
      setIsFeatured(saved.isFeatured);
      setIsActive(saved.isActive);
      setSortOrder(saved.sortOrder);
      setPrice(saved.price);
      setSalePrice(saved.salePrice);
      setImages(saved.images);
      setIncluded(saved.included);
      setNotIncluded(saved.notIncluded);
      setBalloonOptions(saved.balloonOptions);
      setBalloonPaletteId(saved.balloonPaletteId);
      setIncludedGroupId(saved.includedGroupId);
      setFaqGroupId(saved.faqGroupId);
      setDeliveryGroupId(saved.deliveryGroupId);
      setCareGroupId(saved.careGroupId);
      setFaqs(saved.faqs);
      setDeliveryInfo(saved.deliveryInfo);
      setCareInfo(saved.careInfo);
      setSelectedAddonIds(saved.selectedAddonIds);
      setRating(saved.rating);
      setReviewCount(saved.reviewCount);
      setMetaTitle(saved.metaTitle);
      setMetaDescription(saved.metaDescription);
      setOgImageUrl(saved.ogImageUrl);
    }
    setDraftRestored(true);
  }, [draftKey]);
  const draft = useMemo<ProductDraft>(
    () => ({
      tab,
      name,
      slug,
      slugTouched,
      categoryId,
      subcategoryId,
      tagline,
      description,
      tags,
      isTrending,
      isFeatured,
      isActive,
      sortOrder,
      price,
      salePrice,
      images,
      included,
      notIncluded,
      balloonOptions,
      balloonPaletteId,
      includedGroupId,
      faqGroupId,
      deliveryGroupId,
      careGroupId,
      faqs,
      deliveryInfo,
      careInfo,
      selectedAddonIds,
      rating,
      reviewCount,
      metaTitle,
      metaDescription,
      ogImageUrl,
    }),
    [
      tab,
      name,
      slug,
      slugTouched,
      categoryId,
      subcategoryId,
      tagline,
      description,
      tags,
      isTrending,
      isFeatured,
      isActive,
      sortOrder,
      price,
      salePrice,
      images,
      included,
      notIncluded,
      balloonOptions,
      balloonPaletteId,
      includedGroupId,
      faqGroupId,
      deliveryGroupId,
      careGroupId,
      faqs,
      deliveryInfo,
      careInfo,
      selectedAddonIds,
      rating,
      reviewCount,
      metaTitle,
      metaDescription,
      ogImageUrl,
    ],
  );
  useEffect(() => {
    if (!draftRestored) return;
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {}
  }, [draft, draftKey, draftRestored]);
  function discardDraft() {
    try {
      window.sessionStorage.removeItem(draftKey);
    } catch {}
    window.location.reload();
  }

  const categorySubcategories = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryId),
    [subcategories, categoryId],
  );

  const availableAddons = useMemo(
    () =>
      allAddons.filter(
        (addOn) =>
          categoryId &&
          addOn.category_id === categoryId &&
          (!subcategoryId || addOn.subcategory_id === subcategoryId),
      ),
    [allAddons, categoryId, subcategoryId],
  );

  const discountPct =
    salePrice !== "" && price !== "" && price > 0
      ? Math.round(((price - Number(salePrice)) / price) * 100)
      : 0;

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function updateIncluded(i: number, v: string) {
    setIncluded((items) => items.map((it, idx) => (idx === i ? v : it)));
  }
  function removeIncluded(i: number) {
    setIncluded((items) => items.filter((_, idx) => idx !== i));
  }
  function addIncluded() {
    setIncluded((items) => [...items, ""]);
  }
  function updateNotIncluded(i: number, v: string) {
    setNotIncluded((items) => items.map((it, idx) => (idx === i ? v : it)));
  }
  function updateBalloon(i: number, key: keyof BalloonOption, value: string) {
    setBalloonOptions((items) =>
      items.map((item, idx) =>
        idx === i
          ? {
              ...item,
              [key]:
                key === "colors"
                  ? value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                  : value,
            }
          : item,
      ),
    );
  }
  function updateFaq(i: number, key: keyof ProductFaq, value: string) {
    setFaqs((items) =>
      items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)),
    );
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setTab("details");
      return setError("Name is required");
    }
    if (!slug.trim()) {
      setTab("details");
      return setError("Slug is required");
    }
    if (!categoryId) {
      setTab("details");
      return setError("Category is required");
    }
    if (price === "" || price <= 0) {
      setTab("pricing");
      return setError("Price must be greater than 0");
    }
    if (salePrice !== "" && Number(salePrice) > price) {
      setTab("pricing");
      return setError("Sale price can't be higher than the regular price");
    }
    if (images.length === 0) {
      setTab("media");
      return setError("Add at least one product image before publishing.");
    }
    if (uploadingImages) {
      setTab("media");
      return setError("Wait for image uploads to finish before saving.");
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      price: Number(price),
      sale_price: salePrice === "" ? null : Number(salePrice),
      images,
      included: included.map((i) => i.trim()).filter(Boolean),
      not_included: notIncluded.map((i) => i.trim()).filter(Boolean),
      balloon_options: balloonOptions.filter(
        (option) => option.name.trim() && option.colors.length,
      ),
      balloon_palette_id: balloonPaletteId || null,
      included_group_id: includedGroupId || null,
      faq_group_id: faqGroupId || null,
      delivery_group_id: deliveryGroupId || null,
      care_group_id: careGroupId || null,
      faqs: faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
      delivery_info: deliveryInfo.trim() || null,
      care_info: careInfo.trim() || null,
      tags,
      is_trending: isTrending,
      is_featured: isFeatured,
      is_active: isActive,
      sort_order: sortOrder,
      rating,
      review_count: reviewCount,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      og_image_url: ogImageUrl,
    };

    const { data: savedProduct, error: saveError } = isNew
      ? await supabase.from("products").insert(payload).select("id").single()
      : await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
          .select("id")
          .single();

    if (saveError || !savedProduct) {
      setError(saveError?.message ?? "Could not save product");
      setSaving(false);
      return;
    }

    const productId = savedProduct.id;
    // Simplest correct approach for a short link list: replace wholesale
    // rather than diffing inserts/updates/deletes.
    const { error: deleteLinksError } = await supabase
      .from("product_addon_links")
      .delete()
      .eq("product_id", productId);
    if (deleteLinksError) {
      setError(
        "Product was saved, but its add-ons could not be updated. Please try saving again.",
      );
      setSaving(false);
      return;
    }
    if (selectedAddonIds.length) {
      const { error: addLinksError } = await supabase
        .from("product_addon_links")
        .insert(
          selectedAddonIds.map((addonId) => ({
            product_id: productId,
            addon_id: addonId,
          })),
        );
      if (addLinksError) {
        setError(
          "Product was saved, but its add-ons could not be updated. Please try saving again.",
        );
        setSaving(false);
        return;
      }
    }

    // The public catalog uses a server cache for speed. Invalidate it only
    // after all related product writes have succeeded, so palette assignment
    // changes are visible on the next customer page view.
    await fetch("/api/admin/revalidate-catalog", { method: "POST" });

    setSaving(false);
    router.push("/admin/dashboard/products");
  }

  return (
    <section className="mx-auto max-w-4xl">
      <Link
        href="/admin/dashboard/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">
          {isNew ? "New product" : `Edit ${product.name}`}
        </h2>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {/* Tab bar */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === t.key
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5">
          {tab === "details" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
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
                <Field label="Category" required>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId("");
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {categorySubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {categorySubcategories.length === 0 && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      No subcategories under this category yet.
                    </span>
                  )}
                </Field>
                <Field label="Tagline" className="md:col-span-2">
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
              </div>

              <div className="border-t border-border pt-4">
                <Field label="Tags">
                  <TagInput
                    value={tags}
                    onChange={setTags}
                    suggestions={allTags}
                  />
                </Field>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Toggle
                    label="Active"
                    checked={isActive}
                    onChange={setIsActive}
                  />
                  <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    Sort order
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {tab === "pricing" && (
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Price (₹)" required>
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 2999"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Sale price (₹)">
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <div className="flex flex-col justify-end">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Discount
                </span>
                <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm font-bold text-gradient-brand">
                  {discountPct > 0 ? `${discountPct}% off` : "—"}
                </p>
              </div>
            </div>
          )}

          {tab === "media" && (
            <GalleryUploadField
              value={images}
              onChange={setImages}
              pathPrefix={`products/${product?.id ?? "new"}`}
              onUploadingChange={setUploadingImages}
            />
          )}

          {tab === "content" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                For each field, choose a reusable group or select{" "}
                <strong className="text-foreground">
                  Custom for this product
                </strong>{" "}
                to enter product-specific content.
              </p>
              <div>
                <ContentSourceSelect
                  label="What's included source"
                  value={includedGroupId}
                  onChange={setIncludedGroupId}
                  options={reusableContent.included}
                />
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  What&apos;s included
                </h3>
                {!includedGroupId && (
                  <div className="space-y-2">
                    {included.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={item}
                          onChange={(e) => updateIncluded(i, e.target.value)}
                          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeIncluded(i)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addIncluded}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add line
                    </button>
                  </div>
                )}
              </div>

              <ContentSection
                icon={Palette}
                title="Balloon Palette"
                description="Assign one reusable balloon palette, or leave it unassigned for products without balloon decoration."
              >
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Reusable Balloon Palette
                  </label>
                  <select
                    value={balloonPaletteId}
                    onChange={(e) => setBalloonPaletteId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No balloon palette</option>
                    {balloonPalettes.map((palette) => (
                      <option key={palette.id} value={palette.id}>
                        {palette.name}
                      </option>
                    ))}
                  </select>
                  {balloonPaletteId &&
                    (() => {
                      const palette = balloonPalettes.find(
                        (item) => item.id === balloonPaletteId,
                      );
                      return palette ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {palette.pairs.slice(0, 4).map((pair) => (
                            <span
                              key={pair.id}
                              className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 text-xs"
                            >
                              <i
                                className="h-3 w-3 rounded-full border"
                                style={{ backgroundColor: pair.color1.hex }}
                              />
                              {pair.color1.name}
                              <span>+</span>
                              <i
                                className="h-3 w-3 rounded-full border"
                                style={{ backgroundColor: pair.color2.hex }}
                              />
                              {pair.color2.name}
                            </span>
                          ))}
                          {palette.pairs.length > 4 && (
                            <span className="self-center text-xs text-muted-foreground">
                              + {palette.pairs.length - 4} more pairs
                            </span>
                          )}
                        </div>
                      ) : null;
                    })()}
                </div>
                {false &&
                  balloonOptions.map((option, i) => (
                    <div
                      key={i}
                      className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]"
                    >
                      <input
                        value={option.name}
                        onChange={(e) =>
                          updateBalloon(i, "name", e.target.value)
                        }
                        placeholder="e.g. Pink · White · Rosegold"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        value={option.colors.join(", ")}
                        onChange={(e) =>
                          updateBalloon(i, "colors", e.target.value)
                        }
                        placeholder="pink, white, #d8a1a8"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBalloonOptions((items) =>
                            items.filter((_, idx) => idx !== i),
                          )
                        }
                        className="grid h-10 w-10 place-items-center rounded-xl border border-border text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                {false && (
                  <ContentAddButton
                    label="Add colour palette"
                    onClick={() =>
                      setBalloonOptions((items) => [
                        ...items,
                        { name: "", colors: [] },
                      ])
                    }
                  />
                )}
              </ContentSection>

              <ContentSection
                icon={Check}
                title="Not included"
                description="Use this for items customers often assume are part of the package."
              >
                {notIncluded.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) => updateNotIncluded(i, e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNotIncluded((items) =>
                          items.filter((_, idx) => idx !== i),
                        )
                      }
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <ContentAddButton
                  label="Add exclusion"
                  onClick={() => setNotIncluded((items) => [...items, ""])}
                />
              </ContentSection>

              <ContentSection
                icon={HelpCircle}
                title="FAQs"
                description="Answers appear in the FAQ tab on this product page."
              >
                <ContentSourceSelect
                  label="FAQs source"
                  value={faqGroupId}
                  onChange={setFaqGroupId}
                  options={reusableContent.faqs}
                />
                {!faqGroupId && (
                  <>
                    {faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="grid gap-2 rounded-xl border border-border p-3"
                      >
                        <input
                          value={faq.question}
                          onChange={(e) =>
                            updateFaq(i, "question", e.target.value)
                          }
                          placeholder="Question"
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-2">
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaq(i, "answer", e.target.value)
                            }
                            placeholder="Answer"
                            rows={2}
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFaqs((items) =>
                                items.filter((_, idx) => idx !== i),
                              )
                            }
                            className="grid h-10 w-10 place-items-center rounded-xl border border-border text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <ContentAddButton
                      label="Add FAQ"
                      onClick={() =>
                        setFaqs((items) => [
                          ...items,
                          { question: "", answer: "" },
                        ])
                      }
                    />
                  </>
                )}
              </ContentSection>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Delivery information">
                  <ContentSourceSelect
                    label="Delivery source"
                    value={deliveryGroupId}
                    onChange={setDeliveryGroupId}
                    options={reusableContent.delivery}
                  />
                  {!deliveryGroupId && (
                    <textarea
                      value={deliveryInfo}
                      onChange={(e) => setDeliveryInfo(e.target.value)}
                      rows={4}
                      placeholder="Setup timing, location coverage, or booking notice."
                      className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </Field>
                <Field label="Care information">
                  <ContentSourceSelect
                    label="Care information source"
                    value={careGroupId}
                    onChange={setCareGroupId}
                    options={reusableContent.care}
                  />
                  {!careGroupId && (
                    <textarea
                      value={careInfo}
                      onChange={(e) => setCareInfo(e.target.value)}
                      rows={4}
                      placeholder="How to keep the decor looking its best."
                      className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </Field>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Add-ons
                  </h3>
                  <Link
                    href="/admin/dashboard/addons/new"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <Plus className="h-3 w-3" /> New add-on
                  </Link>
                </div>
                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId("");
                    }}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select add-on category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    disabled={!categoryId}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">All subcategories</option>
                    {categorySubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                {availableAddons.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No add-ons in your library yet. Create some from the Add-ons
                    tab, then assign them here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableAddons.map((addOn) => {
                      const selected = selectedAddonIds.includes(addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          onClick={() => toggleAddon(addOn.id)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                              : "border-border bg-background"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                                selected
                                  ? "border-brand-pink bg-brand-pink text-primary-foreground"
                                  : "border-border"
                              }`}
                            >
                              {selected && <Check className="h-3 w-3" />}
                            </span>
                            <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                              {addOn.name}
                            </span>
                          </span>
                          <span className="text-sm font-bold">
                            ₹{addOn.price.toLocaleString("en-IN")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Rating (no live reviews yet — set manually)
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Rating (0–5)">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Field>
                  <Field label="Review count">
                    <input
                      type="number"
                      min={0}
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-3">
              <Field label="Meta title">
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={`${name || "Product name"} | Decor Eventz`}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={tagline || "Falls back to the tagline"}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Social share image (OG image)">
                <ImageUploadField
                  value={ogImageUrl}
                  onChange={setOgImageUrl}
                  pathPrefix={`products/${product?.id ?? "new"}/seo`}
                />
              </Field>
            </div>
          )}
        </div>

        {error && (
          <p className="mx-5 mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Link
            href="/admin/dashboard/products"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || uploadingImages}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {saving || uploadingImages ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {uploadingImages
              ? "Uploading images"
              : isNew
                ? "Create product"
                : "Save changes"}
          </button>
        </div>
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

function ContentSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-muted/20 p-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ContentAddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ContentSourceSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReusableContentOption[];
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
      >
        <option value="">Custom for this product</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--brand-purple)]"
      />
      {label}
    </label>
  );
}
