"use client";

import { useEffect, useState } from "react";
import { Loader2, Monitor, Plus, Save, Smartphone, Trash2 } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createClient } from "@/lib/supabase/client";
import { deleteCatalogImage } from "@/lib/s3-upload-client";
import type { Database } from "@/lib/supabase/types";

type Slide = Database["public"]["Tables"]["homepage_hero_slides"]["Row"];
const emptySlide = (order: number): Slide => ({ id: crypto.randomUUID(), desktop_image_url: "", mobile_image_url: null, kicker: "", title: "New campaign", subtitle: "", action_label: "Explore setups", action_url: "/categories", sort_order: order, is_active: true, created_at: "", updated_at: "" });

export default function HomepagePage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const update = (id: string, values: Partial<Slide>) => setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...values } : slide));
  const load = async () => { setLoading(true); const { data } = await createClient().from("homepage_hero_slides").select("*").order("sort_order"); setSlides(data ?? []); setLoading(false); };
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await createClient().from("homepage_hero_slides").select("*").order("sort_order");
      if (!cancelled) { setSlides(data ?? []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  async function save(slide: Slide) {
    if (!slide.desktop_image_url || !slide.title.trim()) return alert("Add a desktop image and title before saving.");
    setSaving(slide.id);
    const payload = { desktop_image_url: slide.desktop_image_url, mobile_image_url: slide.mobile_image_url, kicker: slide.kicker, title: slide.title, subtitle: slide.subtitle, action_label: slide.action_label, action_url: slide.action_url || "/categories", sort_order: slide.sort_order, is_active: slide.is_active };
    const supabase = createClient();
    const { error } = slide.created_at ? await supabase.from("homepage_hero_slides").update(payload).eq("id", slide.id) : await supabase.from("homepage_hero_slides").insert(payload);
    setSaving(null); if (error) return alert(error.message); await fetch("/api/admin/revalidate-catalog", { method: "POST" }); await load();
  }
  async function remove(slide: Slide) {
    if (!slide.created_at) return setSlides((current) => current.filter((item) => item.id !== slide.id));
    if (!confirm(`Remove “${slide.title}” from the carousel?`)) return;
    const { error } = await createClient().from("homepage_hero_slides").delete().eq("id", slide.id);
    if (error) return alert(error.message);
    if (slide.desktop_image_url) void deleteCatalogImage(slide.desktop_image_url);
    if (slide.mobile_image_url) void deleteCatalogImage(slide.mobile_image_url);
    await fetch("/api/admin/revalidate-catalog", { method: "POST" }); await load();
  }
  return <section><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl">Hero carousel</h2><p className="text-sm text-muted-foreground">{slides.length} carousel {slides.length === 1 ? "slide" : "slides"} · desktop and mobile artwork are managed separately.</p></div><button onClick={() => { setSlides((current) => [...current, emptySlide(current.length + 1)]); setCreating(true); }} className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"><Plus className="h-3.5 w-3.5" /> Add carousel</button></div>{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> : <div className="space-y-5">{slides.map((slide, index) => <article key={slide.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Carousel {index + 1}</p><p className="font-semibold">{slide.title || "Untitled slide"}</p></div><div className="flex items-center gap-2"><label className="inline-flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={slide.is_active} onChange={(event) => update(slide.id, { is_active: event.target.checked })} /> Live</label><button onClick={() => remove(slide)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-xl border border-border p-3"><p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Monitor className="h-4 w-4" /> Desktop image <span className="text-destructive">*</span></p><ImageUploadField value={slide.desktop_image_url || null} onChange={(value) => update(slide.id, { desktop_image_url: value ?? "" })} pathPrefix={`homepage-hero/${slide.id}/desktop`} /><p className="mt-2 text-xs text-muted-foreground">Recommended: wide 16:9 image, at least 1600px wide.</p></div><div className="rounded-xl border border-border p-3"><p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Smartphone className="h-4 w-4" /> Mobile image</p><ImageUploadField value={slide.mobile_image_url} onChange={(value) => update(slide.id, { mobile_image_url: value })} pathPrefix={`homepage-hero/${slide.id}/mobile`} /><p className="mt-2 text-xs text-muted-foreground">Recommended: portrait 4:5 image. If empty, desktop artwork is used.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><Field label="Eyebrow" value={slide.kicker} onChange={(value) => update(slide.id, { kicker: value })} /><Field label="Title *" value={slide.title} onChange={(value) => update(slide.id, { title: value })} /><Field label="Description" value={slide.subtitle} onChange={(value) => update(slide.id, { subtitle: value })} /><Field label="Button label" value={slide.action_label} onChange={(value) => update(slide.id, { action_label: value })} /><Field label="Button link" value={slide.action_url} onChange={(value) => update(slide.id, { action_url: value })} /><Field label="Display order" type="number" value={String(slide.sort_order)} onChange={(value) => update(slide.id, { sort_order: Number(value) || 0 })} /></div><div className="mt-5 flex justify-end"><button disabled={saving === slide.id} onClick={() => save(slide)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">{saving === slide.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{slide.created_at ? "Save changes" : "Create carousel"}</button></div></article>)}</div>}{creating && <p className="mt-3 text-xs text-muted-foreground">Your new carousel is shown below; add its image and save it to publish.</p>}</section>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number" }) { return <label className="text-xs font-semibold text-muted-foreground">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-primary" /></label>; }
