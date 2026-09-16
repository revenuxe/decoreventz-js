import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test("product event selection prefills booking at " + width, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/categories/birthday");
    await page.locator('a[href^="/categories/birthday/"]').filter({ has: page.locator("h3") }).first().click();
    const picker = page.getByRole("region", { name: "Event date and time" });
    await expect(picker).toBeVisible();
    await expect(picker.getByRole("textbox")).toHaveCount(0);
    await expect(picker.getByRole("button").filter({ hasText: "Today" })).toBeDisabled();
    await picker.getByRole("button").filter({ hasText: "Tmrw" }).click();
    await picker.getByRole("button", { name: "1 – 4 PM", exact: true }).click();
    await expect(picker.getByRole("button", { name: "1 – 4 PM", exact: true })).toHaveAttribute("aria-pressed", "true");
    await picker.getByRole("button", { name: "Choose another event date" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("baraabar_decor_booking_draft_v1")!));
    expect(saved.eventDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(saved.eventTime).toBe("1 – 4 PM");
    await page.reload();
    await expect(picker.getByRole("button", { name: "1 – 4 PM", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => localStorage.setItem("baraabar_decor_booking_step_v1", "2"));
    await page.getByRole("button", { name: "Book Now", exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/book/);
    await expect(page.getByRole("heading", { name: "When's the big day?" })).toBeVisible();
    await expect(picker.getByRole("button", { name: "1 – 4 PM", exact: true })).toHaveAttribute("aria-pressed", "true");
    const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("baraabar_decor_booking_draft_v1")!));
    expect(persisted.eventDate).toBe(saved.eventDate);
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page).toHaveURL(/\/auth/);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("baraabar_decor_booking_draft_v1")!).eventTime)).toBe("1 – 4 PM");
  });
}
