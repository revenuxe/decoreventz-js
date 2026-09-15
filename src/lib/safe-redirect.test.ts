import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("authentication redirects", () => {
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/\n/evil.example", "javascript:alert(1)", "", undefined])("rejects unsafe destination %s", (value) => {
    expect(safeRedirect(value)).toBe("/");
  });
  it("preserves local destinations and query strings", () => {
    expect(safeRedirect("/book?step=2#review")).toBe("/book?step=2#review");
  });
});
