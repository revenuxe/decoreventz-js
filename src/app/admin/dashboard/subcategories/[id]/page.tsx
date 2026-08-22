"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SubcategoryForm } from "../subcategory-form";
import type { Database } from "@/lib/supabase/types";

type SubcategoryRow = Database["public"]["Tables"]["subcategories"]["Row"];

export default function EditSubcategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [subcategory, setSubcategory] = useState<SubcategoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("subcategories").select("*").eq("id", id).single();
      setSubcategory(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (!subcategory) return <p className="text-center text-sm text-muted-foreground">Subcategory not found.</p>;

  return <SubcategoryForm subcategory={subcategory} />;
}
