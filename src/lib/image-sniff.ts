/**
 * Files currently pass through a Vercel Function before reaching S3. Vercel
 * limits Function request bodies to 4.5 MB, so leave headroom for multipart
 * form data and reject files that would otherwise be rejected before our
 * route can return a useful error.
 */
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Returns the verified image MIME type from magic bytes. This avoids storing
 * a file under a browser-supplied content type and rejects generic RIFF files
 * that are not actually WebP images. */
export function detectedImageMimeType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  ) return "image/webp";
  if (String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp") return "image/heic";
  return null;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

export function sanitizeObjectPrefix(prefix: string): string | null {
  const normalized = prefix.replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized.includes("..")) return null;
  return normalized.split("/").every((segment) => /^[a-zA-Z0-9_-]+$/.test(segment))
    ? normalized
    : null;
}
