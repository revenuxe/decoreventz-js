import { expect, test } from "@playwright/test";
import { birthdayNavigation } from "../../src/components/birthday/navigation";

const route = "/birthday-decoration-bangalore";

test("birthday SEO, catalogue filters, FAQ and lead destinations", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await page.goto(route))?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page).toHaveTitle(
    "Birthday Decoration in Bangalore | Home & Theme Decor | DecorEventz",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://decoreventz.com${route}`,
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.flatMap((element) => JSON.parse(element.textContent || "null")),
    );
  const faq = schemas.find((schema) => schema?.["@type"] === "FAQPage");
  expect(faq.mainEntity).toHaveLength(8);
  for (const item of faq.mainEntity) {
    const detail = page
      .locator("details")
      .filter({ has: page.getByText(item.name, { exact: true }) });
    await detail.locator("summary").click();
    await expect(detail.locator("p")).toHaveText(item.acceptedAnswer.text);
  }
  await page
    .getByRole("button", { name: "Kids Birthday", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Kids Birthday", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "All", exact: true }).click();
  const whatsapp = page.locator('main a[href^="https://wa.me/"]');
  expect(await whatsapp.count()).toBeGreaterThan(0);
  for (const href of await whatsapp.evaluateAll((elements) =>
    elements.map((element) => (element as HTMLAnchorElement).href),
  )) {
    const url = new URL(href);
    expect(url.pathname).toBe("/917353373373");
    expect(url.searchParams.get("text")).toContain(
      "birthday decoration in Bangalore",
    );
  }
  await expect(
    page.getByRole("link", { name: "Get Free Decoration Quote", exact: true }),
  ).toHaveAttribute("href", "/contact");
  await expect(
    page.locator('footer a[href="/birthday-decoration-bangalore"]'),
  ).toHaveText("Birthday Decoration");
  const paths = await page
    .locator('main a[href^="/"]')
    .evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute("href")!)),
    ]);
  for (const path of paths)
    expect((await request.get(path)).status(), path).toBe(200);
  expect(errors).toEqual([]);
});

for (const width of [375, 390, 768, 1024, 1440]) {
  test(`birthday layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const actions = page.locator(".birthday-hero-actions a");
    await expect(actions).toHaveCount(2);
    const exploreBox = await actions.nth(0).boundingBox();
    const whatsappBox = await actions.nth(1).boundingBox();
    expect(Math.abs(exploreBox!.y - whatsappBox!.y)).toBeLessThan(2);
    await expect(actions.nth(1)).toHaveAttribute(
      "href",
      /https:\/\/wa.me\/917353373373/,
    );
    await expect(actions.nth(1).locator("svg")).toBeVisible();
    await expect(
      page.locator('[aria-labelledby="categories-heading"] img'),
    ).toHaveCount(8);
    await page
      .getByRole("heading", { name: "Decoration Services", exact: true })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    const bar = page.getByRole("complementary", {
      name: "Birthday decoration enquiry",
    });
    if (width < 768) await expect(bar).toBeVisible();
    else await expect(bar).toBeHidden();
    await page.evaluate(async () => {
      for (
        let top = 0;
        top < document.documentElement.scrollHeight;
        top += 800
      ) {
        window.scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      window.scrollTo(0, 0);
    });
    const loadedLayout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      elements: [...document.querySelectorAll("footer *")]
        .filter(
          (element) => element.getBoundingClientRect().right > innerWidth + 1,
        )
        .map((element) => `${element.tagName}.${element.className}`),
    }));
    expect(
      loadedLayout.width,
      JSON.stringify(loadedLayout),
    ).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: testInfo.outputPath(`birthday-${width}.png`),
      fullPage: true,
    });
  });
}

for (const category of birthdayNavigation) {
  test(`${category.label} landing page has unique SEO and working navigation`, async ({
    page,
  }) => {
    const path = `${route}/${category.slug}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Bangalore");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://decoreventz.com${path}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Bangalore/,
    );
    await expect(page.locator("main article")).not.toHaveCount(0);
    await expect(page.locator("main details")).toHaveCount(4);
    const question = page.locator("main details").first();
    await question.locator("summary").click();
    await expect(question.locator("p")).toBeVisible();
    await expect(
      page.locator('[aria-labelledby="related-heading"] a'),
    ).toHaveCount(8);
    await page.setViewportSize({ width: 375, height: 850 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(375);
  });
}

test("unknown birthday landing page returns 404", async ({ request }) => {
  expect((await request.get(`${route}/nonexistent-decoration`)).status()).toBe(
    404,
  );
});

test("homepage retains shared footer navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header")).toBeVisible();
  await expect(
    page.locator('footer a[href="/birthday-decoration-bangalore"]'),
  ).toBeVisible();
});
