"use client";

/** Uploads a vendor's order proof photo (decoration or team) via
 * /api/vendor/upload — see that route for why this takes bookingId/kind
 * instead of an arbitrary pathPrefix like uploadCatalogImage does: the
 * server derives the S3 key itself after verifying the booking is actually
 * assigned to the calling vendor. */
export async function uploadVendorOrderImage(
  file: File,
  bookingId: string,
  kind: "decoration" | "team",
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("bookingId", bookingId);
  form.append("kind", kind);

  const res = await fetch("/api/vendor/upload", { method: "POST", body: form });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}
