"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CategoryForm } from "../category-form";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").eq("id", id).single();
      setCategory(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (!category) return <p className="text-center text-sm text-muted-foreground">Category not found.</p>;

  return <CategoryForm category={category} />;
}
