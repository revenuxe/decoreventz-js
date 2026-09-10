import "server-only";
import { z } from "zod";
import { CONTACT } from "@/lib/site";

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const recipients = (process.env.EMAIL_ADMIN_TO ?? CONTACT.email).split(",").map((email) => email.trim());
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || CONTACT.email;
  const senderEmail = from?.match(/<([^<>]+)>$/)?.[1] ?? from;
  if (!apiKey || !from || !z.email().safeParse(senderEmail).success || /[\r\n]/.test(from) || !z.array(z.email()).min(1).max(10).safeParse(recipients).success || !z.email().safeParse(replyTo).success) {
    throw new Error("Email configuration is missing or invalid");
  }
  return { apiKey, from, recipients, replyTo };
}
