import { CONTACT, CONTACT_ADDRESS_FULL, SITE_NAME, SITE_URL } from "@/lib/site";

export type EmailEvent = {
  title: string;
  message: string;
  rows?: [string, string][];
  path?: string;
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function renderEmail(event: EmailEvent) {
  const url = event.path?.startsWith("/") && !event.path.startsWith("//")
    ? new URL(event.path, SITE_URL).href : SITE_URL;
  const rows = event.rows ?? [];
  const text = [SITE_NAME, event.title, event.message, ...rows.map(([key, value]) => `${key}: ${value}`), `View details: ${url}`, `Questions? ${CONTACT.email} | ${CONTACT.phone}`, CONTACT_ADDRESS_FULL].join("\n\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#faf7fc;font-family:Arial,sans-serif;color:#351043"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="100%" style="max-width:600px;background:white;border-radius:20px"><tr><td style="padding:28px;background:#531765;color:white;border-radius:20px 20px 0 0;font-size:24px;font-weight:bold">${escapeHtml(SITE_NAME)}</td></tr><tr><td style="padding:28px"><h1 style="font-size:24px">${escapeHtml(event.title)}</h1><p style="line-height:1.7;white-space:pre-wrap">${escapeHtml(event.message)}</p><table role="presentation" width="100%">${rows.map(([key, value]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;width:32%"><strong>${escapeHtml(key)}</strong></td><td style="padding:10px;border-bottom:1px solid #eee;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="margin-top:28px"><a href="${escapeHtml(url)}" style="background:#531765;color:white;padding:12px 22px;border-radius:24px;text-decoration:none;display:inline-block">View details</a></p><p style="font-size:13px;color:#666;line-height:1.7">Questions? Reply to this email or call ${escapeHtml(CONTACT.phone)}.</p></td></tr><tr><td style="padding:20px 28px;font-size:12px;color:#777;border-top:1px solid #eee">${escapeHtml(CONTACT_ADDRESS_FULL)}</td></tr></table></td></tr></table></body></html>`;
  return { subject: `${SITE_NAME} | ${event.title}`.replace(/[\r\n]/g, " ").slice(0, 200), html, text };
}
