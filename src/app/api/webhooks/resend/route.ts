import { Resend } from "resend";
import { emailDatabase } from "@/lib/email/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) return Response.json({ error: "Webhook unavailable" }, { status: 503 });
  const payload = await request.text();
  if (payload.length > 100_000) return Response.json({ error: "Payload too large" }, { status: 413 });
  let event;
  try {
    event = new Resend(process.env.RESEND_API_KEY).webhooks.verify({
      payload, webhookSecret: secret,
      headers: { id: request.headers.get("svix-id") ?? "", timestamp: request.headers.get("svix-timestamp") ?? "", signature: request.headers.get("svix-signature") ?? "" },
    });
  } catch { return Response.json({ error: "Invalid signature" }, { status: 401 }); }
  if (!("email_id" in event.data) || typeof event.data.email_id !== "string") return Response.json({ ok: true });
  try {
    // Append-only event log handles replay and out-of-order delivery without
    // overwriting a bounce with an older delivered event. No email body stored.
    const { error } = await emailDatabase().from("email_delivery_events").upsert({
      id: request.headers.get("svix-id")!, resend_id: event.data.email_id,
      event_type: event.type, occurred_at: event.created_at,
    }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    console.error("Email delivery event persistence failed");
    return Response.json({ error: "Please retry" }, { status: 503 });
  }
}
