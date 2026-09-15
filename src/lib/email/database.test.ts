// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
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
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;`);
  const migrations = [
    "20260805200000_initial_schema.sql",
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
    "20260910000000_transactional_email.sql",
    "20260916000000_booking_email_operations_only.sql",
  ];
  for (const name of migrations) await db.exec(readFileSync(resolve("supabase/migrations", name), "utf8"));
  await sql("INSERT INTO auth.users(id,email) VALUES ($1,'customer@example.com'),($2,'vendor@example.com')", [customer, vendorUser]);
}, 30_000);
afterAll(async () => { await db?.close(); });
describe("real PostgreSQL email migration", () => {
  it("queues once after line items are committed, not for an incomplete booking", async () => {
    const id = await newBooking();
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1", [`booking/${id}/created/%`])).toHaveLength(0);
    await insertItems(id);
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1", [`booking/${id}/created/%`])).toHaveLength(1);
    await insertItems(id);
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1", [`booking/${id}/created/%`])).toHaveLength(1);
  });
  it("rolls back notifications with the source transaction", async () => {
    const id = await newBooking();
    await db.exec("BEGIN");
    await insertItems(id);
    await db.exec("ROLLBACK");
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1", [`booking/${id}/created/%`])).toHaveLength(0);
  });
  it("queues status changes, assignments, quotes, bills, payments and vendor reviews", async () => {
    await sql(`INSERT INTO vendors(user_id,business_name,contact_name,phone,address_line1,city,pincode)
      VALUES ($1,'Vendor Business','Vendor Contact','999','Venue','Bengaluru','560086')`, [vendorUser]);
    const [vendor] = await sql<{ id: string }>("SELECT id FROM vendors WHERE user_id = $1", [vendorUser]);
    const id = await newBooking();
    await insertItems(id);
    await sql("UPDATE bookings SET status='confirmed', assigned_vendor_id=$2 WHERE id=$1", [id, vendor.id]);
    await sql("UPDATE bookings SET vendor_accepted_at=now(), vendor_quote_amount=100 WHERE id=$1", [id]);
    await sql("UPDATE bookings SET vendor_quote_amount=200 WHERE id=$1", [id]);
    await sql("UPDATE bookings SET vendor_bill_amount=200 WHERE id=$1", [id]);
    await sql("INSERT INTO vendor_payments(booking_id,amount) VALUES ($1,50)", [id]);
    await sql("UPDATE vendors SET status='approved' WHERE id=$1", [vendor.id]);
    const rows = await sql<{ recipient: string; payload: { title: string; rows: [string,string][]; path: string } }>("SELECT recipient,payload FROM email_outbox");
    expect(rows.every((row) => row.recipient === "decoreventz.com@gmail.com")).toBe(true);
    const titles = rows.map((row) => row.payload.title).join("|");
    for (const expected of ["Booking status updated","Vendor assignment updated","Vendor quote updated","Vendor bill updated","Vendor payment updated"]) expect(titles).toContain(expected);
    for (const row of rows.filter((row) => row.recipient === "customer@example.com")) {
      expect(JSON.stringify(row.payload)).not.toContain("Vendor quote");
      expect(row.payload.path).toMatch(/^\/bookings\//);
    }
  });
  it("stores contacts atomically, deduplicates retries, and rate limits", async () => {
    const submit = (id: string, message = "Please help with my booking") => sql<{ result: string }>("SELECT submit_contact($1,'Test','contact@example.com','','', $2,'hashed-ip') AS result", [id,message]);
    const id = "00000000-0000-4000-8000-000000000010";
    expect((await submit(id))[0].result).toBe("accepted");
    expect((await submit(id))[0].result).toBe("accepted");
    expect((await submit(id,"Changed message"))[0].result).toBe("conflict");
    expect(await sql("SELECT id FROM email_outbox WHERE event_key LIKE $1", [`contact/${id}/%`])).toHaveLength(0);
    await submit("00000000-0000-4000-8000-000000000011");
    await submit("00000000-0000-4000-8000-000000000012");
    expect((await submit("00000000-0000-4000-8000-000000000013"))[0].result).toBe("rate_limited");
  });
  it("claims distinct entries and recovers an expired lease with a new token", async () => {
    const [first] = await sql<{ id: string; lock_token: string }>("SELECT * FROM claim_email()");
    const [second] = await sql<{ id: string }>("SELECT * FROM claim_email()");
    expect(first.id).not.toBe(second.id);
    await sql("UPDATE email_outbox SET locked_until=now()-interval '1 minute',available_at=now()-interval '1 day' WHERE id=$1", [first.id]);
    const [reclaimed] = await sql<{ id: string; lock_token: string }>("SELECT * FROM claim_email()");
    expect(reclaimed.id).toBe(first.id);
    expect(reclaimed.lock_token).not.toBe(first.lock_token);
    expect(await sql("UPDATE email_outbox SET status='sent' WHERE id=$1 AND lock_token=$2 RETURNING id", [first.id,first.lock_token])).toHaveLength(0);
  });
  it("stops automatic retries beyond the provider deduplication window", async () => {
    const [row] = await sql<{ id: string }>("SELECT id FROM email_outbox LIMIT 1");
    await sql("UPDATE email_outbox SET status='pending',locked_until=NULL,first_attempt_at=now()-interval '25 hours' WHERE id=$1", [row.id]);
    await sql("SELECT * FROM claim_email()");
    expect((await sql<{ status: string }>("SELECT status FROM email_outbox WHERE id=$1", [row.id]))[0].status).toBe("failed");
  });
  it("denies browser roles access to queue, contacts, and privileged RPCs", async () => {
    const [row] = await sql<{ table_access: boolean; rpc_access: boolean }>(`SELECT
      has_table_privilege('anon','public.email_outbox','INSERT') AS table_access,
      has_function_privilege('authenticated','public.submit_contact(uuid,text,text,text,text,text,text)','EXECUTE') AS rpc_access`);
    expect(row.table_access).toBe(false);
    expect(row.rpc_access).toBe(false);
  });
});
