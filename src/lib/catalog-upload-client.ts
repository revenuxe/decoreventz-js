"use client";

import { uploadImage } from "./image-upload-client";

/** Upload catalog artwork to Supabase Storage through the authenticated API. */
export function uploadCatalogImage(file: File, pathPrefix: string): Promise<string> {
  return uploadImage("/api/upload", file, { pathPrefix });
}

/** Best-effort delete — failures are swallowed since this is always cleanup
 * (replacing/removing an image), never something the user is blocked on. */
export async function deleteCatalogImage(url: string): Promise<void> {
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Swallowed — see comment above.
  }
}
