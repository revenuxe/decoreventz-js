import { test, expect, type Page } from "@playwright/test";

// Phase 3 of the migration — see docs/nextjs-migration-plan.md. Mirrors
// e2e/legacy/booking-flow.spec.ts's coverage against this app's own ported
// /book route (app/book/page.tsx + book-wizard.tsx), which now fetches
// catalog data server-side (SSR) instead of client-side after mount.

async function selectFirstCategory(page: Page) {
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
  await page.locator("main button").first().click();
}

async function selectFirstGarment(page: Page) {
  await expect(page.getByText("What are we making?")).toBeVisible();
  // GarmentTypeCard renders two overlapping click targets that both call
  // onToggle (the card "plate" and an image button that visually overflows
  // on top of it — see src/components/GarmentTypeCard.tsx). Target the
  // image button directly since it's the one actually on top.
  await page.locator("main").locator("button:has(img)").first().click();
}

test("unauthenticated booking wizard works through Measure, then shows a sign-in gate before Pickup", async ({
  page,
}) => {
  await page.goto("/book");
  await page.waitForLoadState("networkidle");

  await selectFirstCategory(page);
  await selectFirstGarment(page);

  await page.getByRole("button", { name: "Continue" }).click(); // Design (optional)
  await expect(page.getByText("Show us what you want")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // Fabric (optional)
  await expect(page.getByText(/What type of fabric/i)).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // Measure
  await expect(page.getByText("How should we measure")).toBeVisible();
  // Defaults to "sample" mode already, so Continue is enabled without
  // picking anything — this is intentional product behavior, not a gap.
  await page.getByRole("button", { name: "Continue" }).click();

  // Pickup requires an account — signed out, this shows a static gate
  // (not an auto-redirect) with its own explicit "Sign in" button.
  await expect(page.getByText("Sign in to continue")).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth/);
});

test("back navigation steps back one screen at a time, not out of the wizard", async ({
  page,
}) => {
  // Navigate in from the homepage (not page.goto("/book") directly) so
  // there's a genuine prior history entry to land on once the wizard's
  // own step history is exhausted — otherwise "back" has nowhere to go
  // and the assertion below would pass for the wrong reason.
  await page.goto("/");
  await page.getByRole("link", { name: "Book pickup" }).click();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();

  await selectFirstCategory(page);
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  await selectFirstGarment(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();

  // The regression this guards: browser back must land on step 2, not
  // exit straight to the homepage.
  await page.goBack();
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  await page.goBack();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  // One more back from the first step should finally leave the wizard.
  await page.goBack();
  await expect(page).not.toHaveURL(/\/book/);
});

test("clicking the in-app Back button repeatedly walks back through every step", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book pickup" }).click();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();

  await selectFirstCategory(page);
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  await selectFirstGarment(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 4 of \d+/)).toBeVisible();

  const backButton = page.getByRole("button", { name: "Back", exact: true }).last();
  for (const expectedStep of [3, 2, 1]) {
    await backButton.click();
    await expect(page.getByText(new RegExp(`Step ${expectedStep} of \\d+`))).toBeVisible();
    await expect(page).toHaveURL(/\/book/);
  }
  await backButton.click();
  await expect(page).not.toHaveURL(/\/book/);
});

test("a restored handoff landing on Pickup while still signed out clamps back to Measure", async ({
  page,
}) => {
  // Seed localStorage via an init script (runs before any page script,
  // including the very first mount) rather than goto -> evaluate -> reload
  // — the latter has a brief window where the first mount's own effects
  // (anchoring history, the "resume most recent account draft" check) can
  // race the manually-injected localStorage write.
  await page.addInitScript(() => {
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
    localStorage.setItem("baraabar_booking_step_v1", "5");
  });
  await page.goto("/book");
  await expect(page).not.toHaveURL(/\/auth/);
  await expect(page.getByText(/Step 5 of \d+/)).toBeVisible();
  await expect(page.getByText("How should we measure")).toBeVisible();
});

test("category card deep link (?category=) jumps straight to Garment", async ({ page }) => {
  await page.goto("/");
  const womenCard = page.getByRole("link", { name: /Women[\s\S]*Dresses, blouses, kurtis/ });
  await womenCard.click();
  await expect(page).toHaveURL(/\/book\?category=women/);
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();
  await expect(page.getByText("What are we making?")).toBeVisible();
});
