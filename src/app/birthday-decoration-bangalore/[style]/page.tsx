import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { CatalogImage } from "@/components/CatalogImage";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BirthdayHeroActions } from "@/components/birthday/BirthdayHeroActions";
import { LeadLink } from "@/components/birthday/LeadLink";
import { getBirthdayDesigns } from "@/components/birthday/catalog";
import {
  birthdayLandingPages,
  birthdayLandingHref,
  BIRTHDAY_PATH,
} from "@/components/birthday/landing-pages";
import { siteImage } from "@/data/images";
import { publicPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "../birthday.css";

type Props = { params: Promise<{ style: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return birthdayLandingPages.map((page) => ({ style: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { style } = await params;
  const page = birthdayLandingPages.find((page) => page.slug === style);
  if (!page) notFound();
  const title = `${page.keyword} | DecorEventz`;
  const metadata = publicPageMetadata(
    title,
    page.description,
    `https://decoreventz.com${birthdayLandingHref(page.label)}`,
  );
  return { ...metadata, title: { absolute: title } };
}

export default async function BirthdayStylePage({ params }: Props) {
  const { style } = await params;
  const page = birthdayLandingPages.find((page) => page.slug === style);
  if (!page) notFound();
  const designs = await getBirthdayDesigns();
  const matching = designs.filter((design) =>
    page.terms.some((term) => design.search.includes(term)),
  );
  const selections = matching.length ? matching : designs;
  const hero = selections.find((design) => design.image);
  const url = `https://decoreventz.com${birthdayLandingHref(page.label)}`;
  const faqs = [
    page.faq,
    {
      question: "How much does this birthday decoration cost in Bangalore?",
      answer:
        "Your quote depends on the decoration dimensions, materials, personalization and venue setup requirements. Share your event date, address, budget and reference images so DecorEventz can confirm the available options and an agreed quote.",
    },
    {
      question: "How do I check availability for my Bangalore venue?",
      answer:
        "Send your event date, venue address and setup access details through WhatsApp or the contact form. The team will confirm location coverage and availability before you finalize the decoration.",
    },
    {
      question: "Can I share a reference photo before booking?",
      answer:
        "Yes. Send your inspiration photos on WhatsApp and explain which colours or decorative details you prefer. DecorEventz will discuss what can be adapted to your space and confirm the final included elements.",
    },
  ];
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
                item: `https://decoreventz.com${BIRTHDAY_PATH}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: page.keyword,
                item: url,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: page.keyword,
            description: page.description,
            url,
            serviceType: page.keyword,
            areaServed: { "@type": "City", name: "Bengaluru" },
            provider: { "@id": `${SITE_URL}/#organization` },
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
          className="flex flex-wrap gap-x-2 gap-y-1 pt-6 text-xs leading-6 text-muted-foreground"
        >
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={BIRTHDAY_PATH}>Birthday Decoration in Bangalore</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{page.label}</span>
        </nav>
        <section
          className="grid items-center gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 md:py-14"
          aria-labelledby="style-title"
        >
          <div>
            <p className="birthday-eyebrow">Your celebration, your style</p>
            <h1
              id="style-title"
              className="mt-4 font-display text-[2.5rem] leading-[1.08] sm:text-5xl xl:text-6xl"
            >
              {page.keyword}
            </h1>
            <p className="birthday-copy">{page.intro}</p>
            <BirthdayHeroActions context={page.keyword} />
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              Discuss your theme · Confirm venue availability · Get a custom
              quote
            </p>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-elevated">
            <CatalogImage
              src={hero?.image || siteImage("balloonArch")}
              alt={hero?.name || "Decorative balloon arrangement"}
              fill
              preload
              sizes="(max-width: 768px) 90vw, 42vw"
              className="object-cover"
            />
          </div>
        </section>
        <section
          id="decorations"
          className="birthday-section scroll-mt-28"
          aria-labelledby="designs-heading"
        >
          <p className="birthday-eyebrow">Ideas for your celebration</p>
          <h2 id="designs-heading" className="birthday-heading">
            {matching.length
              ? `${page.label} Ideas`
              : "More Birthday Decoration Inspiration"}
          </h2>
          <p className="birthday-copy">
            Explore designs from the birthday catalogue and share your favourite
            with the team. Colours, dimensions and the final included elements
            are confirmed for your venue and date.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {selections.slice(0, 6).map((design) => (
              <article
                key={design.id}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
              >
                <Link
                  href={design.href}
                  className="relative block aspect-[4/3]"
                >
                  <CatalogImage
                    src={design.image || siteImage("balloonArch")}
                    alt={
                      design.image
                        ? design.name
                        : "Decorative balloon arrangement"
                    }
                    fill
                    sizes="(max-width: 480px) 90vw, (max-width: 1024px) 44vw, 29vw"
                    className="object-cover"
                  />
                </Link>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">
                    <Link href={design.href}>{design.name}</Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {design.description}
                  </p>
                  <LeadLink
                    context={`${page.keyword}: ${design.name}`}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Get Quote
                  </LeadLink>
                </div>
              </article>
            ))}
          </div>
          {!selections.length && (
            <LeadLink context={page.keyword} className="birthday-button mt-6">
              Discuss a Custom Decoration
            </LeadLink>
          )}
        </section>
        <section
          className="birthday-section"
          aria-labelledby="planning-heading"
        >
          <p className="birthday-eyebrow">
            Thoughtful details, better planning
          </p>
          <h2 id="planning-heading" className="birthday-heading">
            Planning Your {page.keyword}
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {page.sections.map((section) => (
              <article key={section.title}>
                <h3 className="font-display text-2xl leading-tight">
                  {section.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="birthday-section grid gap-8 rounded-[2rem] bg-muted p-6 md:grid-cols-2 md:p-10"
          aria-labelledby="details-heading"
        >
          <div>
            <h2 id="details-heading" className="birthday-heading">
              What to Share for Your Decoration Quote
            </h2>
            <p className="birthday-copy">
              A few practical details help us discuss the right scale, materials
              and access arrangements for your celebration.
            </p>
            <LeadLink
              quote
              context={page.keyword}
              className="birthday-button mt-6"
            >
              Get Free Quote
            </LeadLink>
          </div>
          <ul className="space-y-4 self-center">
            {page.checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 text-sm"
              >
                <Check
                  className="h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="birthday-section" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="birthday-heading">
            {page.label} FAQs
          </h2>
          <div className="mt-7 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="py-5">
                <summary className="cursor-pointer font-semibold">
                  {faq.question}
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="birthday-section" aria-labelledby="related-heading">
          <h2 id="related-heading" className="birthday-heading">
            Explore More Birthday Decoration Styles
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {birthdayLandingPages
              .filter((item) => item.slug !== style)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={birthdayLandingHref(item.label)}
                  className="rounded-2xl border border-border bg-card p-5 text-sm font-semibold hover:bg-muted"
                >
                  {item.label} <span aria-hidden="true">↗</span>
                </Link>
              ))}
          </div>
          <Link
            href={BIRTHDAY_PATH}
            className="mt-6 inline-block text-sm font-bold underline underline-offset-4"
          >
            All birthday decorations in Bangalore
          </Link>
        </section>
        <section className="birthday-section rounded-[2rem] bg-primary p-7 text-primary-foreground md:p-12">
          <h2 className="birthday-heading">
            Let’s Plan Your Birthday Decoration
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-primary-foreground/85">
            Share your Bangalore location, event date and favourite idea. We’ll
            discuss the options and confirm a quote for your celebration.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LeadLink
              context={page.keyword}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp DecorEventz
            </LeadLink>
            <LeadLink
              quote
              context={page.keyword}
              className="rounded-full border border-white/50 px-6 py-3.5 text-sm font-bold"
            >
              Get Free Quote
            </LeadLink>
          </div>
        </section>
      </main>
      <Footer />
      <aside
        aria-label="Birthday decoration enquiry"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-border bg-background/95 px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        <LeadLink
          context={page.keyword}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary text-sm font-bold"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </LeadLink>
        <LeadLink
          quote
          context={page.keyword}
          className="birthday-button flex-1"
        >
          Get Free Quote
        </LeadLink>
      </aside>
    </div>
  );
}
