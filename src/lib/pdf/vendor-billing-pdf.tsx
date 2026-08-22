import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { VendorBillingDocument, type VendorBillingLineItem } from "./vendor-billing-document";
import type { Database, Json } from "@/lib/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];

function parseQuoteItems(json: Json): VendorBillingLineItem[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as VendorBillingLineItem[];
}

/** Shared by the quote-pdf and invoice-pdf routes — same document, just a
 * different mode/total/paid-stamp depending on which one is downloading. */
export async function renderVendorBillingPdf(
  booking: BookingRow,
  vendor: VendorRow,
  mode: "quote" | "invoice",
): Promise<Buffer> {
  const logoBuffer = await readFile(join(process.cwd(), "src/assets/decor-eventz-logo.webp"));
  const logoSrc = `data:image/webp;base64,${logoBuffer.toString("base64")}`;

  const items = parseQuoteItems(booking.vendor_quote_items);
  const total = mode === "invoice" ? Number(booking.vendor_bill_amount ?? booking.vendor_quote_amount ?? 0) : Number(booking.vendor_quote_amount ?? 0);

  return renderToBuffer(
    <VendorBillingDocument
      logoSrc={logoSrc}
      data={{
        mode,
        orderCode: booking.order_code,
        eventDate: booking.event_date,
        eventTime: booking.event_time,
        venueName: booking.venue_name,
        venueLine1: booking.venue_line1,
        venueLine2: booking.venue_line2,
        venueCity: booking.venue_city,
        venuePincode: booking.venue_pincode,
        vendorBusinessName: vendor.business_name,
        vendorContactName: vendor.contact_name,
        vendorPhone: vendor.phone,
        items,
        total,
        paidAt: booking.vendor_paid_at,
      }}
    />,
  );
}
