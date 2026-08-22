import { describe, expect, it } from "vitest";
import { s3PublicBaseUrl, s3PublicHostname } from "./s3-public-url";

describe("s3PublicBaseUrl", () => {
  it("normalizes a CloudFront hostname to a secure origin", () => {
    expect(s3PublicBaseUrl("d16tq75w3z0i3u.cloudfront.net")).toBe("https://d16tq75w3z0i3u.cloudfront.net");
    expect(s3PublicHostname("d16tq75w3z0i3u.cloudfront.net")).toBe("d16tq75w3z0i3u.cloudfront.net");
  });

  it("preserves a valid HTTPS path prefix and rejects unsafe values", () => {
    expect(s3PublicBaseUrl("https://cdn.example.com/assets/")).toBe("https://cdn.example.com/assets");
    expect(s3PublicBaseUrl("http://cdn.example.com")).toBeNull();
    expect(s3PublicBaseUrl("not a url")).toBeNull();
  });
});
