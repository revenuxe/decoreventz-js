import { timingSafeEqual } from "node:crypto";
import { processEmailQueue } from "@/lib/email/worker";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await processEmailQueue(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Email queue worker unavailable");
    return Response.json({ error: "Email worker unavailable" }, { status: 503 });
  }
}
