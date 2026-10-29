import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_BUCKET, catalogKeyFromUrl } from "@/lib/supabase/storage";
import { MAX_IMAGE_UPLOAD_BYTES, sanitizeObjectPrefix } from "@/lib/image-sniff";
import { ImageOptimizationError, optimizeImage, webpFileName } from "@/lib/optimize-image";

export const runtime = "nodejs";

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return !error && data ? supabase : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await adminClient();
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    const prefix = form.get("pathPrefix");
    const path = typeof prefix === "string" ? sanitizeObjectPrefix(prefix) : null;
    if (!(file instanceof File) || !path || !/^(products|categories|subcategories|homepage-hero)\//.test(path)) {
      return NextResponse.json({ error: "Missing file or invalid catalog path" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImage(buffer, path);
    const key = `${path}/${crypto.randomUUID()}-${webpFileName(file.name)}`;
    const bucket = supabase.storage.from(CATALOG_BUCKET);
    const { error } = await bucket.upload(key, optimized.buffer, { contentType: optimized.contentType, cacheControl: "31536000", upsert: false });
    if (error) throw error;
    return NextResponse.json({ url: bucket.getPublicUrl(key).data.publicUrl });
  } catch (error) {
    if (error instanceof ImageOptimizationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[api/upload POST]", error);
    return NextResponse.json({ error: "Could not upload the image to Supabase Storage. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await adminClient();
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { url } = await request.json() as { url?: unknown };
    const key = typeof url === "string" ? catalogKeyFromUrl(url) : null;
    if (!key) return NextResponse.json({ ok: true });
    // Keep shared catalog photos and historical booking snapshots intact.
    const { data: referenced, error: lookupError } = await supabase.rpc("catalog_image_is_referenced", { _url: url as string });
    if (lookupError) throw lookupError;
    if (referenced) return NextResponse.json({ ok: true, retained: true });
    const { error } = await supabase.storage.from(CATALOG_BUCKET).remove([key]);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/upload DELETE]", error);
    return NextResponse.json({ error: "Could not delete the image from Supabase Storage." }, { status: 500 });
  }
}
