import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, MessageCircleQuestion, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = { title: "Support", description: "Get booking support from Decor Eventz.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <div className="min-h-dvh bg-background pb-24"><JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Support", path: "/contact" }])} /><TopBar /><main className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8"><Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link><p className="mt-10 text-xs font-bold uppercase tracking-widest text-accent">Decor Eventz support</p><h1 className="mt-2 font-display text-4xl leading-tight text-primary md:text-5xl">How can we help?</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">Use your booking or browse our collection to continue planning your celebration.</p><div className="mt-8 grid gap-4 md:grid-cols-2"><Link href="/bookings" className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5"><CalendarCheck className="h-7 w-7 text-accent" /><h2 className="mt-5 text-lg font-bold text-primary">Manage a booking</h2><p className="mt-2 text-sm text-muted-foreground">View your booking details, updates, and requests.</p></Link><Link href="/categories" className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5"><MessageCircleQuestion className="h-7 w-7 text-accent" /><h2 className="mt-5 text-lg font-bold text-primary">Plan a celebration</h2><p className="mt-2 text-sm text-muted-foreground">Explore decoration styles and create your booking.</p></Link></div><Link href="/categories" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"><Sparkles className="h-4 w-4" /> Browse decorations</Link></main><BottomNav /></div>;
}
