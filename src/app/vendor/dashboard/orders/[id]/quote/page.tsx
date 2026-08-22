import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteBuilder, type QuoteLineItem } from "./quote-builder";
import type { Json } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Build quote | Decor Eventz Vendor Portal", robots: { index: false, follow: false } };

type AddOnSnapshot = { id: string; name: string; price: number };

function parseAddOns(json: Json): AddOnSnapshot[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as AddOnSnapshot[];
}

function parseQuoteItems(json: Json): QuoteLineItem[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as QuoteLineItem[];
}

export default async function VendorQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: booking }, { data: items }] = await Promise.all([
    supabase.from("bookings").select("*").eq("id", id).maybeSingle(),
    supabase.from("booking_items").select("*").eq("booking_id", id).order("created_at"),
  ]);
  if (!booking) notFound();
  if (!booking.vendor_accepted_at) notFound();

  const existingItems = parseQuoteItems(booking.vendor_quote_items);
  const baseItems: QuoteLineItem[] = (items ?? []).map((it) => {
    const addOns = parseAddOns(it.addons);
    const addOnTotal = addOns.reduce((s, a) => s + a.price, 0);
    const description = addOns.length
      ? `${it.service_name} (+ ${addOns.map((a) => a.name).join(", ")})`
      : it.service_name;
    return {
      description,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price) + addOnTotal,
    };
  });

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href={`/vendor/dashboard/orders/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> #{booking.order_code}
      </Link>

      <h1 className="mb-1 font-display text-3xl">Build your quote</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Starts from what was booked — adjust prices or add anything extra you&apos;re charging for.
      </p>

      <QuoteBuilder
        bookingId={booking.id}
        initialItems={existingItems.length ? existingItems : baseItems}
        readOnly={booking.vendor_payment_status === "paid"}
      />
    </section>
  );
}
