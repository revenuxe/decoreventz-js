import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";
import { getS3Client, getS3Config } from "@/lib/s3";
import { s3PublicUrl } from "@/lib/s3-url";
import { detectedImageMimeType, MAX_IMAGE_UPLOAD_BYTES, sanitizeFileName } from "@/lib/image-sniff";

export const runtime = "nodejs";

// Unlike api/upload/route.ts (admin-only, trusts any pathPrefix an admin
// supplies), this route builds the S3 key itself from a booking id it has
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

  return vendor;
}

export async function POST(request: NextRequest) {
  // Every path out of this handler must be JSON, even on an unexpected
  // throw (e.g. missing/invalid AWS credentials) — otherwise Vercel's
  // platform-level 500 page (HTML) reaches the client and breaks
  // `res.json()` there with a confusing "Unexpected token '<'" instead of
  // a real error message.
  try {
    const form = await request.formData();
    const file = form.get("file");
    const bookingId = form.get("bookingId");
    const kind = form.get("kind");

    if (!(file instanceof File) || typeof bookingId !== "string" || !bookingId) {
      return NextResponse.json({ error: "Missing file or bookingId" }, { status: 400 });
    }
    if (kind !== "decoration" && kind !== "team") {
      return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Images must be 10 MB or smaller." }, { status: 400 });
    }

    const vendor = await requireVendorForBooking(bookingId);
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = detectedImageMimeType(buffer);
    if (!contentType) {
      return NextResponse.json(
        { error: `"${file.name}" doesn't look like a valid image — try saving the photo again` },
        { status: 400 },
      );
    }

    const key = `bookings/${bookingId}/${kind}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { bucketName } = getS3Config();
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "private, max-age=31536000, immutable",
        ContentDisposition: "inline",
      }),
    );

    return NextResponse.json({ url: s3PublicUrl(key) });
  } catch (err) {
    console.error("[api/vendor/upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
