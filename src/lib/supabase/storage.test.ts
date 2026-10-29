import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bookingImageUrl, catalogKeyFromUrl } from "./storage";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
});
afterEach(() => vi.unstubAllEnvs());

describe("catalog deletion URL boundaries", () => {
  it("accepts only this project's public catalog bucket", () => {
    expect(catalogKeyFromUrl("https://example.supabase.co/storage/v1/object/public/catalog-images/products/a/photo.jpg")).toBe("products/a/photo.jpg");
    expect(catalogKeyFromUrl("https://another.supabase.co/storage/v1/object/public/catalog-images/photo.jpg")).toBeNull();
    expect(catalogKeyFromUrl("https://example.supabase.co/storage/v1/object/public/booking-images/photo.jpg")).toBeNull();
    expect(catalogKeyFromUrl("https://example.supabase.co/storage/v1/object/public/catalog-images/")).toBeNull();
    expect(catalogKeyFromUrl("https://example.supabase.co/storage/v1/object/public/catalog-images/products/%2e%2e%2fsecret.jpg")).toBeNull();
  });
});

it("persists a stable private-photo route without an expiring access token", () => {
  expect(bookingImageUrl("bookings/id/team/photo name.jpg")).toBe("/api/booking-images/bookings/id/team/photo%20name.jpg");
});
