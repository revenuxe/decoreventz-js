import { test, expect } from "@playwright/test";

test("design page shows the coming-soon state with working CTAs", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByText("Coming soon")).toBeVisible();
  await expect(page.getByRole("heading", { name: /AI Design Studio/i })).toBeVisible();

  await expect(page.getByRole("link", { name: /Book fabric pickup/i })).toHaveAttribute(
    "href",
    "/book",
  );

  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
