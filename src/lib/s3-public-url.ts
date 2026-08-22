/** Normalizes the optional CloudFront/custom public origin used for S3 files.
 * Accept both the recommended full URL and a hostname pasted from CloudFront.
 * Only HTTPS origins are accepted so uploads never emit insecure image URLs. */
export function s3PublicBaseUrl(raw = process.env.AWS_S3_PUBLIC_URL): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "https:" || !url.hostname || url.search || url.hash) return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

export function s3PublicHostname(raw = process.env.AWS_S3_PUBLIC_URL): string | null {
  const base = s3PublicBaseUrl(raw);
  return base ? new URL(base).hostname : null;
}
