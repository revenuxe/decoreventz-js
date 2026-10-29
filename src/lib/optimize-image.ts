import sharp from "sharp";
import { detectedImageMimeType, MAX_IMAGE_UPLOAD_BYTES, sanitizeFileName } from "./image-sniff";

export class ImageOptimizationError extends Error {}

export function imagePolicy(path: string) {
  if (path.startsWith("homepage-hero/")) return { maxEdge: 2560, maxBytes: 300 * 1024 };
  if (/^(categories|subcategories)\//.test(path)) return { maxEdge: 1200, maxBytes: 100 * 1024 };
  if (path.startsWith("bookings/")) return { maxEdge: 1600, maxBytes: 180 * 1024 };
  return { maxEdge: 1920, maxBytes: 200 * 1024 };
}

export function webpFileName(name: string) {
  return `${sanitizeFileName(name).replace(/\.[^.]*$/, "").slice(0, 100) || "image"}.webp`;
}

/** Decode once, apply orientation, strip metadata and enforce a stored byte
 * budget. Only the first frame of animated images is stored as a still photo.
 * Never enlarge, stretch or crop an image to meet the budget. */
export async function optimizeImage(input: Buffer, path: string) {
  if (!input.length || input.length > MAX_IMAGE_UPLOAD_BYTES || !detectedImageMimeType(input)) {
    throw new ImageOptimizationError("Choose a valid image that is 4 MB or smaller.");
  }
  const { maxEdge, maxBytes } = imagePolicy(path);
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 40_000_000, pages: 1, failOn: "error" })
      .autoOrient()
      .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
      .toColourspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true });
    const originalEdge = Math.max(info.width, info.height);
    const edges = [...new Set([originalEdge, Math.round(originalEdge * 0.75), Math.round(originalEdge * 0.5), Math.min(originalEdge, 640)])].sort((a, b) => b - a);
    for (const edge of edges) {
      for (const quality of [82, 70, 58]) {
        const output = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
          .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
          .webp({ quality, effort: 4 })
          .toBuffer({ resolveWithObject: true });
        if (output.data.length <= maxBytes) {
          return { buffer: output.data, contentType: "image/webp" as const, width: output.info.width, height: output.info.height };
        }
      }
    }
    throw new ImageOptimizationError("This image cannot fit the storage limit at a usable quality. Choose a simpler or smaller photo.");
  } catch (error) {
    if (error instanceof ImageOptimizationError) throw error;
    throw new ImageOptimizationError("This image could not be processed. Export it as JPEG, PNG or WebP and try again (maximum 40 megapixels).");
  }
}
