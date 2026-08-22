import type { NextConfig } from "next";
import { s3PublicHostname } from "./src/lib/s3-public-url";

// AWS_S3_PUBLIC_URL (a CloudFront/custom domain in front of the bucket, see
// src/lib/s3-url.ts) is optional — only allowlist its hostname when set, so
// a bare bucket setup doesn't need a placeholder pattern for a domain that
// doesn't exist.
const s3CdnHostname = s3PublicHostname();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Default S3 virtual-hosted-style URL (see src/lib/s3-url.ts).
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      ...(s3CdnHostname
        ? [{ protocol: "https" as const, hostname: s3CdnHostname }]
        : []),
      // Stock photography for the decor catalog mock data (see src/data/).
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Cloudinary-hosted content images (e.g. festival/promo banners).
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
