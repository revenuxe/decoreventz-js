"use client";

import Link from "next/link";
import { useMegaMenuData } from "@/lib/use-mega-menu-data";
import { birthdayLandingHref } from "@/components/birthday/navigation";
import { serviceLandingHref } from "@/components/service-landing-pages";

const services = [
  { name: "Birthday Decoration", pattern: /birthday/i },
  { name: "Kids Birthday Decoration", pattern: /kids|children/i },
  { name: "Balloon Decoration", pattern: /balloon/i },
  { name: "Baby Shower Decoration", pattern: /baby.shower/i },
  { name: "Anniversary Decoration", pattern: /anniversary/i },
  { name: "Wedding Decoration", pattern: /wedding/i },
  { name: "Engagement Decoration", pattern: /engagement/i },
  { name: "Corporate Event Decoration", pattern: /corporate/i },
];

export function FooterServices() {
  const { categories, subcategories, products } = useMegaMenuData(true);
  return (
    <nav
      aria-label="Decoration Services"
      className="mt-8 border-t border-border pt-6"
    >
      <h2 className="font-display text-xl">Decoration Services</h2>
      <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-xs leading-5 md:grid-cols-4">
        {services.map((service, index) => {
          const category = categories.find(
            (item) =>
              service.pattern.test(`${item.slug} ${item.name}`) &&
              products.some((product) => product.categorySlug === item.slug),
          );
          const subcategory = subcategories.find(
            (item) =>
              service.pattern.test(`${item.slug} ${item.name}`) &&
              categories.some((parent) => parent.slug === item.categorySlug) &&
              products.some(
                (product) =>
                  product.categorySlug === item.categorySlug &&
                  product.subcategorySlug === item.slug,
              ),
          );
          const href =
            index === 0
              ? "/birthday-decoration-bangalore"
              : index === 1
                ? birthdayLandingHref("Kids Birthday")
                : index === 2
                  ? birthdayLandingHref("Balloon Decoration")
                  : index > 2
                    ? serviceLandingHref(service.name)
                  : category
                    ? `/categories/${category.slug}`
                    : subcategory
                      ? `/categories/${subcategory.categorySlug}/sub/${subcategory.slug}`
                      : undefined;
          return (
            <li key={service.name}>
              {href ? (
                <Link href={href} className="hover:text-accent">
                  {service.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">{service.name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
