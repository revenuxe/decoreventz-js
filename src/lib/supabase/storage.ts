import { getSupabaseConfig } from "./config";

export const CATALOG_BUCKET = "catalog-images";
export const BOOKING_BUCKET = "booking-images";

export function catalogKeyFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const base = new URL(getSupabaseConfig().url);
    const prefix = `/storage/v1/object/public/${CATALOG_BUCKET}/`;
    if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) return null;
    const key = decodeURIComponent(url.pathname.slice(prefix.length));
    return key && !key.split("/").some((part) => !part || part === "." || part === "..") ? key : null;
  } catch {
    return null;
  }
}

export function bookingImageUrl(key: string): string {
  return `/api/booking-images/${key.split("/").map(encodeURIComponent).join("/")}`;
}
