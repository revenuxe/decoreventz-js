"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddonForm } from "../addon-form";
import type { Database } from "@/lib/supabase/types";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export default function EditAddonPage() {
  const { id } = useParams<{ id: string }>();
  const [addon, setAddon] = useState<AddonRow | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("addons").select("*").eq("id", id).single();
      setAddon(data ?? null);
    })();
  }, [id]);

  if (addon === undefined) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (addon === null) return <p className="text-center text-sm text-muted-foreground">Add-on not found.</p>;

  return <AddonForm addon={addon} />;
}
