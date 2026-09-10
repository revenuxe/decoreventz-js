// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { renderEmail } from "./templates";
import { contactSchema } from "./contact-schema";
import { sendEmail } from "./transport";
import { retryDelay } from "./worker";

afterEach(() => vi.unstubAllGlobals());

describe("email safety and transport", () => {
  it("escapes user content in HTML and includes a plain-text version", () => {
    const result = renderEmail({ title: "Hello\r\nInjected", message: '<script>alert("x")</script>', rows: [["Name", "<img src=x>"]], path: "//evil.example" });
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).not.toContain('href="//evil');
    expect(result.text).toContain('<script>');
    expect(result.subject).not.toMatch(/[\r\n]/);
  });
  it("rejects invalid, excessive, or incomplete contact input", () => {
    const valid = { id: "00000000-0000-4000-8000-000000000001", name: "Customer", email: "test@example.com", phone: "", subject: "", message: "Please call about my booking." };
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, email: "invalid" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, id: "" }).success).toBe(false);
  });
  const request = { from: "test@example.com", to: ["recipient@example.com"], replyTo: "reply@example.com", subject: "Hello", html: "<p>Hello</p>", text: "Hello" };
  it("uses a stable idempotency header, reply-to, and request timeout", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: "email-123" }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendEmail("test-key", "stable-id", request)).toEqual({ id: "email-123" });
    const options = fetchMock.mock.calls[0][1];
    expect(options.headers["Idempotency-Key"]).toBe("stable-id");
    expect(JSON.parse(options.body).reply_to).toBe("reply@example.com");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([429, 500, 503, 408])("retries transient HTTP %s", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ name: "temporary" }, { status })));
    expect((await sendEmail("key", "id", request)).permanent).toBe(false);
  });
  it("does not retry an invalid sender or changed idempotent payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ name: "validation_error" }, { status: 422 })));
    expect((await sendEmail("key", "id", request)).permanent).toBe(true);
  });
  it("retries ambiguous network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await sendEmail("key", "id", request)).toEqual({ error: "network_error", permanent: false });
  });
  it("caps exponential retry backoff at one hour", () => {
    expect(retryDelay(1)).toBe(60);
    expect(retryDelay(3)).toBe(240);
    expect(retryDelay(8)).toBe(3600);
  });
});
