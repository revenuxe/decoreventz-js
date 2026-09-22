"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCatalogSort<T extends { id: string; sort_order: number }>(
  table: "categories" | "subcategories",
  rows: T[],
  onSorted: (rows: T[]) => void,
  reload: () => Promise<unknown>,
) {
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function move(id: string, targetId: string) {
    if (lock.current || id === targetId) return;
    const from = rows.findIndex(row => row.id === id);
    const to = rows.findIndex(row => row.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...rows];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    const ordered = reordered.map((row, index) => ({ ...row, sort_order: index + 1 }));
    lock.current = true;
    setSaving(true);
    setStatus("Saving order…");
    onSorted(ordered);
    try {
      const client = createClient();
      const results = await Promise.all(ordered.map(row =>
        client.from(table).update({ sort_order: row.sort_order }).eq("id", row.id).select("id").single(),
      ));
      if (results.some(result => result.error)) throw new Error("Order could not be fully saved. Please try again.");
      setStatus("Order saved");
    } catch {
      setStatus("Order could not be fully saved. Please try again.");
      await reload();
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return { move, saving, status };
}
