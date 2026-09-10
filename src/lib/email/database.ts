import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { EmailEvent } from "./templates";

export type EmailRequest = { from: string; to: string[]; replyTo: string; subject: string; html: string; text: string };
export type OutboxRow = {
  id: string; event_key: string; recipient: string | null; reply_to: string | null;
  payload: EmailEvent; request: EmailRequest | null; status: string; attempts: number;
  lock_token: string; resend_id: string | null; last_error: string | null;
  created_at: string; first_attempt_at: string | null; available_at: string;
  locked_until: string | null; sent_at: string | null;
};
type DeliveryEvent = { id: string; resend_id: string; event_type: string; occurred_at: string; received_at?: string };
// Kept alongside the migration until the next full Supabase types regeneration.
type EmailDatabase = { public: {
  Tables: {
    email_outbox: { Row: OutboxRow; Insert: Partial<OutboxRow>; Update: Partial<OutboxRow>; Relationships: [] };
    email_delivery_events: { Row: DeliveryEvent; Insert: DeliveryEvent; Update: Partial<DeliveryEvent>; Relationships: [] };
  };
  Views: Record<never, never>;
  Functions: {
    claim_email: { Args: Record<string, never>; Returns: OutboxRow[] };
    submit_contact: { Args: { _id: string; _name: string; _email: string; _phone: string; _subject: string; _message: string; _fingerprint: string }; Returns: string };
  };
  Enums: Record<never, never>; CompositeTypes: Record<never, never>;
} };

export function emailDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Email database configuration is missing");
  return createClient<EmailDatabase>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
