"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Download, Truck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT } from "@/lib/site";

export function Success({ orderId, bookingId }: { orderId: string; bookingId: string }) {
  const router = useRouter();
  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 py-16 text-center md:max-w-lg">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow">
          <Check className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Event decoration booked</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your reference number is</p>
        <p className="mt-1 text-xl font-black tracking-widest text-gradient-brand">#{orderId}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          We&apos;ll WhatsApp you a confirmation and reach out before your setup window.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href={`/bookings/${bookingId}/estimate`}
            download
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-sm font-bold shadow-card"
          >
            <Download className="h-4 w-4" /> Download estimate (PDF)
          </a>
          <p className="!mt-1.5 text-[11px] text-muted-foreground">
            This is an estimate, not your final invoice.
          </p>
          <a
            href={CONTACT.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
          </a>
          <button
            onClick={() => router.push("/bookings")}
            className="w-full rounded-full border border-border bg-card px-6 py-4 text-sm font-bold"
          >
            View my bookings
          </button>
          <button
            onClick={() => router.push("/categories")}
            className="w-full py-2 text-xs font-semibold text-muted-foreground"
          >
            Browse more decorations
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-1 py-2 text-xs font-semibold text-muted-foreground"
          >
            Back to home <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Truck className="h-4 w-4" /> Free venue visit · No payment now
        </div>
      </main>
    </div>
  );
}
