// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
import { POST, DELETE } from "./route";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), rpc: vi.fn(), upload: vi.fn(), remove: vi.fn(), from: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc, storage: { from: mocks.from } }),
}));
const imageUrl = "https://example.supabase.co/storage/v1/object/public/catalog-images/products/a/photo.png";
let fixture: Buffer;
beforeAll(async () => { fixture = await sharp({ create: { width: 120, height: 80, channels: 3, background: "pink" } }).png().toBuffer(); });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: "admin" } } });
  mocks.rpc.mockImplementation(async (name: string) => ({ data: name === "has_role", error: null }));
  mocks.upload.mockResolvedValue({ error: null });
  mocks.remove.mockResolvedValue({ error: null });
  mocks.from.mockReturnValue({ upload: mocks.upload, remove: mocks.remove, getPublicUrl: () => ({ data: { publicUrl: imageUrl } }) });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

function upload(file = new File([new Uint8Array(fixture)], "photo.png"), prefix = "products/a") {
  const form = new FormData(); form.set("file", file); form.set("pathPrefix", prefix);
  return POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
}
function remove(url: string) {
  return DELETE(new NextRequest("http://localhost/api/upload", { method: "DELETE", body: JSON.stringify({ url }), headers: { "content-type": "application/json" } }));
}

it("uploads verified admin image bytes to Supabase and returns its public URL", async () => {
  const response = await upload();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ url: imageUrl });
  expect(mocks.from).toHaveBeenCalledWith("catalog-images");
  expect(mocks.upload).toHaveBeenCalledWith(expect.stringMatching(/^products\/a\/[0-9a-f-]+-photo.webp$/), expect.any(Buffer), { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  const stored = mocks.upload.mock.calls[0][1];
  expect((await sharp(stored).metadata()).format).toBe("webp");
  expect(stored.length).toBeLessThanOrEqual(200 * 1024);
});

it("rejects signed-out and non-admin uploads before accessing storage", async () => {
  mocks.getUser.mockResolvedValueOnce({ data: { user: null } });
  expect((await upload()).status).toBe(401);
  mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
  expect((await upload()).status).toBe(401);
  expect(mocks.upload).not.toHaveBeenCalled();
});

it("rejects disguised non-images, oversized files and non-catalog paths", async () => {
  expect((await upload(new File(["<svg></svg>"], "fake.png", { type: "image/png" }))).status).toBe(400);
  expect((await upload(new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "broken.png"))).status).toBe(400);
  expect((await upload(new File([new Uint8Array(4194305)], "large.png"))).status).toBe(400);
  expect((await upload(undefined, "bookings/private")).status).toBe(400);
  expect(mocks.upload).not.toHaveBeenCalled();
});

it("returns a JSON error when Supabase rejects the upload", async () => {
  mocks.upload.mockResolvedValueOnce({ error: new Error("Storage failure") });
  const response = await upload();
  expect(response.status).toBe(500);
  expect((await response.json()).error).toContain("Supabase Storage");
});

it("keeps shared images and ignores URLs outside the project bucket", async () => {
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  expect(await (await remove(imageUrl)).json()).toEqual({ ok: true, retained: true });
  expect(await (await remove("https://other.example/photo.png")).json()).toEqual({ ok: true });
  expect(mocks.remove).not.toHaveBeenCalled();
});

it("removes unreferenced images but retains them if reference lookup fails", async () => {
  expect((await remove(imageUrl)).status).toBe(200);
  expect(mocks.remove).toHaveBeenCalledWith(["products/a/photo.png"]);
  mocks.remove.mockClear();
  mocks.rpc.mockImplementation(async (name: string) => name === "has_role" ? { data: true, error: null } : { data: null, error: new Error("Lookup failed") });
  expect((await remove(imageUrl)).status).toBe(500);
  expect(mocks.remove).not.toHaveBeenCalled();
});
