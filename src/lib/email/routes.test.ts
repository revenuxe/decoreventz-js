// @vitest-environment node
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), upsert: vi.fn(), config: vi.fn(), worker: vi.fn(), after: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/email/database", () => ({ emailDatabase: () => ({ rpc: mocks.rpc, from: () => ({ upsert: mocks.upsert }) }) }));
vi.mock("@/lib/email/config", () => ({ emailConfig: mocks.config }));
vi.mock("@/lib/email/worker", () => ({ processEmailQueue: mocks.worker }));
vi.mock("next/server", () => ({ after: mocks.after }));
import { POST as contact } from "@/app/api/contact/route";
import { GET as cron } from "@/app/api/cron/email/route";
import { POST as webhook } from "@/app/api/webhooks/resend/route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CONTACT_RATE_LIMIT_SECRET", "test-secret");
  vi.stubEnv("CRON_SECRET", "cron-secret");
  vi.stubEnv("VERCEL", "");
  mocks.rpc.mockResolvedValue({ data: "accepted", error: null });
  mocks.upsert.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
const input = { id: "00000000-0000-4000-8000-000000000001", name: "Test User", email: "test@example.com", phone: "", subject: "", message: "Please help with a booking." };
function contactRequest(body: unknown = input, origin = "https://www.decoreventz.com") {
  return new Request("https://www.decoreventz.com/api/contact", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
describe("contact endpoint", () => {
  it("rejects cross-origin requests without touching the database", async () => {
    expect((await contact(contactRequest(input, "https://evil.example"))).status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects invalid input before queueing", async () => {
    expect((await contact(contactRequest({ ...input, email: "invalid" }))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("silently drops honeypot submissions", async () => {
    expect((await contact(contactRequest({ ...input, website: "spam" }))).status).toBe(200);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("returns accepted only after saving, and schedules background processing", async () => {
    expect((await contact(contactRequest())).status).toBe(202);
    expect(mocks.rpc).toHaveBeenCalledWith("submit_contact", expect.objectContaining({ _email: input.email, _fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(mocks.after).toHaveBeenCalledOnce();
  });
  it("keeps enquiries persisted while the sender configuration is being repaired", async () => {
    mocks.config.mockImplementationOnce(() => { throw new Error("Restricted onboarding sender"); });
    expect((await contact(contactRequest())).status).toBe(202);
    expect(mocks.rpc).toHaveBeenCalled();
    expect(mocks.config).not.toHaveBeenCalled();
  });
  it("reports persistence failures instead of false success", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockResolvedValue({ error: { message: "db unavailable" } });
    expect((await contact(contactRequest())).status).toBe(503);
    expect(mocks.after).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it("returns retry guidance on rate limit", async () => {
    mocks.rpc.mockResolvedValue({ data: "rate_limited" });
    const response = await contact(contactRequest());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3600");
  });
});
describe("worker endpoint", () => {
  it("requires the exact cron bearer secret", async () => {
    expect((await cron(new Request("https://example.com/api/cron/email"))).status).toBe(401);
    expect(mocks.worker).not.toHaveBeenCalled();
    mocks.worker.mockResolvedValue({ sent: 1, retried: 0, failed: 0 });
    expect((await cron(new Request("https://example.com/api/cron/email", { headers: { Authorization: "Bearer cron-secret" } }))).status).toBe(200);
  });
});
describe("Resend webhook authenticity", () => {
  const secret = Buffer.from("a-long-test-webhook-secret-value").toString("base64");
  function request(signed = true, timestamp = Math.floor(Date.now() / 1000)) {
    const body = JSON.stringify({ type: "email.delivered", created_at: new Date().toISOString(), data: { email_id: "email-123" } });
    const id = "msg-test";
    const signature = createHmac("sha256", Buffer.from(secret, "base64")).update(`${id}.${timestamp}.${body}`).digest("base64");
    return new Request("https://www.decoreventz.com/api/webhooks/resend", { method: "POST", body, headers: { "svix-id": id, "svix-timestamp": String(timestamp), "svix-signature": signed ? `v1,${signature}` : "v1,bad" } });
  }
  beforeEach(() => { vi.stubEnv("RESEND_API_KEY", "re_test"); vi.stubEnv("RESEND_WEBHOOK_SECRET", `whsec_${secret}`); });
  it("rejects forged and stale signatures", async () => {
    expect((await webhook(request(false))).status).toBe(401);
    expect((await webhook(request(true, 1))).status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("verifies a real signature and uses deduplicating persistence", async () => {
    expect((await webhook(request())).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ id: "msg-test", resend_id: "email-123", event_type: "email.delivered" }), { onConflict: "id", ignoreDuplicates: true });
  });
  it("asks Resend to retry on persistence failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.upsert.mockResolvedValue({ error: { message: "offline" } });
    expect((await webhook(request())).status).toBe(503);
    log.mockRestore();
  });
});
