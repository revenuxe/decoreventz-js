import "server-only";
import { isBookingNotification } from "./recipient-policy";
import { sendEmail } from "./transport";
import { emailConfig } from "./config";
import { emailDatabase } from "./database";
import { renderEmail } from "./templates";

export function retryDelay(attempt: number) {
  return Math.min(60 * 2 ** Math.max(0, attempt - 1), 3600);
}

export async function processEmailQueue() {
  const config = emailConfig();
  const db = emailDatabase();
  // Bound the network request so a worker never outlives its two-minute lease.

  const started = Date.now();
  const counts = { sent: 0, retried: 0, failed: 0 };
  for (let index = 0; index < 10 && Date.now() - started < 35_000; index++) {
    const { data, error } = await db.rpc("claim_email", {});
    if (error) throw new Error("Unable to claim email queue entry");
    const row = data?.[0];
    if (!row) break;
    if (!isBookingNotification(row.event_key, row.recipient, row.request)) {
      const cancelled = await db.from("email_outbox").update({ status: "failed", last_error: "disabled_by_booking_only_email_policy", locked_until: null })
        .eq("id",row.id).eq("lock_token",row.lock_token).select("id").single();
      if (cancelled.error) throw new Error("Unable to suppress disabled notification");
      counts.failed++;
      continue;
    }
    const request = row.request ?? {
      from: config.from, to: row.recipient ? [row.recipient] : config.recipients,
      replyTo: row.reply_to || config.replyTo, ...renderEmail(row.payload),
    };
    if (!row.request) {
      const saved = await db.from("email_outbox").update({ request }).eq("id", row.id).eq("lock_token", row.lock_token).select("id").single();
      if (saved.error) throw new Error("Unable to freeze email request");
    }
    const { id: resendId, error: failure = "unknown_error", permanent = false } = await sendEmail(config.apiKey, row.id, request);
    const failed = permanent || row.attempts >= 8;
    const update = resendId
      ? { status: "sent", resend_id: resendId, sent_at: new Date().toISOString(), last_error: null, locked_until: null }
      : { status: failed ? "failed" : "pending", last_error: failure, available_at: new Date(Date.now() + retryDelay(row.attempts) * 1000).toISOString(), locked_until: null };
    const saved = await db.from("email_outbox").update(update).eq("id", row.id).eq("lock_token", row.lock_token).select("id").single();
    if (saved.error) throw new Error("Unable to save email delivery result");
    if (resendId) counts.sent++;
    else if (failed) counts.failed++;
    else counts.retried++;
    // Remain under the default provider request rate within this invocation.
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return counts;
}
