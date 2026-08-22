import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderVendorBillingPdf } from "@/lib/pdf/vendor-billing-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: vendor } = await supabase.from("vendors").select("*").eq("user_id", user.id).maybeSingle();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.vendor_payment_status !== "paid") {
    return NextResponse.json({ error: "This order isn't marked as paid yet" }, { status: 400 });
  }

  const buffer = await renderVendorBillingPdf(booking, vendor, "invoice");

  return new NextResponse(Uint8Array.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${booking.order_code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
