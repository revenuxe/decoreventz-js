"use client";

import { MAX_IMAGE_UPLOAD_BYTES } from "./image-sniff";

/** Handles JSON API errors and platform errors (such as an HTML 413 page). */
export async function uploadImage(endpoint: string, file: File, fields: Record<string, string>): Promise<string> {
  if (!file.size || file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Choose a non-empty image that is 4 MB or smaller.");
  }
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  const response = await fetch(endpoint, { method: "POST", body: form, credentials: "same-origin" });
  let data: { url?: unknown; error?: unknown } | null = null;
  try {
    data = await response.json();
  } catch {
    // A hosting platform may reject a request before the route executes.
  }
  if (!response.ok || typeof data?.url !== "string" || !data.url) {
    const fallback = response.status === 413
      ? "The image is too large for the upload service. Choose a smaller image and try again."
      : response.status === 401
        ? "Your session has expired or you do not have permission. Sign in and try again."
        : "Image upload failed. Please try again.";
    throw new Error(typeof data?.error === "string" && data.error ? data.error : fallback);
  }
  return data.url;
}
