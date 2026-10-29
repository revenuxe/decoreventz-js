import assets from "./image-assets.json";

export type PhotoKey = keyof typeof assets;

// Existing site artwork is hosted in this project's public Storage bucket.
export function siteImage(key: PhotoKey): string {
  return assets[key];
}
