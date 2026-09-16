"use client";

import Image, { type ImageProps } from "next/image";
import { ProductImage } from "./ProductImage";

/** Shared recovery for dynamic catalog images; static assets keep Next's metadata. */
export function CatalogImage({ src, alt, ...props }: Omit<ImageProps, "onError">) {
  if (typeof src !== "string") return <Image src={src} alt={alt} {...props} />;
  return <ProductImage sources={[src]} alt={alt} {...props} />;
}
