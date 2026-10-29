// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";

let db: PGlite;
const admin = "00000000-0000-4000-8000-000000000001";
const vendor = "00000000-0000-4000-8000-000000000002";
const customer = "00000000-0000-4000-8000-000000000003";
const stranger = "00000000-0000-4000-8000-000000000004";
const booking = "00000000-0000-4000-8000-000000000010";
const proof = `bookings/${booking}/team/proof.jpg`;

async function asUser(user: string, sql: string) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
  await db.exec("set role authenticated");
  try { return await db.query(sql); } finally { await db.exec("reset role"); }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role authenticated; create role anon;
    create schema auth; create schema storage;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create function public.has_role(_id uuid, _role text) returns boolean language sql stable as $$ select _id = '${admin}'::uuid and _role = 'admin' $$;
    create table public.bookings(id uuid, user_id uuid, assigned_vendor_id uuid);
    create table public.vendors(id uuid, user_id uuid, status text);
    create table public.categories(image_url text);
    create table public.subcategories(image_url text);
    create table public.products(images text[]);
    create table public.homepage_hero_slides(desktop_image_url text);
    create table public.decoration_content_items(content jsonb);
    create table public.booking_items(image text);
    create table public.profiles(avatar_url text);
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema auth,public,storage to authenticated,anon;
    grant select,insert,delete on storage.objects to authenticated,anon;
    create policy "Public read catalog images" on storage.objects for select using(bucket_id='catalog-images');
    insert into public.vendors values ('${vendor}','${vendor}','approved');
    insert into public.bookings values ('${booking}','${customer}','${vendor}');
    insert into storage.objects values ('booking-images','${proof}');
  `);
  await db.exec(readFileSync("supabase/migrations/20261029000000_supabase_image_storage.sql", "utf8"));
}, 30000);
afterAll(async () => { await db?.close(); });

it("restricts private proof reads to the customer, assigned vendor and admin", async () => {
  for (const user of [admin, vendor, customer]) {
    expect((await asUser(user, "select * from storage.objects where bucket_id='booking-images'")).rows).toHaveLength(1);
  }
  expect((await asUser(stranger, "select * from storage.objects where bucket_id='booking-images'")).rows).toHaveLength(0);
  await db.exec("set role anon");
  try { expect((await db.query("select * from storage.objects where bucket_id='booking-images'")).rows).toHaveLength(0); }
  finally { await db.exec("reset role"); }
});

it("rejects unrelated uploads, customer writes and malformed booking paths", async () => {
  for (const user of [customer, stranger]) {
    await expect(asUser(user, `insert into storage.objects values ('booking-images','${proof}')`)).rejects.toThrow(/row-level security/);
  }
  await expect(asUser(vendor, "insert into storage.objects values ('booking-images','bookings/not-a-booking/team/a.jpg')")).rejects.toThrow(/row-level security/);
  await asUser(vendor, `insert into storage.objects values ('booking-images','bookings/${booking}/decoration/new.jpg')`);
  expect((await asUser(vendor, "delete from storage.objects where name like '%new.jpg' returning *")).rows).toHaveLength(0);
});

it("retains catalog objects referenced by historical booking snapshots", async () => {
  const image = "https://example.supabase.co/storage/v1/object/public/catalog-images/products/a.jpg";
  await db.query("insert into public.booking_items values ($1)", [image]);
  await db.exec("insert into storage.objects values ('catalog-images','products/a.jpg'),('catalog-images','products/unused.jpg')");
  expect((await asUser(admin, "delete from storage.objects where name='products/a.jpg' returning *")).rows).toHaveLength(0);
  expect((await asUser(admin, "delete from storage.objects where name='products/unused.jpg' returning *")).rows).toHaveLength(1);
});
