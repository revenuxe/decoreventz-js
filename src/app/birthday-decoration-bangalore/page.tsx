import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { getBirthdayDesigns } from "@/components/birthday/catalog";
import { BirthdayHeroActions } from "@/components/birthday/BirthdayHeroActions";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { CatalogImage } from "@/components/CatalogImage";
import { JsonLd } from "@/components/JsonLd";
import { publicPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { LeadLink } from "@/components/birthday/LeadLink";
import { DecorationGallery } from "@/components/birthday/DecorationGallery";
import {
  HomeAndKidsSections,
  PricingAndBooking,
  TrustAndContent,
} from "@/components/birthday/BirthdaySections";
import { faqs } from "@/components/birthday/content";
import "./birthday.css";

const path = "/birthday-decoration-bangalore";
const canonical = `https://decoreventz.com${path}`;
const title =
  "Birthday Decoration in Bangalore | Home & Theme Decor | DecorEventz";
const description =
  "Looking for birthday decoration in Bangalore? Explore beautiful balloon, home, kids theme, room and premium birthday decorations by DecorEventz. Get a custom quote today.";
export const metadata: Metadata = {
  ...publicPageMetadata(title, description, canonical),
  title: { absolute: title },
};

export default async function BirthdayPage() {
  const designs = await getBirthdayDesigns();
  const hero = designs.find((design) => design.image);
  const supporting = designs
    .filter((design) => design.image && design.id !== hero?.id)
    .slice(0, 2);
  return (
    <div className="birthday-page min-h-dvh bg-background pb-24 md:pb-0">
      <TopBar />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Birthday Decoration in Bangalore",
                item: canonical,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Birthday Decoration in Bangalore",
            serviceType: "Birthday decoration",
            url: canonical,
            description,
            areaServed: { "@type": "City", name: "Bengaluru" },
            provider: {
              "@type": "Organization",
              name: "Decor Eventz",
              url: SITE_URL,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />
      <main className="mx-auto max-w-[1440px] px-5 md:px-12 xl:px-16">
        <nav
          aria-label="Breadcrumb"
          className="pt-6 text-xs leading-6 text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            ›
          </span>
          <span aria-current="page">Birthday Decoration in Bangalore</span>
        </nav>
        <section
          className="grid items-center gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 md:py-14"
          aria-labelledby="birthday-title"
        >
          <div>
            <p className="birthday-eyebrow">Birthday Decoration · Bangalore</p>
            <h1
              id="birthday-title"
              className="mt-4 font-display text-[2.5rem] leading-[1.08] sm:text-5xl xl:text-6xl"
            >
              Birthday Decoration in{" "}
              <span className="italic text-accent">Bangalore</span>
            </h1>
            <p className="birthday-copy">
              Beautiful birthday decorations for homes, apartments, party halls
              and venues across supported Bangalore locations. Explore balloon
              decorations, kids themes, room surprises, simple setups and
              premium birthday decor — customized for your celebration.
            </p>
            <p className="mt-5 text-xs leading-6 font-medium">
              Birthday at Home · Kids Themes · Balloon Decor · Room Surprise ·
              Premium Decor
            </p>
            <BirthdayHeroActions />
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {["Custom Themes", "Professional Setup", "Bangalore Service"].map(
                (point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <Check
                      size={14}
                      className="text-accent"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-elevated">
              {hero ? (
                <CatalogImage
                  src={hero.image}
                  alt={hero.name}
                  fill
                  preload
                  sizes="(max-width: 768px) 90vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-content-center gap-4 text-center text-primary/60">
                  <Sparkles className="mx-auto" size={48} aria-hidden="true" />
                  <p>Your birthday, beautifully imagined</p>
                </div>
              )}
            </div>
            <div className="relative mx-4 -mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              {supporting.map((design) => (
                <div
                  key={design.id}
                  className="relative hidden h-16 w-14 shrink-0 overflow-hidden rounded-xl lg:block"
                >
                  <CatalogImage
                    src={design.image}
                    alt={design.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ))}
              <div>
                <p className="font-semibold">Planning a Birthday?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell us your theme &amp; budget
                </p>
                <LeadLink
                  context="hero birthday ideas"
                  className="mt-2 inline-block text-sm font-bold text-primary"
                >
                  Get Ideas on WhatsApp →
                </LeadLink>
              </div>
            </div>
          </div>
        </section>
        <DecorationGallery designs={designs} />
        <HomeAndKidsSections designs={designs} />
        <PricingAndBooking />
        {designs.some((design) => design.image) && (
          <section
            className="birthday-section"
            aria-labelledby="gallery-heading"
          >
            <p className="birthday-eyebrow">A closer look</p>
            <h2 id="gallery-heading" className="birthday-heading">
              Birthday Decoration Gallery
            </h2>
            <p className="birthday-copy">
              Find inspiration in our birthday catalogue. Share your favourite
              design to discuss a setup for your celebration.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              {designs
                .filter((design) => design.image)
                .slice(0, 4)
                .map((design, i) => (
                  <Link
                    key={design.id}
                    href={design.href}
                    className={`group relative overflow-hidden rounded-2xl bg-muted ${i % 2 ? "aspect-[4/5] md:mt-8" : "aspect-[4/5]"}`}
                  >
                    <CatalogImage
                      src={design.image}
                      alt={design.name}
                      fill
                      sizes="(max-width: 768px) 44vw, 22vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-primary/90 p-3 text-xs font-semibold text-primary-foreground">
                      {design.name}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}
        <TrustAndContent />
        <section
          className="birthday-section rounded-[2rem] bg-primary p-7 text-primary-foreground md:p-12"
          aria-labelledby="final-heading"
        >
          <h2 id="final-heading" className="birthday-heading">
            Planning a Birthday in Bangalore?
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-primary-foreground/85">
            Tell us your event date, location and decoration idea. We’ll help
            you plan a birthday setup that fits your celebration.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LeadLink
              quote
              context="final quote"
              className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary"
            >
              Get Free Decoration Quote
            </LeadLink>
            <LeadLink
              context="final birthday enquiry"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3.5 text-sm font-bold"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp DecorEventz
            </LeadLink>
          </div>
          <p className="mt-6 text-xs text-primary-foreground/80">
            Share your idea · Customize your setup · Get a quote
          </p>
          <Link
            href="/categories"
            className="mt-5 inline-block text-sm underline underline-offset-4"
          >
            Explore all decoration services
          </Link>
        </section>
      </main>
      <Footer />
      <aside
        aria-label="Birthday decoration enquiry"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-border bg-background/95 px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        <LeadLink
          context="mobile WhatsApp"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary text-sm font-bold"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </LeadLink>
        <LeadLink
          quote
          context="mobile quote"
          className="birthday-button flex-1"
        >
          Get Free Quote
        </LeadLink>
      </aside>
    </div>
  );
}
