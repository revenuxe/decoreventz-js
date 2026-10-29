import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_BUCKET } from "@/lib/supabase/storage";

// Persist a stable app URL. Storage RLS authorizes each download before a
// short-lived signed redirect is issued. Never cache authenticated redirects.
export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
  const { path } = await context.params;
  if (path.length !== 4 || path[0] !== "bookings" || !/^[0-9a-f-]{36}$/i.test(path[1]) ||
      !["decoration", "team"].includes(path[2]) || !/^[a-zA-Z0-9._-]+$/.test(path[3])) {
    return NextResponse.json({ error: "Invalid image path" }, { status: 400, headers });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const { data, error } = await supabase.storage.from(BOOKING_BUCKET).createSignedUrl(path.join("/"), 60);
  if (error || !data) return NextResponse.json({ error: "Image not found" }, { status: 404, headers });
  return NextResponse.redirect(data.signedUrl, { status: 307, headers });
}
