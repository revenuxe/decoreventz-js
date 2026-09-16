import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ImageUploadField } from "./ImageUploadField";
import { GalleryUploadField } from "./GalleryUploadField";
import { deleteCatalogImage, uploadCatalogImage } from "@/lib/s3-upload-client";

vi.mock("@/lib/s3-upload-client", () => ({ deleteCatalogImage: vi.fn(), uploadCatalogImage: vi.fn().mockResolvedValue("https://example.com/new.jpg") }));
vi.mock("@/components/CatalogImage", () => ({ CatalogImage: () => null }));
vi.mock("@/components/ProductImage", () => ({ ProductImage: () => null }));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

it("removing a draft gallery image does not delete a saved object's file", () => {
  const change = vi.fn();
  act(() => root.render(<GalleryUploadField value={["https://example.com/saved.jpg"]} onChange={change} pathPrefix="products/new" />));
  act(() => (container.querySelector('[aria-label="Remove image 1"]') as HTMLButtonElement).click());
  expect(change).toHaveBeenCalledWith([]);
  expect(deleteCatalogImage).not.toHaveBeenCalled();
});

it("removing a single draft image leaves the saved file intact", () => {
  const change = vi.fn();
  act(() => root.render(<ImageUploadField value="https://example.com/saved.jpg" onChange={change} pathPrefix="categories/new" />));
  const remove = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Remove"))!;
  act(() => remove.click());
  expect(change).toHaveBeenCalledWith(null);
  expect(deleteCatalogImage).not.toHaveBeenCalled();
});

it("replacing a draft image does not delete the previous saved file", async () => {
  const change = vi.fn();
  act(() => root.render(<ImageUploadField value="https://example.com/saved.jpg" onChange={change} pathPrefix="categories/new" />));
  const input = container.querySelector('input[type="file"]')!;
  Object.defineProperty(input, "files", { value: [new File(["image"], "photo.jpg", { type: "image/jpeg" })] });
  await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
  expect(uploadCatalogImage).toHaveBeenCalled();
  expect(change).toHaveBeenCalledWith("https://example.com/new.jpg");
  expect(deleteCatalogImage).not.toHaveBeenCalled();
});
