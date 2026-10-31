import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { CatalogImage } from "@/components/CatalogImage";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LeadLink } from "@/components/birthday/LeadLink";
import { getBirthdayDesigns } from "@/components/birthday/catalog";
import { siteImage } from "@/data/images";
import { publicPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  serviceLandingPages,
  serviceLandingHref,
} from "@/components/service-landing-pages";
import "../../birthday-decoration-bangalore/birthday.css";

type Props = { params: Promise<{ service: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return serviceLandingPages.map(page => ({ service: page.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const page = serviceLandingPages.find(page => page.slug === service);
  if (!page) notFound();
  const title = `${page.keyword} | DecorEventz`;
  return { ...publicPageMetadata(title, page.description, `https://decoreventz.com${serviceLandingHref(page.label)}`), title: { absolute: title } };
}

export default async function ServiceLandingPage({ params }: Props) {
  const { service } = await params;
  const page = serviceLandingPages.find(page => page.slug === service);
  if (!page) notFound();
  // The existing public catalogue is currently birthday-heavy. It is used as
  // visual inspiration until dedicated service photos are added in Supabase.
  const designs = await getBirthdayDesigns();
  const matching = designs.filter(design => page.terms.some(term => design.search.includes(term)));
  const photos = matching.length ? matching : designs.filter(design => design.image);
  const hero = photos[0];
  const url = `https://decoreventz.com${serviceLandingHref(page.label)}`;
  const faqs = [
    { question: `How much does ${page.label.toLowerCase()} cost in Bangalore?`, answer: "The quote depends on the venue, size of the setup, materials, personalization and access requirements. Share your event date, location, preferred style and budget with DecorEventz to discuss the available options." },
    { question: `Do you provide ${page.label.toLowerCase()} at home in Bangalore?`, answer: "Share your home address, event date, space photographs and access details. DecorEventz will discuss a setup suitable for the location and confirm availability before you book." },
    { question: "Can I share an inspiration image?", answer: "Yes. Send a reference image through WhatsApp with your event date, Bangalore venue address and preferred colours. The team will discuss what can be adapted for your space and the final included elements." },
    { question: "Can the decoration be customized?", answer: "Discuss your preferred colours, event message, backdrop and decorative priorities with the team. The final customization options and included elements are confirmed in the quotation." },
    { question: "How early should I enquire about decoration?", answer: "Advance planning is recommended, especially for customized details or venue coordination. Share your event date with DecorEventz to confirm availability and setup requirements." },
    { question: "How do I confirm availability?", answer: "Send your event date, Bangalore location and setup requirements. DecorEventz will confirm service availability and any practical venue details before you finalize the decoration." },
  ];
  return <div className="birthday-page min-h-dvh bg-background pb-24 md:pb-0"><TopBar /><JsonLd data={[{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: page.keyword, item: url }] }, { "@context": "https://schema.org", "@type": "Service", name: page.keyword, serviceType: page.keyword, description: page.description, url, areaServed: { "@type": "City", name: "Bengaluru" }, provider: { "@id": `${SITE_URL}/#organization` } }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }]} /><main className="mx-auto max-w-[1440px] px-5 md:px-12 xl:px-16"><nav aria-label="Breadcrumb" className="pt-6 text-xs text-muted-foreground"><Link href="/">Home</Link><span className="mx-2">›</span><span aria-current="page">{page.label}</span></nav><section className="grid items-center gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 md:py-14"><div><p className="birthday-eyebrow">Decor Eventz · Bangalore</p><h1 className="mt-4 font-display text-[2.5rem] leading-[1.08] sm:text-5xl">{page.keyword}</h1><p className="birthday-copy">{page.intro}</p><div className="mt-6 flex gap-3"><a href="#ideas" className="birthday-button">Explore Ideas</a><LeadLink context={page.keyword} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-primary px-5 text-sm font-bold"><WhatsAppIcon className="h-5 w-5" />WhatsApp</LeadLink></div></div><div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-elevated"><CatalogImage src={hero?.image || siteImage("balloonArch")} alt={hero?.name || "Event decoration arrangement"} fill preload sizes="(max-width:768px) 90vw,42vw" className="object-cover" /></div></section><section id="ideas" className="birthday-section scroll-mt-28"><p className="birthday-eyebrow">Visual inspiration</p><h2 className="birthday-heading">Decoration Ideas for Your Event</h2><p className="birthday-copy">Browse available decoration inspiration, then share your preferred look, space and event details to discuss a tailored arrangement.</p><div className="mt-7 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3">{photos.slice(0, 6).map(design => <article key={design.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"><div className="relative aspect-[4/3]"><CatalogImage src={design.image || siteImage("balloonArch")} alt={design.image ? design.name : "Event decoration arrangement"} fill sizes="(max-width:480px) 90vw,(max-width:1024px) 45vw,30vw" className="object-cover" /></div><div className="p-5"><h3 className="text-lg font-semibold">{design.name}</h3><p className="mt-2 text-sm text-muted-foreground">{design.description}</p><LeadLink context={`${page.keyword}: ${design.name}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold"><WhatsAppIcon className="h-5 w-5" />Get Quote</LeadLink></div></article>)}</div></section><section className="birthday-section"><p className="birthday-eyebrow">Plan with confidence</p><h2 className="birthday-heading">Planning Your {page.label}</h2><div className="mt-8 grid gap-8 lg:grid-cols-3">{page.sections.map(([title, copy]) => <article key={title}><h3 className="font-display text-2xl">{title}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p></article>)}</div></section><section className="birthday-section grid gap-8 rounded-[2rem] bg-muted p-6 md:grid-cols-2 md:p-10"><div><h2 className="birthday-heading">What to Share for Your Quote</h2><p className="birthday-copy">These details help us discuss a practical design for your event and venue.</p><LeadLink context={page.keyword} className="birthday-button mt-6">Get Free Quote</LeadLink></div><ul className="space-y-3 self-center">{page.checklist.map(item => <li key={item} className="flex gap-3 rounded-2xl bg-card p-4 text-sm"><Check className="h-5 w-5 shrink-0 text-accent" />{item}</li>)}</ul></section><section className="birthday-section"><h2 className="birthday-heading">{page.label} FAQs</h2><div className="mt-7 divide-y divide-border border-y border-border">{faqs.map(faq => <details key={faq.question} className="py-5"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{faq.answer}</p></details>)}</div></section><section className="birthday-section"><h2 className="birthday-heading">Explore More Decoration Services</h2><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{serviceLandingPages.filter(item => item.slug !== service).map(item => <Link key={item.slug} href={serviceLandingHref(item.label)} className="rounded-2xl border border-border bg-card p-5 text-sm font-semibold hover:bg-muted">{item.label} ↗</Link>)}</div></section><section className="birthday-section rounded-[2rem] bg-primary p-7 text-primary-foreground md:p-12"><h2 className="birthday-heading">Let’s Plan Your Event</h2><p className="mt-4 max-w-xl text-primary-foreground/85">Share your event date, Bangalore venue and favourite decoration idea. We’ll help you discuss an arrangement that fits your celebration.</p><div className="mt-6 flex flex-wrap gap-3"><LeadLink context={page.keyword} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary"><WhatsAppIcon className="h-5 w-5" />WhatsApp DecorEventz</LeadLink><LeadLink quote context={page.keyword} className="rounded-full border border-white/50 px-6 py-3.5 text-sm font-bold">Get Free Quote</LeadLink></div></section></main><Footer /></div>;
}
