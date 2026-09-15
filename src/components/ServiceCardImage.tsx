"use client";

import Image from "next/image";
import { useState } from "react";

/** Try the original when an optimized variant fails, then the remaining gallery. */
export function ServiceCardImage({ images, name }: { images: string[]; name: string }) {
  const sources = [...new Set(images.filter((src) => src.trim()))];
  return <CardImageAttempts key={JSON.stringify(sources)} sources={sources} name={name} />;
}

function CardImageAttempts({ sources, name }: { sources: string[]; name: string }) {
  const [attempt, setAttempt] = useState(0);
  const source = sources[Math.floor(attempt / 2)];
  if (!source) {
    return <div role="img" aria-label={name + " ? image unavailable"} className="flex h-full w-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">Photo temporarily unavailable</div>;
  }
  return <Image key={attempt} src={source} alt={name} fill
    unoptimized={attempt % 2 === 1} loading="lazy"
    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 25vw, 50vw"
    onError={() => setAttempt((current) => current === attempt ? current + 1 : current)}
    className="object-cover transition-transform duration-500 group-hover:scale-105" />;
}
