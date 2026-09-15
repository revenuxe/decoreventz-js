"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Tags, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export default function TopicsPage() { return <HomepageTopicsManager />; }

type Topic = Database["public"]["Tables"]["homepage_topics"]["Row"];
type CatalogCategory = Database["public"]["Tables"]["categories"]["Row"];
type CatalogSubcategory = Database["public"]["Tables"]["subcategories"]["Row"];
type CatalogProduct = Database["public"]["Tables"]["products"]["Row"];

const emptyTopic = (order: number): Topic => ({
  id: crypto.randomUUID(), title: "New topic", title_accent: "setups", eyebrow: "Curated for you", category_id: null, subcategory_id: null, sort_order: order, is_active: true, created_at: "", updated_at: "",
});

function HomepageTopicsManager() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    return Promise.all([
      supabase.from("homepage_topics").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("subcategories").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("homepage_topic_products").select("topic_id, product_id, sort_order").order("sort_order"),
    ]).then(([{ data: topicData }, { data: categoryData }, { data: subcategoryData }, { data: productData }, { data: linkData }]) => {
    setTopics(topicData ?? []); setCategories(categoryData ?? []); setSubcategories(subcategoryData ?? []); setProducts(productData ?? []);
    const next: Record<string, string[]> = {};
    for (const link of linkData ?? []) next[link.topic_id] = [...(next[link.topic_id] ?? []), link.product_id];
    setSelected(next); setLoading(false);
    });
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);
  const update = (id: string, patch: Partial<Topic>) => setTopics((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const scopedSubcategories = (topic: Topic) => subcategories.filter((sub) => sub.category_id === topic.category_id);
  const scopedProducts = (topic: Topic) => products.filter((product) => product.is_active && (!topic.category_id || product.category_id === topic.category_id) && (!topic.subcategory_id || product.subcategory_id === topic.subcategory_id));

  const toggleProduct = (topicId: string, productId: string) => setSelected((current) => ({ ...current, [topicId]: (current[topicId] ?? []).includes(productId) ? current[topicId].filter((id) => id !== productId) : [...(current[topicId] ?? []), productId] }));
  async function save(topic: Topic) {
    if (!topic.title.trim()) return alert("Give this topic a section heading.");
    const productIds = selected[topic.id] ?? [];
    if (!productIds.length) return alert("Select at least one product for this topic.");
    setSaving(topic.id);
    const payload = { title: topic.title.trim(), title_accent: topic.title_accent.trim(), eyebrow: topic.eyebrow.trim(), category_id: topic.category_id, subcategory_id: topic.subcategory_id, sort_order: topic.sort_order, is_active: topic.is_active };
    const { error } = topic.created_at ? await supabase.from("homepage_topics").update(payload).eq("id", topic.id) : await supabase.from("homepage_topics").insert({ ...payload, id: topic.id });
    if (!error) {
      const { error: removeError } = await supabase.from("homepage_topic_products").delete().eq("topic_id", topic.id);
      if (!removeError) {
        const { error: linksError } = await supabase.from("homepage_topic_products").insert(productIds.map((product_id, index) => ({ topic_id: topic.id, product_id, sort_order: index + 1 })));
        if (linksError) alert(linksError.message);
      } else alert(removeError.message);
    } else alert(error.message);
    setSaving(null); await fetch("/api/admin/revalidate-catalog", { method: "POST" }); await load();
  }
  async function remove(topic: Topic) {
    if (!topic.created_at) return setTopics((items) => items.filter((item) => item.id !== topic.id));
    if (!confirm(`Remove “${topic.title}” from the homepage?`)) return;
    const { error } = await supabase.from("homepage_topics").delete().eq("id", topic.id);
    if (error) return alert(error.message);
    await fetch("/api/admin/revalidate-catalog", { method: "POST" }); await load();
  }

  return <section className="mt-12 border-t border-border pt-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Tags className="h-5 w-5 text-accent" /><h2 className="font-display text-2xl">Homepage topics</h2></div><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Create curated rows directly after the hero. Set their homepage order, filter the catalog by category or subcategory, then select the products to show.</p></div><button onClick={() => setTopics((items) => [...items, emptyTopic(items.length + 1)])} className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"><Plus className="h-3.5 w-3.5" /> Add topic</button></div>{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> : <div className="space-y-5">{topics.map((topic, index) => { const candidates = scopedProducts(topic); const selectedIds = selected[topic.id] ?? []; return <article key={topic.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic {index + 1}</p><p className="font-semibold text-primary">{[topic.title, topic.title_accent].filter(Boolean).join(" ") || "Untitled topic"}</p></div><div className="flex items-center gap-3"><label className="inline-flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={topic.is_active} onChange={(event) => update(topic.id, { is_active: event.target.checked })} /> Live</label><button onClick={() => void remove(topic)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label="Eyebrow label" value={topic.eyebrow} onChange={(value) => update(topic.id, { eyebrow: value })} /><Field label="Section heading" value={[topic.title, topic.title_accent].filter(Boolean).join(" ")} onChange={(value) => { const words = value.trim().split(/\s+/).filter(Boolean); update(topic.id, { title: words.slice(0, -1).join(" ") || words[0] || "", title_accent: words.length > 1 ? words.at(-1) ?? "" : "" }); }} /><Field label="Homepage position" type="number" value={String(topic.sort_order)} onChange={(value) => update(topic.id, { sort_order: Number(value) || 0 })} /></div><div className="mt-5 grid gap-3 rounded-xl bg-muted/45 p-4 md:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Category<select value={topic.category_id ?? ""} onChange={(event) => { update(topic.id, { category_id: event.target.value || null, subcategory_id: null }); }} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-primary"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-xs font-semibold text-muted-foreground">Subcategory<select value={topic.subcategory_id ?? ""} disabled={!topic.category_id} onChange={(event) => { update(topic.id, { subcategory_id: event.target.value || null }); }} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"><option value="">All subcategories</option>{scopedSubcategories(topic).map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}</select></label></div><div className="mt-4"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold text-primary">Choose products <span className="font-normal text-muted-foreground">({selectedIds.length} selected)</span></p><div className="flex gap-2"><button onClick={() => setSelected((current) => ({ ...current, [topic.id]: candidates.map((product) => product.id) }))} className="text-xs font-semibold text-primary underline">Select shown</button><button onClick={() => setSelected((current) => ({ ...current, [topic.id]: [] }))} className="text-xs font-semibold text-muted-foreground underline">Clear</button></div></div><div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">{candidates.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-primary"><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleProduct(topic.id, product.id)} />{product.name}</label>)}{!candidates.length && <p className="text-sm text-muted-foreground">No active products match this selection.</p>}</div></div><div className="mt-5 flex justify-end"><button disabled={saving === topic.id} onClick={() => void save(topic)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">{saving === topic.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{topic.created_at ? "Save topic" : "Create topic"}</button></div></article>; })}{!topics.length && <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center"><Tags className="mx-auto h-7 w-7 text-accent" /><p className="mt-3 font-semibold text-primary">No homepage topics yet</p><p className="mt-1 text-sm text-muted-foreground">Add a topic to place a custom product row right after the hero.</p></div>}</div>}</section>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number" }) { return <label className="text-xs font-semibold text-muted-foreground">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-primary" /></label>; }