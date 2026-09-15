// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const customer = "00000000-0000-4000-8000-000000000001";
const vendorUser = "00000000-0000-4000-8000-000000000002";
let db: PGlite;
async function sql<T = Record<string, unknown>>(query: string, values: unknown[] = []) { return (await db.query<T>(query, values)).rows; }
async function newBooking() {
  const [row] = await sql<{ id: string }>(`INSERT INTO bookings(user_id,event_date,event_time,venue_line1,venue_city,venue_pincode,venue_phone,total)
    VALUES ($1,'2026-12-01','18:00','Test venue','Bengaluru','560086','9999999999',1000) RETURNING id`, [customer]);
  return row.id;
}
async function insertItems(id: string) {
  await sql(`INSERT INTO booking_items(booking_id,category_slug,service_slug,service_name,unit_price,quantity)
    VALUES ($1,'test','test','Test decoration',500,1),($1,'test','test','Second decoration',500,1)`, [id]);
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`);
  const migrations = [
    "20260805200000_initial_schema.sql",
    "20260806010000_addons_library.sql",
    "20260806020000_bookings.sql",
    "20260806040000_add_vendor_role.sql",
    "20260806040100_vendors.sql",
    "20260806040200_vendor_booking_assignment.sql",
    "20260806050000_vendor_payments.sql",
    "20260806050100_fix_vendor_payment_status_cast.sql",
    "20260806050200_vendor_acceptance_and_self_payments.sql",
    "20260806060000_vendor_full_status_control.sql",
    "20260806070000_vendor_detailed_quote.sql",
    "20260806070100_vendor_finalize_payment.sql",
    "20260806080000_vendor_audit_defaults.sql",
    "20260808123000_booking_item_customizations.sql",
    "20260910000000_transactional_email.sql",
    "20260915000000_secure_checkout.sql",
  ];
  for (const name of migrations) await db.exec(readFileSync(resolve("supabase/migrations", name), "utf8"));
  await db.exec("GRANT USAGE ON SCHEMA auth, public TO authenticated; GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;");
  await sql("INSERT INTO auth.users(id,email) VALUES ($1,'customer@example.com'),($2,'vendor@example.com')", [customer, vendorUser]);
}, 30_000);
afterAll(async () => { await db?.close(); });

const product = "00000000-0000-4000-8000-000000000100";
const addon = "00000000-0000-4000-8000-000000000101";
const details = { event_date: "2099-12-01", event_time: "Morning", venue_line1: "Test venue", venue_city: "Bengaluru", venue_pincode: "560086", venue_phone: "9999999999" };
const lines = [{ product_id: product, quantity: 2, addon_ids: [addon], customizations: { balloon_choice: "Blue" } }];
async function checkout(id = randomUUID(), items: unknown = lines, total = 1100) {
  return sql<{id: string; order_code: string}>("SELECT * FROM create_booking($1,$2,$3,$4)", [id, JSON.stringify(details), JSON.stringify(items),total]);
}
beforeAll(async () => {
  await db.exec(`INSERT INTO categories(id,slug,name) VALUES ('00000000-0000-4000-8000-000000000099','birthday','Birthday');
    INSERT INTO products(id,category_id,slug,name,price,sale_price) VALUES ('${product}','00000000-0000-4000-8000-000000000099','test','Catalog name',700,500);
    INSERT INTO addons(id,name,price) VALUES ('${addon}','Cake',50);
    INSERT INTO product_addon_links(product_id,addon_id) VALUES ('${product}','${addon}');`);
  await sql("SELECT set_config('request.jwt.claim.sub',$1,false)",[customer]);
});

describe("secure checkout in PostgreSQL", () => {
  it("creates catalog-priced snapshots and reuses the same order on retries", async () => {
    const key=randomUUID(); const [first]=await checkout(key); const [retry]=await checkout(key);
    expect(retry).toEqual(first);
    const [row]=await sql<{total:string;status:string}>("SELECT total,status FROM bookings WHERE id=$1",[first.id]);
    expect(Number(row.total)).toBe(1100); expect(row.status).toBe("pending");
    const [item]=await sql<{service_name:string;unit_price:string;quantity:number}>("SELECT service_name,unit_price,quantity FROM booking_items WHERE booking_id=$1",[first.id]);
    expect(item.service_name).toBe("Catalog name"); expect(Number(item.unit_price)).toBe(500); expect(item.quantity).toBe(2);
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1",[`booking/${first.id}/created/%`])).toHaveLength(2);
    await expect(checkout(key,[{...lines[0],quantity:1}],550)).rejects.toThrow(/changed/);
  });
  it("rejects tampered totals, invalid quantities and unassigned add-ons without creating orders", async () => {
    const before=await sql("SELECT count(*) FROM bookings");
    await expect(checkout(randomUUID(),lines,1)).rejects.toThrow(/prices changed/);
    await expect(checkout(randomUUID(),[{...lines[0],quantity:-1}])).rejects.toThrow(/quantity/);
    await expect(checkout(randomUUID(),[{...lines[0],addon_ids:[randomUUID()]}])).rejects.toThrow(/add-on/);
    expect(await sql("SELECT count(*) FROM bookings")).toEqual(before);
  });
  it("rolls the booking and notifications back if line insertion fails", async () => {
    const before=await sql("SELECT count(*) FROM bookings");
    const mail=await sql("SELECT count(*) FROM email_outbox");
    await db.exec("ALTER TABLE booking_items ADD CONSTRAINT test_reject_items CHECK (quantity < 2) NOT VALID");
    try { await expect(checkout()).rejects.toThrow(/test_reject_items/); }
    finally { await db.exec("ALTER TABLE booking_items DROP CONSTRAINT test_reject_items"); }
    expect(await sql("SELECT count(*) FROM bookings")).toEqual(before);
    expect(await sql("SELECT count(*) FROM email_outbox")).toEqual(mail);
  });
  it("denies anonymous checkout",async()=>{
    await sql("SELECT set_config('request.jwt.claim.sub','',false)");
    try { await expect(checkout()).rejects.toThrow(/sign in/); }
    finally { await sql("SELECT set_config('request.jwt.claim.sub',$1,false)",[customer]); }
  });
  it("enforces browser RLS: no direct orders or self-approved vendors, but RPC checkout works",async()=>{
    await db.exec("SET ROLE authenticated");
    try {
      await expect(newBooking()).rejects.toThrow(/row-level security/);
      await expect(sql(`INSERT INTO vendors(user_id,business_name,contact_name,phone,address_line1,city,pincode,status)
        VALUES ($1,'Test','Test','999','Venue','Bengaluru','560086','approved')`,[customer])).rejects.toThrow(/row-level security/);
      await sql(`INSERT INTO vendors(user_id,business_name,contact_name,phone,address_line1,city,pincode)
        VALUES ($1,'Test','Test','999','Venue','Bengaluru','560086')`,[customer]);
      const [order]=await checkout(); expect(order.id).toBeTruthy();
      await expect(insertItems(order.id)).rejects.toThrow(/row-level security/);
    } finally { await db.exec("RESET ROLE"); }
  });
});
