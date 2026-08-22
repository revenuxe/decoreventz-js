import { test, expect } from "@playwright/test";

// Phase 5 of the migration — see docs/nextjs-migration-plan.md §7. Mirrors
// e2e/legacy/admin-gating.spec.ts, but proves the stronger property that
// migration was meant to deliver: gating happens in proxy.ts (middleware)
// before any admin HTML/JS ships, not client-side after the bundle mounts.

test("visiting the admin dashboard while signed out redirects to admin login", async ({
  page,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Admin sign-in" })).toBeVisible();
});

test("the bare /admin index redirects to admin login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin login form renders with the expected fields", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin sign-in" })).toBeVisible();
  await expect(page.getByPlaceholder("admin@baraabar.com")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();
});

test("bad admin credentials show an inline error, not a crash", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("admin@baraabar.com").fill("nonexistent-admin@example.com");
  await page.getByPlaceholder("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.locator("p.text-destructive")).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/admin\/login/);
});
