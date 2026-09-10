import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailDatabase } from "@/lib/email/database";
import { emailConfig } from "@/lib/email/config";

export const dynamic = "force-dynamic";

export default async function EmailDeliveryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) redirect("/");
  let configured = true;
  try { emailConfig(); } catch { configured = false; }
  const db = emailDatabase();
  const { data: messages, error } = await db.from("email_outbox")
    .select("id,recipient,payload,status,attempts,last_error,created_at,resend_id")
    .order("created_at", { ascending: false }).limit(100);
  const ids = messages?.flatMap((message) => message.resend_id ? [message.resend_id] : []) ?? [];
  const events = ids.length ? await db.from("email_delivery_events").select("resend_id,event_type,occurred_at").in("resend_id", ids).order("occurred_at", { ascending: false }) : null;
  const latest = new Map<string, string>();
  for (const event of events?.data ?? []) {
    if (!latest.has(event.resend_id) || ["email.bounced", "email.complained", "email.failed", "email.suppressed"].includes(event.event_type)) latest.set(event.resend_id, event.event_type);
  }
  return <section className="space-y-5">
    <div><h1 className="font-display text-3xl">Email delivery</h1><p className="mt-2 text-sm text-muted-foreground">Latest 100 notifications. Refresh to see new queue and delivery updates.</p></div>
    {!configured && <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">Email sending is not configured. Check the Resend environment variables.</p>}
    {error ? <p role="alert">The email queue is unavailable. Check that the email migration has been applied.</p> : <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-4">Notification</th><th className="p-4">Recipient</th><th className="p-4">Status</th><th className="p-4">Attempts</th></tr></thead><tbody>
      {messages?.map((message) => <tr key={message.id} className="border-b border-border last:border-0"><td className="p-4"><p className="font-semibold">{message.payload.title}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p></td><td className="p-4">{message.recipient ?? "Operations inbox"}</td><td className="p-4"><p>{message.resend_id ? latest.get(message.resend_id)?.replace("email.", "") ?? "Accepted by Resend" : message.status}</p>{message.last_error && <p className="mt-1 text-xs text-destructive">{message.last_error}</p>}</td><td className="p-4">{message.attempts}</td></tr>)}
      {!messages?.length && <tr><td colSpan={4} className="p-6 text-muted-foreground">No email notifications yet.</td></tr>}
    </tbody></table></div>}
    {events?.error && <p role="alert" className="text-sm text-destructive">Delivery events could not be loaded.</p>}
    <p className="text-xs text-muted-foreground">“Accepted by Resend” does not confirm inbox delivery. Delivery and bounce updates require the Resend webhook. Failed messages require review in Resend before replay.</p>
  </section>;
}
