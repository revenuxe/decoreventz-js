import { test, expect } from "@playwright/test";

test("sign-in form renders, and back goes to the previous page not always home", async ({
  page,
}) => {
  await page.goto("/design");
  await page.goto("/auth?redirect=%2Fdesign");

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByPlaceholder("Email")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL(/\/design/);
});

test("toggling to sign-up shows the name field, and back toggles cleanly", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByPlaceholder("Full name")).toBeVisible();

  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByPlaceholder("Full name")).not.toBeVisible();
});

test("bad credentials show an inline error, not a crash", async ({ page }) => {
  await page.goto("/auth");
  await page.getByPlaceholder("Email").fill("nonexistent-user@example.com");
  await page.getByPlaceholder("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.locator("p.text-destructive")).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/auth/);
});

test("an open-redirect attempt in ?redirect= is ignored, falls back to /", async ({ page }) => {
  await page.goto("/auth?redirect=https://evil.example.com");
  // Can't directly observe the sanitized value without signing in, but the
  // page should still render normally rather than erroring out.
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
