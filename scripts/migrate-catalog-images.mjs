// One-time, rerunnable public-catalog migration. Private business tables are
// deliberately excluded. Only verified copies replace existing references.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const apply = process.argv.includes("--apply");
const project = readFileSync("supabase/.temp/project-ref", "utf8").trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url || new URL(url).hostname !== `${project}.supabase.co`) throw new Error("App URL must match the CLI-linked project");
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const reader = createClient(url, publicKey, options);
let writer;
if (apply) {
  let secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    const binary = process.env.SUPABASE_CLI_BINARY;
    if (!binary) throw new Error("Set SUPABASE_CLI_BINARY or a server-only SUPABASE_SERVICE_ROLE_KEY for the migration");
    const keys = JSON.parse(execFileSync(binary, ["projects", "api-keys", "--project-ref", project, "-o", "json"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    }));
    secret = keys.find((entry) => entry.name === "service_role")?.api_key;
  }
  if (!secret) throw new Error("No migration credential available");
  writer = createClient(url, secret, options);
}
const fields = {
  categories: ["image_url"], subcategories: ["image_url"],
  products: ["images", "og_image_url"],
  homepage_hero_slides: ["desktop_image_url", "mobile_image_url"],
};
const rows = [];
const sources = new Set();
// Retain the application's existing static artwork while moving its hosting.
const staticSources = {
  balloonArch: "https://images.unsplash.com/photo-1756621716318-9eec89d42715?q=80&w=1200&auto=format&fit=crop&h=630",
  womanPortrait1: "https://images.unsplash.com/photo-1500771181897-517651ae4eda?q=80&w=480&auto=format&fit=crop&h=854",
  manPortrait1: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?q=80&w=480&auto=format&fit=crop&h=854",
  balloonWallPurplePink: "https://images.unsplash.com/photo-1587160728015-924483626a1a?q=80&w=480&auto=format&fit=crop&h=854",
  manPortrait2: "https://images.unsplash.com/photo-1523970592527-a59047319659?q=80&w=480&auto=format&fit=crop&h=854",
};
for (const source of Object.values(staticSources)) sources.add(source);
for (const [table, columns] of Object.entries(fields)) {
  // Anonymous reads alone omit inactive catalog records. The privileged client
  // is restricted here to exactly these public-catalog image columns and IDs.
  const { data, error } = await (writer || reader).from(table).select(["id", ...columns].join(","));
  if (error) throw new Error(`${table}: ${error.message}`);
  for (const row of data) {
    rows.push({ table, columns, row });
    for (const field of columns) {
      for (const value of Array.isArray(row[field]) ? row[field] : [row[field]]) {
        if (typeof value === "string" && /^https?:\/\//.test(value) && !value.startsWith(`${url}/storage/v1/object/public/catalog-images/`)) sources.add(value);
      }
    }
  }
}
const report = { mode: apply ? "apply" : "inspect", project, generatedAt: new Date().toISOString(), copies: [], updates: [], failures: [] };
const reportPath = "docs/catalog-image-migration-report.json";
const previous = apply && existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, "utf8")) : null;
const mapping = new Map();
for (const source of sources) {
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
    const type = response.headers.get("content-type")?.split(";")[0];
    const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "image/heic": "heic", "image/heif": "heif", "image/bmp": "bmp" };
    if (!extensions[type]) throw new Error(`Unsupported content type: ${type}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 4194304) throw new Error("Source exceeds the 4 MB image limit or is empty");
    const hash = createHash("sha256").update(source).digest("hex");
    const key = `imported/${hash}.${extensions[type]}`;
    const destination = `${url}/storage/v1/object/public/catalog-images/${key}`;
    if (apply) {
      const { error } = await writer.storage.from("catalog-images").upload(key, bytes, { contentType: type, cacheControl: "31536000", upsert: false });
      if (error && !["409", "Duplicate"].includes(String(error.statusCode)) && !/already exists/i.test(error.message)) throw new Error(error.message);
      const verify = await fetch(destination, { signal: AbortSignal.timeout(30000) });
      if (!verify.ok) throw new Error(`Destination HTTP ${verify.status}`);
      const copied = Buffer.from(await verify.arrayBuffer());
      if (!bytes.equals(copied)) throw new Error("Destination bytes differ from source");
      mapping.set(source, destination);
    }
    report.copies.push({ source, destination, bytes: bytes.length, verified: apply });
  } catch (error) {
    report.failures.push({ source, error: error.message });
  }
}
if (apply) {
  for (const { table, columns, row } of rows) {
    const patch = {};
    for (const field of columns) {
      const previous = row[field];
      const next = Array.isArray(previous) ? previous.map((v) => mapping.get(v) || v) : mapping.get(previous) || previous;
      if (JSON.stringify(previous) !== JSON.stringify(next)) patch[field] = next;
    }
    if (!Object.keys(patch).length) continue;
    // Compare the image snapshot to avoid overwriting an administrator's edit.
    let query = writer.from(table).update(patch).eq("id", row.id);
    for (const field of Object.keys(patch)) {
      const value = row[field];
      const filter = Array.isArray(value) ? `{${value.map((item) => JSON.stringify(item)).join(",")}}` : value;
      query = query.eq(field, filter);
    }
    const { data, error } = await query.select("id");
    if (error || data.length !== 1) report.failures.push({ table, id: row.id, error: error?.message || "Image fields changed during migration; rerun" });
    else report.updates.push({ table, id: row.id, fields: Object.keys(patch) });
  }
}
// Contains public image URLs and catalog IDs only, never secrets/private rows.
if (previous?.project === project && previous.mode === "apply") {
  report.copies = [...new Map([...previous.copies, ...report.copies].map((entry) => [entry.source, entry])).values()];
  report.updates = [...new Map([...previous.updates, ...report.updates].map((entry) => [`${entry.table}/${entry.id}`, entry])).values()];
}
if (apply && Object.values(staticSources).every((source) => mapping.has(source))) {
  const assets = Object.fromEntries(Object.entries(staticSources).map(([name, source]) => [name, mapping.get(source)]));
  writeFileSync("src/data/image-assets.json", JSON.stringify(assets, null, 2) + "\n");
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ mode: report.mode, sourceImages: sources.size, verifiedCopies: report.copies.filter((v) => v.verified).length, updatedRows: report.updates.length, failures: report.failures.length }));
if (report.failures.length) process.exitCode = 1;
