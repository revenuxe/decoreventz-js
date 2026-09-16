import { test, expect } from "@playwright/test";

const photo = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="pink"/></svg>';

for (const width of [390, 1440]) {
  test("catalog images recover from optimizer errors at width " + width, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    const crashes: string[] = [];
    page.on("pageerror", (error) => crashes.push(error.message));
    await page.route("**/_next/image?**", (route) => {
      const source = new URL(route.request().url()).searchParams.get("url") ?? "";
      return source.startsWith("https://")
        ? route.fulfill({ status: 502, body: "Optimizer unavailable" })
        : route.continue();
    });
    await page.route((url) => url.hostname.endsWith(".amazonaws.com"), (route) =>
      route.fulfill({ status: 200, contentType: "image/svg+xml", body: photo }),
    );
    await page.goto("/");
    const hero = page.locator('main section').first().locator('img:visible');
    await expect(hero).toHaveCount(1);
    await expect.poll(() => hero.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(hero).toHaveAttribute("src", /^https:/);

    const product = page.locator('a[href^="/categories/"]').filter({ has: page.locator("h3") }).filter({ has: page.locator("img") }).first();
    await product.scrollIntoViewIfNeeded();
    await expect.poll(() => product.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await product.click();
    const gallery = page.locator('img[alt*=" photo "]').first();
    await expect(gallery).toBeVisible();
    await expect.poll(() => gallery.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(gallery).toHaveAttribute("src", /^https:/);
    expect(crashes).toEqual([]);
  });
}
