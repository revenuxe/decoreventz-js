import { test, expect } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 900 }, { width: 800, height: 500 }, { width: 390, height: 700 }]) {
  test("long category menu stays usable at " + viewport.width, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/rest/v1/categories?*", route => route.fulfill({ json: Array.from({ length: 15 }, (_, i) => ({ slug: "category-" + i, name: i === 0 ? "Birthday" : "Category " + i })) }));
    await page.route("**/rest/v1/subcategories?*", route => route.fulfill({ json: Array.from({ length: 30 }, (_, i) => ({ slug: "sub-" + i, name: "Birthday decoration " + i, categories: { slug: "category-0" } })) }));
    await page.route("**/rest/v1/products?*", route => route.fulfill({ json: [] }));
    await page.goto("/contact");
    const trigger = page.getByRole("button", { name: "Birthday", exact: true }).filter({ visible: true });
    if (viewport.width >= 768) await trigger.hover(); else await trigger.click();
    const panel = page.locator(viewport.width >= 768 ? "#desktop-category-menu" : "#mobile-category-menu");
    await expect(panel).toBeVisible();
    const bounds = await panel.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
    const scroller = viewport.width >= 768 ? panel.locator('[aria-label="Subcategories"]') : panel;
    expect(await scroller.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await panel.getByRole("link", { name: "Birthday decoration 29", exact: true }).scrollIntoViewIfNeeded();
    expect(await scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(panel.getByRole("button", { name: "Close category menu" })).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    if (viewport.width >= 768) {
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(panel).toBeVisible();
      await panel.getByRole("link", { name: "Birthday decoration 29", exact: true }).focus();
      await expect(panel.locator('[aria-label="Popular decorations"]')).toContainText("Birthday decoration 29");
      await panel.getByRole("button", { name: "Close category menu" }).click();
      await expect(panel).not.toBeVisible();
    }
  });
}
