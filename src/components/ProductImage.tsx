"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  sources: string[];
  fallback?: ReactNode;
};

/** Retry the original after optimizer errors, then try other gallery photos. */
export function ProductImage({ sources, ...props }: ProductImageProps) {
  const cleanSources = [...new Set(sources.map((src) => src.trim()).filter(Boolean))];
  return <ImageAttempts key={JSON.stringify([cleanSources, props.unoptimized])} sources={cleanSources} {...props} />;
}

function ImageAttempts({ sources, fallback, unoptimized, alt, ...props }: ProductImageProps) {
  const [attempt, setAttempt] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const attemptsPerSource = unoptimized ? 1 : 2;
  const source = sources[Math.floor(attempt / attemptsPerSource)];

  // A failed SSR image can finish before React attaches its error handler.
  useEffect(() => {
    const image = imageRef.current;
    if (source && image?.complete && image.naturalWidth === 0) {
      setAttempt((current) => current === attempt ? current + 1 : current);
    }
  }, [attempt, source]);

  if (!source) {
    return fallback ?? <div role="img" aria-label={(alt || "Product photo") + " - image unavailable"} aria-hidden={props["aria-hidden"]} style={props.style} className={[props.fill ? "absolute inset-0" : "", "flex h-full w-full items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground", props.className].filter(Boolean).join(" ")}>Photo unavailable</div>;
  }

  return <Image {...props} ref={imageRef} key={attempt} src={source} alt={alt}
    unoptimized={unoptimized || attempt % 2 === 1}
    onError={() => setAttempt((current) => current === attempt ? current + 1 : current)} />;
}
