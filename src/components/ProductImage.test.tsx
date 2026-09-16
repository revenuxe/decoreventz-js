import { act, type Ref } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductImage } from "./ProductImage";

vi.mock("next/image", () => ({
  default: ({ src, alt, unoptimized, onError, ref }: { src: string; alt: string; unoptimized?: boolean; onError: () => void; ref: Ref<HTMLImageElement> }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={unoptimized ? src : "/optimized?src=" + src} alt={alt} onError={onError} />,
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
function fail() {
  act(() => container.querySelector("img")!.dispatchEvent(new Event("error")));
}
function src() { return container.querySelector("img")?.getAttribute("src"); }

describe("ProductImage recovery", () => {
  it("recovers when the image failed before its error handler attached", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockImplementation(function (this: HTMLImageElement) {
      return this.getAttribute("src")?.startsWith("/optimized") ? 0 : 100;
    });
    act(() => root.render(<ProductImage sources={["/a.jpg"]} alt="Decor" width={40} height={40} />));
    expect(src()).toBe("/a.jpg");
  });

  it("retains breakpoint visibility when every source fails", () => {
    act(() => root.render(<ProductImage sources={["/a.jpg"]} alt="Decor" fill unoptimized className="hidden md:block" />));
    fail();
    expect(container.querySelector('[role="img"]')?.className).toContain("hidden md:block");
    expect(container.querySelector('[role="img"]')?.className).toContain("absolute inset-0");
  });
  it("tries the original then another gallery photo and stops after exhaustion", () => {
    act(() => root.render(<ProductImage sources={["/a.jpg", "/b.jpg"]} alt="Decor" width={40} height={40} />));
    expect(src()).toBe("/optimized?src=/a.jpg");
    fail();
    expect(src()).toBe("/a.jpg");
    fail();
    expect(src()).toBe("/optimized?src=/b.jpg");
    fail();
    expect(src()).toBe("/b.jpg");
    fail();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("Photo unavailable");
  });

  it("admin thumbnails skip optimization and duplicate or empty sources", () => {
    act(() => root.render(<ProductImage sources={[" /a.jpg ", "", "/a.jpg", "/b.jpg"]} alt="Decor" unoptimized width={40} height={40} />));
    expect(src()).toBe("/a.jpg");
    fail();
    expect(src()).toBe("/b.jpg");
  });

  it("shows an editor diagnostic and resets when the source changes", () => {
    act(() => root.render(<ProductImage sources={["/a.jpg"]} alt="Decor" unoptimized width={40} height={40} fallback={<span>Check image access</span>} />));
    fail();
    expect(container.textContent).toBe("Check image access");
    act(() => root.render(<ProductImage sources={["/b.jpg"]} alt="Decor" unoptimized width={40} height={40} />));
    expect(src()).toBe("/b.jpg");
  });
});
