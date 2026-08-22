import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, MapPin, StickyNote } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, STATUS_ORDER, type BookingStatus } from "../status-meta";
import { CancelBookingButton } from "./cancel-booking-button";
import type { Json } from "@/lib/supabase/types";
import { getBookingCustomizationDetails } from "@/lib/booking-customizations";

// Signed-in, per-user booking record — no organic value.
export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false, follow: true },
};

type AddOnSnapshot = { id: string; name: string; price: number };

function parseAddOns(json: Json): AddOnSnapshot[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as AddOnSnapshot[];
}

export default async function BookingDetailPage({
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

  const [{ data: booking }, { data: items }, { data: events }] =
    await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("booking_items")
        .select("*")
        .eq("booking_id", id)
        .order("created_at"),
      supabase
        .from("booking_status_events")
        .select("status, created_at")
        .eq("booking_id", id)
        .order("created_at"),
    ]);

  if (!booking) notFound();

  const status = STATUS_META[booking.status];
  const reachedAt = new Map<BookingStatus, string>();
  for (const e of events ?? [])
    if (!reachedAt.has(e.status)) reachedAt.set(e.status, e.created_at);

  const isCancelled = booking.status === "cancelled";
  const currentIndex = STATUS_ORDER.indexOf(
    booking.status as (typeof STATUS_ORDER)[number],
  );

  return (
    <div className="min-h-dvh bg-background pb-16">
      <TopBar />
      <main className="mx-auto max-w-md px-5 py-6 md:max-w-2xl">
        <Link
          href="/bookings"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> My bookings
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              Booking
            </p>
            <h1 className="mt-1 font-display text-3xl">
              #{booking.order_code}
            </h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${status.badgeClass}`}
          >
            {status.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {status.description}
        </p>

        <a
          href={`/bookings/${booking.id}/estimate`}
          download
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold shadow-card"
        >
          <Download className="h-3.5 w-3.5" /> Download estimate (PDF)
        </a>

        {/* Status timeline */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold">Status</h2>
          {isCancelled ? (
            <Timeline
              steps={[
                { label: "Pending", done: true, at: reachedAt.get("pending") },
                {
                  label: "Cancelled",
                  done: true,
                  at: reachedAt.get("cancelled"),
                  destructive: true,
                },
              ]}
            />
          ) : (
            <Timeline
              steps={STATUS_ORDER.map((s, i) => ({
                label: STATUS_META[s].label,
                done: i <= currentIndex,
                at: reachedAt.get(s),
              }))}
            />
          )}
        </section>

        {/* Items */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
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
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    ₹
                    {(
                      (Number(it.unit_price) +
                        addOns.reduce((s, a) => s + a.price, 0)) *
                      it.quantity
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm font-bold">Total</p>
            <p className="text-lg font-black text-gradient-brand">
              ₹{Number(booking.total).toLocaleString("en-IN")}
            </p>
          </div>
        </section>

        {/* Event & venue */}
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

        {booking.status === "pending" && (
          <div className="mt-6">
            <CancelBookingButton bookingId={booking.id} />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              You can cancel free of charge until we confirm your booking.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Timeline({
  steps,
}: {
  steps: { label: string; done: boolean; at?: string; destructive?: boolean }[];
}) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                s.done
                  ? s.destructive
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-gradient-brand text-primary-foreground"
                  : "border-2 border-border bg-background"
              }`}
            >
              {s.done && <Check className="h-3.5 w-3.5" />}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`h-8 w-0.5 ${s.done ? "bg-primary/40" : "bg-border"}`}
              />
            )}
          </div>
          <div className={`pb-8 ${!s.done && "opacity-50"}`}>
            <p className="text-sm font-semibold">{s.label}</p>
            {s.at && (
              <p className="text-xs text-muted-foreground">
                {new Date(s.at).toLocaleString(undefined, {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
