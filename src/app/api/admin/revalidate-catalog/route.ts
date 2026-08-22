import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Product and palette updates must take effect on the next public request,
  // rather than waiting for the catalog's normal timed revalidation.
  revalidateTag("catalog", { expire: 0 });
  revalidateTag("homepage-hero", { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
