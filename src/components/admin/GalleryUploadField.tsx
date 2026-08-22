"use client";

import { useState } from "react";
import { GripVertical, ImagePlus, Loader2, Star, X } from "lucide-react";
import { deleteCatalogImage, uploadCatalogImage } from "@/lib/s3-upload-client";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 8;

export function GalleryUploadField({ value, onChange, pathPrefix, onUploadingChange }: {
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function setUploadState(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFiles(files: FileList | File[]) {
    const availableSlots = MAX_IMAGES - value.length;
    const selected = Array.from(files).slice(0, Math.max(availableSlots, 0));
    if (!selected.length) return setError(`A product can have up to ${MAX_IMAGES} photos.`);

    const tooLarge = selected.filter((file) => file.size > MAX_IMAGE_BYTES);
    const eligible = selected.filter((file) => file.size > 0 && file.size <= MAX_IMAGE_BYTES);
    const messages: string[] = [];
    if (tooLarge.length) messages.push(`${tooLarge.length} image${tooLarge.length === 1 ? " is" : "s are"} over 4 MB`);

    setUploadState(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      // Sequential uploads avoid competing serverless requests and provide an
      // accurate progress message when an admin selects several photos.
      for (const [index, file] of eligible.entries()) {
        setUploadStatus(`Uploading ${index + 1} of ${eligible.length}…`);
        try {
          uploaded.push(await uploadCatalogImage(file, pathPrefix));
        } catch (uploadError) {
          messages.push(uploadError instanceof Error ? uploadError.message : `Could not upload ${file.name}`);
        }
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
      if (messages.length) setError(messages.join(". "));
    } finally {
      setUploadStatus("");
      setUploadState(false);
    }
  }

  function addUrl() {
    const url = pastedUrl.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    } catch {
      setError("Enter a complete image URL beginning with https:// or http://.");
      return;
    }
    if (value.length >= MAX_IMAGES) return setError(`A product can have up to ${MAX_IMAGES} photos.`);
    setError(null);
    onChange([...value, url]);
    setPastedUrl("");
  }

  function removeAt(index: number) {
    void deleteCatalogImage(value[index]);
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold">Product gallery</h3>
          <p className="mt-1 text-xs text-muted-foreground">The first photo is the cover image. Add up to {MAX_IMAGES} photos and drag files here to upload.</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{value.length}/{MAX_IMAGES} photos</span>
      </div>

      <div
        onDragEnter={(event) => { event.preventDefault(); if (!uploading && value.length < MAX_IMAGES) setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (!uploading) void handleFiles(event.dataTransfer.files); }}
        className={`rounded-2xl border p-3 transition ${isDragging ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-dashed border-border bg-muted/10"}`}
      >
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground"><Star className="h-2.5 w-2.5 fill-current" /> Cover</span>
              ) : (
                <button type="button" onClick={() => moveTo(index, 0)} className="absolute left-1.5 top-1.5 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">Make cover</button>
              )}
              <button type="button" onClick={() => removeAt(index)} aria-label={`Remove image ${index + 1}`} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/65 text-white transition hover:bg-destructive"><X className="h-3.5 w-3.5" /></button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/65 py-1.5 text-white">
                <button type="button" onClick={() => moveTo(index, index - 1)} disabled={index === 0} aria-label={`Move image ${index + 1} earlier`} className="rounded p-0.5 disabled:opacity-30"><GripVertical className="h-3.5 w-3.5 -rotate-90" /></button>
                <span className="text-[10px] font-bold">{index + 1}</span>
                <button type="button" onClick={() => moveTo(index, index + 1)} disabled={index === value.length - 1} aria-label={`Move image ${index + 1} later`} className="rounded p-0.5 disabled:opacity-30"><GripVertical className="h-3.5 w-3.5 rotate-90" /></button>
              </div>
            </div>
          ))}
          {value.length < MAX_IMAGES && (
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-background text-primary">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              <span className="text-center text-xs font-bold">{uploading ? "Uploading" : "Choose below"}</span>
            </div>
          )}
        </div>
      </div>

      {value.length < MAX_IMAGES && (
        <label className="block rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">
          <span className="mb-1.5 block text-xs text-muted-foreground">Choose product images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-foreground hover:file:brightness-110 disabled:cursor-not-allowed"
            onClick={(event) => {
              // Clear only immediately before a new selection. This allows the
              // native control to visibly show the chosen files and still lets
              // an admin select the same file again after a failed upload.
              event.currentTarget.value = "";
            }}
            onChange={(event) => {
              const files = event.target.files;
              if (files?.length) void handleFiles(files);
            }}
          />
        </label>
      )}

      {uploadStatus && <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadStatus}</p>}
      <div className="flex gap-2">
        <input type="url" value={pastedUrl} onChange={(event) => setPastedUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addUrl(); } }} placeholder="Or paste a public image URL" className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <button type="button" onClick={addUrl} disabled={uploading || value.length >= MAX_IMAGES} className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold disabled:opacity-50">Add URL</button>
      </div>
      <p className="text-[11px] text-muted-foreground">JPEG, PNG, WebP, GIF, BMP, or HEIC · 4 MB maximum per image.</p>
      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}
