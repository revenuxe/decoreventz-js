import "server-only";
import type { EmailRequest } from "./database";

export async function sendEmail(apiKey: string, id: string, email: EmailRequest): Promise<{ id?: string; error?: string; permanent?: boolean }> {
  try {
    const { replyTo, ...fields } = email;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": id },
      body: JSON.stringify({ ...fields, reply_to: replyTo }),
    });
    const result = await response.json();
    if (response.ok && typeof result.id === "string") return { id: result.id };
    const code = typeof result.name === "string" ? result.name : `http_${response.status}`;
    return { error: code, permanent: !(response.status >= 500 || response.status === 429 || response.status === 408 || code === "concurrent_idempotent_requests") };
  } catch {
    // A timeout may follow acceptance. Retry with the same frozen request/key.
    return { error: "network_error", permanent: false };
  }
}
