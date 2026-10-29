"use client";

import { uploadImage } from "./image-upload-client";

/** Uploads a vendor's order proof photo (decoration or team) via
 * /api/vendor/upload — see that route for why this takes bookingId/kind
 * instead of an arbitrary pathPrefix like uploadCatalogImage does: the
 * server derives the storage path itself after verifying the booking is actually
 * assigned to the calling vendor. */
export async function uploadVendorOrderImage(
  file: File,
  bookingId: string,
  kind: "decoration" | "team",
): Promise<string> {
  return uploadImage("/api/vendor/upload", file, { bookingId, kind });
}
