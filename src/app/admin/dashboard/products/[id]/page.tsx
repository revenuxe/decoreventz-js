"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "../product-form";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };
type AddonOption = { id: string; name: string; price: number };
type BalloonPaletteOption = { id: string; name: string; pairs: { id: string; color1: { name: string; hex: string }; color2: { name: string; hex: string } }[] };

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRow | null | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allAddons, setAllAddons] = useState<AddonOption[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [balloonPalettes, setBalloonPalettes] = useState<BalloonPaletteOption[]>([]);
  const [reusableContent, setReusableContent] = useState<{ included: { id: string; name: string; content: Record<string, unknown> }[]; faqs: { id: string; name: string; content: Record<string, unknown> }[]; delivery: { id: string; name: string; content: Record<string, unknown> }[]; care: { id: string; name: string; content: Record<string, unknown> }[] }>({ included: [], faqs: [], delivery: [], care: [] });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: prod }, { data: cats }, { data: subs }, { data: products }, { data: addons }, { data: links }, { data: paletteRows }, { data: contentRows }] =
        await Promise.all([
          supabase.from("products").select("*").eq("id", id).single(),
          supabase.from("categories").select("id,name").order("name"),
          supabase.from("subcategories").select("id,name,category_id").order("name"),
          supabase.from("products").select("tags"),
          supabase.from("addons").select("id,name,price").order("sort_order"),
          supabase.from("product_addon_links").select("addon_id").eq("product_id", id),
          supabase.from("decoration_content_items").select("id,name,content").eq("kind", "balloon_palette").eq("is_active", true).order("name"),
          supabase.from("decoration_content_items").select("id,name,kind,content").neq("kind", "balloon_palette").eq("is_active", true).order("name"),
        ]);
      setProduct(prod ?? null);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      const tagSet = new Set<string>();
      for (const p of products ?? []) for (const t of p.tags) tagSet.add(t);
      setAllTags(Array.from(tagSet).sort());
      setAllAddons(addons ?? []);
      setSelectedAddonIds((links ?? []).map((l) => l.addon_id));
      setBalloonPalettes(((paletteRows ?? []) as unknown as { id: string; name: string; content: { pairs?: BalloonPaletteOption["pairs"] } }[]).map((palette) => ({ id: palette.id, name: palette.name, pairs: palette.content.pairs ?? [] })));
      const reusableRows = (contentRows ?? []) as unknown as { id: string; name: string; kind: string; content: Record<string, unknown> }[];
      setReusableContent({ included: reusableRows.filter((item) => item.kind === "included_set"), faqs: reusableRows.filter((item) => item.kind === "faq_set"), delivery: reusableRows.filter((item) => item.kind === "delivery_note"), care: reusableRows.filter((item) => item.kind === "care_note") });
    })();
  }, [id]);

  if (product === undefined) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (product === null) return <p className="text-center text-sm text-muted-foreground">Product not found.</p>;

  return (
    <ProductForm
      product={product}
      categories={categories}
      subcategories={subcategories}
      allTags={allTags}
      allAddons={allAddons}
      selectedAddonIds={selectedAddonIds}
      balloonPalettes={balloonPalettes}
      reusableContent={reusableContent}
    />
  );
}
