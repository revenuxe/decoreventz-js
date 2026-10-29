// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { uploadCatalogImage } from "./catalog-upload-client";
import { uploadVendorOrderImage } from "./vendor-upload-client";

const fetchMock = vi.fn();
const file = () => new File(["image bytes"], "photo.png", { type: "image/png" });
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => vi.unstubAllGlobals());

it("preserves admin and vendor fields and uses session cookies", async () => {
  fetchMock.mockImplementation(async () => Response.json({ url: "/uploaded-photo" }));
  expect(await uploadCatalogImage(file(), "products/a")).toBe("/uploaded-photo");
  expect(await uploadVendorOrderImage(file(), "booking-id", "team")).toBe("/uploaded-photo");
  const [endpoint, options] = fetchMock.mock.calls[1];
  expect(endpoint).toBe("/api/vendor/upload");
  expect(options.credentials).toBe("same-origin");
  expect(options.body.get("bookingId")).toBe("booking-id");
  expect(options.body.get("kind")).toBe("team");
});

it("turns an HTML size-limit response into an actionable vendor upload error", async () => {
  fetchMock.mockResolvedValueOnce(new Response("<html>Too large</html>", { status: 413 }));
  await expect(uploadVendorOrderImage(file(), "id", "team")).rejects.toThrow("Choose a smaller image");
});

it("handles expired sessions and malformed successful responses", async () => {
  fetchMock.mockResolvedValueOnce(new Response("", { status: 401 }));
  await expect(uploadCatalogImage(file(), "products/a")).rejects.toThrow("Sign in");
  fetchMock.mockResolvedValueOnce(Response.json({ url: {} }));
  await expect(uploadCatalogImage(file(), "products/a")).rejects.toThrow("Image upload failed");
});

it("rejects empty or oversized images without sending a request", async () => {
  await expect(uploadCatalogImage(new File([], "empty.png"), "products/a")).rejects.toThrow("4 MB");
  await expect(uploadCatalogImage(new File([new Uint8Array(4194305)], "large.png"), "products/a")).rejects.toThrow("4 MB");
  expect(fetchMock).not.toHaveBeenCalled();
});
