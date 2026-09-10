import { createHmac } from "node:crypto";
import { after } from "next/server";
import { contactSchema } from "@/lib/email/contact-schema";
import { emailDatabase } from "@/lib/email/database";
import { emailConfig } from "@/lib/email/config";
import { processEmailQueue } from "@/lib/email/worker";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Request not allowed." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Expected JSON." }, { status: 415 });
  try {
    const body = await request.text();
    if (body.length > 12_000) return Response.json({ error: "Message is too long." }, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(body); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
    const parsed = contactSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Please enter your name, a valid email, and a message of 10–5,000 characters." }, { status: 400 });
    if (parsed.data.website) return Response.json({ ok: true });
    emailConfig();
    const secret = process.env.CONTACT_RATE_LIMIT_SECRET;
    if (!secret) throw new Error("Missing contact rate limit secret");
    // Vercel overwrites x-vercel-forwarded-for; never trust a client-supplied
    // generic forwarding header as a rate-limit identity in production.
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local-development";
    if (!ip) throw new Error("Missing trusted client address");
    const fingerprint = createHmac("sha256", secret).update(ip).digest("hex");
    const input = parsed.data;
    const { data, error } = await emailDatabase().rpc("submit_contact", {
      _id: input.id, _name: input.name, _email: input.email, _phone: input.phone,
      _subject: input.subject, _message: input.message, _fingerprint: fingerprint,
    });
    if (error) throw new Error("Contact persistence failed");
    if (data === "rate_limited") return Response.json({ error: "Too many messages. Please try again later or call us." }, { status: 429, headers: { "Retry-After": "3600" } });
    if (data === "conflict") return Response.json({ error: "This submission changed. Refresh the page and try again." }, { status: 409 });
    if (data !== "accepted") throw new Error("Unexpected contact result");
    after(async () => { try { await processEmailQueue(); } catch { console.error("Contact email worker failed; persisted messages remain queued."); } });
    return Response.json({ ok: true }, { status: 202 });
  } catch {
    console.error("Contact submission unavailable");
    return Response.json({ error: "We couldn't save your message. Please try again or contact us by phone." }, { status: 503 });
  }
}
