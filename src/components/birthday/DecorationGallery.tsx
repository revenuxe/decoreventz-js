"use client";

import { useState } from "react";
import Link from "next/link";
import { siteImage } from "@/data/images";
import { birthdayLandingHref } from "./navigation";
import { CatalogImage } from "@/components/CatalogImage";
import { birthdayCategories, birthdayStyles } from "./content";
import { LeadLink } from "./LeadLink";

export type BirthdayDesign = {
  id: string;
  name: string;
  image: string;
  href: string;
  description: string;
  search: string;
};
const terms: Record<string, string[]> = {
  "Birthday at Home": ["home", "birthday"],
  "Kids Birthday": [
    "kids",
    "kid",
    "baby",
    "jungle",
    "unicorn",
    "cocomelon",
    "princess",
    "superhero",
  ],
  "Simple Decoration": ["simple", "pastel"],
  "Balloon Decoration": ["balloon"],
  "Premium Decoration": ["premium", "luxury", "grand"],
  "Room Surprise": ["room", "surprise"],
  "Theme Decoration": ["theme"],
  "1st Birthday": ["1st", "first"],
  "Balloon Arch": ["arch"],
  "Ring Decoration": ["ring"],
  "Backdrop Decoration": ["backdrop"],
  "Balloon Wall": ["wall"],
  "Room Decoration": ["room"],
  "Surprise Decoration": ["surprise"],
};
function matches(design: BirthdayDesign, category: string) {
  return (terms[category] ?? [category.toLowerCase()]).some((term) =>
    design.search.includes(term),
  );
}

export function DecorationGallery({ designs }: { designs: BirthdayDesign[] }) {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(12);
  const photos = designs.filter((design) => design.image);
  const filtered =
    filter === "All"
      ? designs
      : designs.filter((design) => matches(design, filter));
  const choose = (category: string) => {
    setFilter(category);
    setLimit(12);
  };
  return (
    <>
      <section
        className="birthday-section"
        aria-labelledby="categories-heading"
      >
        <p className="birthday-eyebrow">A celebration that feels like you</p>
        <h2 id="categories-heading" className="birthday-heading">
          Explore Birthday Decorations
        </h2>
        <p className="birthday-copy">
          Find a birthday setup that matches your celebration, space and style.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {birthdayCategories.map((category, index) => {
            const design =
              designs.find((item) => item.image && matches(item, category)) ??
              photos[index % Math.max(1, photos.length)];
            return (
              <Link
                key={category}
                href={birthdayLandingHref(category)}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-card"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <CatalogImage
                    src={design?.image || siteImage("balloonArch")}
                    alt={design?.name || "Decorative balloon arrangement"}
                    fill
                    sizes="(max-width: 768px) 45vw, 23vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="block px-3 py-4 text-sm font-bold">
                  {category} <span aria-hidden="true">↗</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section
        id="decorations"
        className="birthday-section scroll-mt-28"
        aria-labelledby="designs-heading"
      >
        <p className="birthday-eyebrow">Find your inspiration</p>
        <h2 id="designs-heading" className="birthday-heading">
          Birthday Decoration Designs in Bangalore
        </h2>
        <p className="birthday-copy">
          Explore birthday decoration ideas for homes, apartments, party halls
          and event venues. Discuss your theme, colours and celebration with our
          team.
        </p>
        <div
          className="my-6 flex flex-wrap gap-2"
          aria-label="Filter decorations"
        >
          {["All", ...birthdayCategories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              onClick={() => choose(category)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status">
          {filtered.length} designs for {filter}
        </p>
        <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, limit).map((design) => (
            <article
              key={design.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
            >
              <Link
                href={design.href}
                className="relative block aspect-[4/3] bg-muted"
              >
                {design.image ? (
                  <CatalogImage
                    src={design.image}
                    alt={design.name}
                    fill
                    sizes="(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-sm text-muted-foreground">
                    Design image coming soon
                  </span>
                )}
              </Link>
              <div className="p-5">
                <p className="birthday-eyebrow">Birthday decoration</p>
                <h3 className="mt-2 text-lg font-semibold">
                  <Link href={design.href}>{design.name}</Link>
                </h3>
                {design.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {design.description}
                  </p>
                )}
                <LeadLink
                  context={design.name}
                  className="mt-5 inline-flex min-h-11 items-center font-bold text-primary"
                >
                  Get Quote{" "}
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </LeadLink>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className="rounded-3xl border border-border bg-muted p-8">
            <h3 className="text-lg font-semibold">
              Let’s plan your{" "}
              {filter === "All" ? "birthday decoration" : filter.toLowerCase()}
            </h3>
            <p className="mt-2 text-muted-foreground">
              Share an inspiration photo, your venue and preferred colours.
              We’ll confirm the available options with you.
            </p>
            <LeadLink context={filter} className="birthday-button mt-5">
              Get a Custom Quote
            </LeadLink>
          </div>
        )}
        {filtered.length > limit && (
          <button
            className="birthday-button mt-8"
            onClick={() => setLimit((value) => value + 12)}
          >
            View More Birthday Decorations
          </button>
        )}
      </section>
      <section className="birthday-section" aria-labelledby="styles-heading">
        <h2 id="styles-heading" className="birthday-heading">
          Find a Birthday Decoration Style You Love
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {birthdayStyles.map((style) => (
            <a
              key={style}
              href="#decorations"
              onClick={() => choose(style)}
              className="rounded-2xl border border-border bg-muted px-5 py-4 text-sm font-semibold hover:border-primary"
            >
              {style} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
