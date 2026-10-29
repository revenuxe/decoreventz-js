// @vitest-environment node
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { expect, it } from "vitest";
import { imagePolicy, optimizeImage, webpFileName } from "./optimize-image";

it("resizes and converts PNGs to WebP within each storage budget", async () => {
  const input = await sharp({ create: { width: 3200, height: 1600, channels: 3, background: "purple" } }).png().toBuffer();
  for (const path of ["products/id", "categories/id", "subcategories/id", "homepage-hero/id/desktop", "bookings/id/team"]) {
    const result = await optimizeImage(input, path);
    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe("webp");
    expect(Math.max(result.width, result.height)).toBeLessThanOrEqual(imagePolicy(path).maxEdge);
    expect(result.width / result.height).toBeCloseTo(2, 1);
    expect(result.buffer.length).toBeLessThanOrEqual(imagePolicy(path).maxBytes);
    expect(result.buffer.length).toBeLessThan(input.length);
  }
});

it("adapts compression for detailed photographs to stay below the byte limit", async () => {
  const input = await sharp(randomBytes(2000 * 1600 * 3), { raw: { width: 2000, height: 1600, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();
  const result = await optimizeImage(input, "products/id");
  expect(result.buffer.length).toBeLessThanOrEqual(200 * 1024);
  expect(result.buffer.length).toBeLessThan(input.length / 4);
}, 20000);

it("preserves transparency, avoids upscaling and removes identifying metadata", async () => {
  const input = await sharp({ create: { width: 80, height: 60, channels: 4, background: { r: 200, g: 100, b: 50, alpha: 0.3 } } })
    .withMetadata().png().toBuffer();
  const result = await optimizeImage(input, "products/id");
  const metadata = await sharp(result.buffer).metadata();
  expect([result.width, result.height]).toEqual([80, 60]);
  expect(metadata.hasAlpha).toBe(true);
  expect(metadata.exif).toBeUndefined();
  expect(metadata.icc).toBeUndefined();
});

it("applies camera orientation before dropping EXIF", async () => {
  const input = await sharp({ create: { width: 120, height: 80, channels: 3, background: "blue" } }).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const result = await optimizeImage(input, "products/id");
  expect([result.width, result.height]).toEqual([80, 120]);
  expect((await sharp(result.buffer).metadata()).orientation).toBeUndefined();
});

it("rejects corrupt files, mislabeled content and excessive pixel counts", async () => {
  await expect(optimizeImage(Buffer.from("not an image"), "products/id")).rejects.toThrow("valid image");
  await expect(optimizeImage(Buffer.from([0x89, 0x50, 0x4e, 0x47]), "products/id")).rejects.toThrow("could not be processed");
  const oversized = await sharp({ create: { width: 6500, height: 6500, channels: 3, background: "white" } }).png().toBuffer();
  await expect(optimizeImage(oversized, "products/id")).rejects.toThrow("40 megapixels");
}, 20000);

it("uses sanitized WebP filenames instead of the original file extension", () => {
  expect(webpFileName("Birthday Photo.JPG")).toBe("Birthday-Photo.webp");
  expect(webpFileName(".png")).toBe("image.webp");
});
