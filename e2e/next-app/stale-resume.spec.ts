import { test, expect } from "@playwright/test";

// Mirrors e2e/legacy/stale-resume.spec.ts against this app's ported /book.
//
// /book is a genuinely dynamic SSR route (fresh Supabase fetch + full
// client hydration on every direct load), unlike the simpler pages
// elsewhere in this suite. A direct goto()/reload() into it can land
// Playwright's very next click in the narrow window where the
// server-rendered button is visible but React hasn't finished attaching
// its handler yet — the click "succeeds" against the DOM node but is a
// no-op app-wise. waitForLoadState("networkidle") after each such
// navigation avoids that race; it's not needed after client-side <Link>
// navigations from an already-hydrated page, which don't hit it.
test("'Book Now' with no prior handoff always starts fresh at Outfit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book Now" }).click();

  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
});

test("refreshing mid-flow with no completed handoff resets to step 1, not the step you were on", async ({
  page,
}) => {
  await page.goto("/book");
  await page.waitForLoadState("networkidle");
  await page.locator("main button").first().click(); // category -> step 2
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
});

test("a completed handoff (matching draft + step) is restored once, then cleared", async ({
  page,
}) => {
  await page.goto("/book");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.setItem(
      "baraabar_booking_draft_v2",
      JSON.stringify({
        category: "women",
        items: [{ garment: "Shirt", quantity: 1, references: [] }],
        fabrics: [],
        notes: "",
        wantsStylistCall: false,
        measurementMode: "sample",
        address: { line1: "", line2: "", city: "", pincode: "", phone: "" },
        deliverySame: true,
      }),
    );
    localStorage.setItem("baraabar_booking_step_v1", "2");
  });

  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();
  await expect(page.getByText("Show us what you want")).toBeVisible();

  const remaining = await page.evaluate(() => ({
    draft: localStorage.getItem("baraabar_booking_draft_v2"),
    step: localStorage.getItem("baraabar_booking_step_v1"),
  }));
  expect(remaining.draft).toBeNull();
  expect(remaining.step).toBeNull();

  await page.reload();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
});
