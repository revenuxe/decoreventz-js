"use client";

import { toast } from "sonner";

// A cache refresh failure must not turn a successful database save into a
// duplicate create when the admin retries it.
export async function refreshPublicCatalog() {
  try {
    const response = await fetch("/api/admin/revalidate-catalog", { method: "POST" });
    if (!response.ok) throw new Error("Catalog refresh failed");
  } catch {
    toast.warning("Changes were saved, but the storefront refresh failed. Public updates may be delayed.");
  }
}
