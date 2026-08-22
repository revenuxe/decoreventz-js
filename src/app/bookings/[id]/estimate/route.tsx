import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META } from "../../status-meta";
import { BookingEstimateDocument, type BookingEstimateItem } from "@/lib/pdf/booking-estimate-document";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";

type AddOnSnapshot = { id: string; name: string; price: number };

function parseAddOns(json: Json): AddOnSnapshot[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as AddOnSnapshot[];
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // No .eq("user_id", ...) filter here — same as bookings/[id]/page.tsx,
  // this relies on the bookings table's RLS policy to scope rows to the
  // signed-in user, so a foreign booking id resolves to no row rather than
  // someone else's data.
  const [{ data: booking }, { data: items }] = await Promise.all([
    supabase.from("bookings").select("*").eq("id", id).maybeSingle(),
    supabase.from("booking_items").select("*").eq("booking_id", id).order("created_at"),
  ]);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logoBuffer = await readFile(join(process.cwd(), "src/assets/decor-eventz-logo.webp"));
  const logoSrc = `data:image/webp;base64,${logoBuffer.toString("base64")}`;

  const estimateItems: BookingEstimateItem[] = (items ?? []).map((it) => ({
    serviceName: it.service_name,
    quantity: it.quantity,
    unitPrice: Number(it.unit_price),
    addOns: parseAddOns(it.addons).map((a) => ({ name: a.name, price: a.price })),
  }));

  const buffer = await renderToBuffer(
    <BookingEstimateDocument
      logoSrc={logoSrc}
      data={{
        orderCode: booking.order_code,
        createdAt: booking.created_at,
        eventDate: booking.event_date,
        eventTime: booking.event_time,
        statusLabel: STATUS_META[booking.status].label,
        venueName: booking.venue_name,
        venueLine1: booking.venue_line1,
        venueLine2: booking.venue_line2,
        venueCity: booking.venue_city,
        venuePincode: booking.venue_pincode,
        venuePhone: booking.venue_phone,
        notes: booking.notes,
        total: Number(booking.total),
        items: estimateItems,
      }}
    />,
  );

  return new NextResponse(Uint8Array.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Decor-Eventz-Estimate-${booking.order_code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
