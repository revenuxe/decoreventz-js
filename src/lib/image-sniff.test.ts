import { describe, expect, it } from "vitest";
import { detectedImageMimeType, sanitizeObjectPrefix } from "./image-sniff";

describe("detectedImageMimeType", () => {
  it("recognizes common image signatures", () => {
    expect(detectedImageMimeType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe("image/jpeg");
    expect(detectedImageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe("image/png");
    expect(detectedImageMimeType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
  });

  it("rejects a generic RIFF file that is not a WebP image", () => {
    expect(detectedImageMimeType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]))).toBeNull();
  });
});

describe("sanitizeObjectPrefix", () => {
  it("permits application-owned object paths", () => {
    expect(sanitizeObjectPrefix("products/new/seo")).toBe("products/new/seo");
  });

  it("rejects traversal and unsupported path segments", () => {
    expect(sanitizeObjectPrefix("products/../private")).toBeNull();
    expect(sanitizeObjectPrefix("products/my folder")).toBeNull();
  });
});
