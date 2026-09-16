import type { Metadata } from "next";
import Link from "next/link";
import { CatalogImage as Image } from "@/components/CatalogImage";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META } from "@/app/bookings/status-meta";
import { VendorOrderActions } from "./vendor-order-actions";
import type { Database, Json } from "@/lib/supabase/types";
import { getBookingCustomizationDetails } from "@/lib/booking-customizations";

export const metadata: Metadata = {
  title: "Order details | Decor Eventz Vendor Portal",
  robots: { index: false, follow: false },
};

type AddOnSnapshot = { id: string; name: string; price: number };

// STATUS_META's copy is written for the customer (e.g. "a decorator will be
// assigned soon") — this vendor IS the decorator, so it needs its own take
// on what each status means from their side.
const VENDOR_STATUS_DESCRIPTION: Record<
  Database["public"]["Enums"]["booking_status"],
  string
> = {
  pending: "Confirm the order below once you're ready to take it on.",
  confirmed: "Start preparing when you begin setting up.",
  preparing:
    "In progress — mark it completed once the decoration and team photos are uploaded.",
  completed: "This order is complete.",
  cancelled: "This order was cancelled.",
};

function parseAddOns(json: Json): AddOnSnapshot[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as AddOnSnapshot[];
}

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Scoped by the "Vendors read assigned bookings" RLS policy — this
  // resolves to no row at all if the booking isn't assigned to this vendor.
  const [{ data: booking }, { data: items }] = await Promise.all([
    supabase.from("bookings").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("booking_items")
      .select("*")
      .eq("booking_id", id)
      .order("created_at"),
  ]);
  if (!booking) notFound();

  const status = STATUS_META[booking.status];

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href="/vendor/dashboard/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Assigned orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">#{booking.order_code}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${status.badgeClass}`}
        >
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {VENDOR_STATUS_DESCRIPTION[booking.status]}
      </p>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Decorations</h2>
        <div className="space-y-3">
          {(items ?? []).map((it) => {
            const addOns = parseAddOns(it.addons);
            const balloon = getBookingCustomizationDetails(
              it.customizations,
            ).balloon;
            return (
              <div key={it.id} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {it.image && (
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {it.service_name} {it.quantity > 1 && `× ${it.quantity}`}
                  </p>
                  {addOns.length > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {addOns.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  {balloon && (
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {balloon.kind === "custom"
                        ? "Custom balloons"
                        : "Balloon palette"}
                      : {balloon.label}
                      {balloon.colors.length > 0 &&
                        ` (${balloon.colors.join(", ")})`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Event details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event
            </span>
            <span className="text-right font-semibold">
              {new Date(booking.event_date).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}{" "}
              · {booking.event_time}
            </span>
          </div>
          <div className="flex items-start gap-2.5 border-t border-border/60 pt-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p>
              {booking.venue_name && (
                <span className="font-semibold">{booking.venue_name}, </span>
              )}
              {booking.venue_line1}
              {booking.venue_line2 ? `, ${booking.venue_line2}` : ""},{" "}
              {booking.venue_city} — {booking.venue_pincode}
              <br />
              <span className="text-muted-foreground">
                {booking.venue_phone}
              </span>
            </p>
          </div>
          {booking.notes && (
            <div className="flex items-start gap-2.5 border-t border-border/60 pt-3">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">{booking.notes}</p>
            </div>
          )}
        </div>
      </section>

      <VendorOrderActions
        bookingId={booking.id}
        status={booking.status}
        acceptedAt={booking.vendor_accepted_at}
        decorationImageUrl={booking.decoration_image_url}
        teamImageUrl={booking.team_image_url}
        quoteAmount={booking.vendor_quote_amount}
        billAmount={booking.vendor_bill_amount}
        paymentStatus={booking.vendor_payment_status}
        paidAmount={booking.vendor_paid_amount}
      />
    </section>
  );
}
