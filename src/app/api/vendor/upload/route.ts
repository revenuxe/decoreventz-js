import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_BUCKET, bookingImageUrl } from "@/lib/supabase/storage";
import { detectedImageMimeType, MAX_IMAGE_UPLOAD_BYTES, sanitizeFileName } from "@/lib/image-sniff";

export const runtime = "nodejs";

// Unlike api/upload/route.ts (admin-only, trusts any pathPrefix an admin
// supplies), this route builds the storage path itself from a booking id it has
// independently verified belongs to the calling vendor — a vendor never
// gets to name their own upload path.
async function requireVendorForBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();
  if (!vendor) return null;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("assigned_vendor_id", vendor.id)
    .maybeSingle();
  if (!booking) return null;

  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const bookingId = form.get("bookingId");
    const kind = form.get("kind");

    if (!(file instanceof File) || typeof bookingId !== "string" || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
      return NextResponse.json({ error: "Missing file or bookingId" }, { status: 400 });
    }
    if (kind !== "decoration" && kind !== "team") {
      return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 400 });
    }

    const supabase = await requireVendorForBooking(bookingId);
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = detectedImageMimeType(buffer);
    if (!contentType) {
      return NextResponse.json(
        { error: `"${file.name}" doesn't look like a valid image — try saving the photo again` },
        { status: 400 },
      );
    }

    const key = `bookings/${bookingId}/${kind}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from(BOOKING_BUCKET).upload(key, buffer, {
      contentType, cacheControl: "0", upsert: false,
    });
    if (error) throw error;
    return NextResponse.json({ url: bookingImageUrl(key) });
  } catch (err) {
    console.error("[api/vendor/upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
