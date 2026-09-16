"use client";

import { ProductImage } from "./ProductImage";

export function ServiceCardImage({ images, name }: { images: string[]; name: string }) {
  return <ProductImage sources={images} alt={name} fill loading="lazy"
    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 25vw, 50vw"
    className="object-cover transition-transform duration-500 group-hover:scale-105" />;
}
