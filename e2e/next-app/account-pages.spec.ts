import { test, expect } from "@playwright/test";

// Phase 4 of the migration — see docs/nextjs-migration-plan.md. Covers the
// signed-out shape of every authenticated page (Orders, Order detail,
// Profile, Addresses, Measurements, Drafts): each is a Server Component
// that checks auth itself (no test account is seeded for this suite, so
// signed-in behavior isn't covered here — see e2e/next-app/auth.spec.ts for
// why: sign-up/sign-in against the real Supabase backend isn't exercised in
// CI either).

test("orders list shows a sign-in gate when signed out, not the loading skeleton the old app had", async ({
  page,
}) => {
  await page.goto("/orders");
  await expect(page.getByText("Sign in to see your orders")).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\?redirect=%2Forders/);
});

test("order detail redirects straight to auth (server-side) when signed out", async ({
  page,
}) => {
  await page.goto("/orders/00000000-0000-0000-0000-000000000000");
  await expect(page).toHaveURL(/\/auth\?redirect=%2Forders%2F00000000-0000-0000-0000-000000000000/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("profile shows a sign-in gate when signed out", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Sign in to Baraabar" })).toBeVisible();
  await page.getByRole("link", { name: "Sign in / Create account" }).click();
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fprofile/);
});

test("profile addresses redirects straight to auth (server-side) when signed out", async ({
  page,
}) => {
  await page.goto("/profile/addresses");
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fprofile%2Faddresses/);
});

test("profile measurements redirects straight to auth (server-side) when signed out", async ({
  page,
}) => {
  await page.goto("/profile/measurements");
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fprofile%2Fmeasurements/);
});

test("drafts shows a sign-in gate when signed out", async ({ page }) => {
  await page.goto("/drafts");
  await expect(page.getByText("Sign in to save your designs")).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fdrafts/);
});

test("the desktop top bar links to the new Phase 4 pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Orders" }).click();
  await expect(page).toHaveURL(/\/orders/);

  await page.goto("/");
  await page.getByRole("link", { name: "Drafts" }).click();
  await expect(page).toHaveURL(/\/drafts/);
});

test("the mobile bottom nav links to Profile", async ({ page }) => {
  // BottomNav is md:hidden — needs a mobile-width viewport to be visible
  // and clickable, unlike the rest of this suite's desktop-viewport tests.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("link", { name: "Profile" }).click();
  await expect(page).toHaveURL(/\/profile/);
});
