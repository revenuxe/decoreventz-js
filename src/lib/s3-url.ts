import { getS3Config } from "./s3";
import { s3PublicBaseUrl } from "./s3-public-url";

/** Builds the public URL for an object key. Uses AWS_S3_PUBLIC_URL (a
 * CloudFront/custom-domain front for the bucket) when set, otherwise falls
 * back to the default S3 virtual-hosted-style URL — see next.config.ts's
 * remotePatterns, which allowlists both shapes for next/image. */
export function s3PublicUrl(key: string): string {
  const { region, bucketName } = getS3Config();
  const base = s3PublicBaseUrl();
  if (base) return `${base}/${key}`;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/** Reverses s3PublicUrl — extracts the object key back out of either URL
 * shape, so deletes work regardless of which one produced the stored URL. */
export function s3KeyFromUrl(url: string): string | null {
  const { region, bucketName } = getS3Config();
  const base = s3PublicBaseUrl();

  try {
    const parsed = new URL(url);
    if (base) {
      const publicBase = new URL(base);
      const basePath = publicBase.pathname.replace(/\/+$/, "");
      const keyPath = parsed.pathname;
      if (parsed.origin === publicBase.origin && keyPath.startsWith(`${basePath}/`)) {
        return decodeURIComponent(keyPath.slice(basePath.length + 1)) || null;
      }
    }
    if (parsed.hostname !== `${bucketName}.s3.${region}.amazonaws.com`) return null;
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || null;
  } catch {
    return null;
  }
}
