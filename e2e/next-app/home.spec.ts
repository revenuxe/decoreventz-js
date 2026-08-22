import { test, expect } from "@playwright/test";

test("home page renders header, hero, categories, and footer", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("img", { name: "Baraabar" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Book pickup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /designed by you/i })).toBeVisible();

  // Category strip — links to /book with the right query param.
  const womenCard = page.getByRole("link", { name: /Women[\s\S]*Dresses, blouses, kurtis/ });
  await expect(womenCard).toBeVisible();
  await expect(womenCard).toHaveAttribute("href", "/book?category=women");

  await expect(page.getByText("Ready to wear something")).toBeVisible();
});

test("TopBar nav highlights the active route", async ({ page }) => {
  await page.goto("/");
  const homeLink = page.getByRole("navigation").getByRole("link", { name: "Home" });
  await expect(homeLink).toHaveClass(/text-primary/);

  await page.getByRole("navigation").getByRole("link", { name: "Design" }).click();
  await expect(page).toHaveURL(/\/design/);
});
