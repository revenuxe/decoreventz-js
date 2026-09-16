import { test, expect } from "@playwright/test";

for (const path of ["/", "/categories", "/categories/birthday", "/cart", "/contact", "/terms", "/privacy"]) {
  test(`public page ${path} renders without a client crash`,async({page})=>{
    const crashes: string[]=[]; page.on("pageerror", e=>crashes.push(e.message));
    const response=await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1,h2").first()).toBeVisible();
    expect(crashes).toEqual([]);
  });
}
test("protected dashboards redirect signed-out visitors",async({page})=>{
  await page.goto("/admin/dashboard"); await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/vendor/dashboard"); await expect(page).toHaveURL(/\/vendor\/login/);
});
test("corrupted cart storage recovers to an empty cart",async({page})=>{
  await page.addInitScript(()=>localStorage.setItem("baraabar_cart_v1",JSON.stringify({invalid:true})));
  await page.goto("/cart"); await expect(page.getByRole("heading",{name:"Your cart is empty"})).toBeVisible();
});
test("setup selection reaches the event wizard and preserves the chosen date through sign-in",async({page})=>{
  await page.goto("/categories/birthday");
  await page.locator('a[href^="/categories/birthday/"]').filter({has:page.locator("h3")}).first().click();
  await page.getByRole("button",{name:"Book Now",exact:true}).filter({visible:true}).first().click();
  await expect(page).toHaveURL(/\/book/);
  await expect(page.getByRole("heading",{name:"When's the big day?"})).toBeVisible();
  const day=page.getByRole("button").filter({hasText:"Tmrw"});
  await day.click();
  await page.getByRole("button",{name:/10 AM/}).click();
  await page.getByRole("button",{name:/Continue/}).click();
  await expect(page).toHaveURL(/\/auth/);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("baraabar_decor_booking_draft_v1")!));
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const expected=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(tomorrow);
  expect(stored.eventDate).toBe(expected);
});


test("cart quantities synchronize between tabs",async({page,context})=>{
  await page.goto("/categories/birthday");
  await page.locator('a[href^="/categories/birthday/"]').filter({has:page.locator("h3")}).first().click();
  await page.getByRole("button",{name:"Add to Cart",exact:true}).filter({visible:true}).first().click();
  await page.goto("/cart");
  const other=await context.newPage(); await other.goto("/cart");
  const quantity=(tab:typeof page)=>tab.getByRole("button",{name:"Increase quantity"}).first().locator("..").locator("span");
  await expect(quantity(other)).toHaveText("1");
  await page.getByRole("button",{name:"Increase quantity"}).first().click();
  await expect(quantity(other)).toHaveText("2");
  await other.close();
});

test("cart stays usable when browser storage writes are blocked",async({page})=>{
  await page.addInitScript(()=>{ Storage.prototype.setItem=()=>{ throw new DOMException("Storage blocked","SecurityError"); }; });
  await page.goto("/categories/birthday");
  await page.locator('a[href^="/categories/birthday/"]').filter({has:page.locator("h3")}).first().click();
  await page.getByRole("button",{name:"Book Now",exact:true}).filter({visible:true}).first().click();
  await expect(page.getByRole("heading",{name:"When's the big day?"})).toBeVisible();
});


test("category image recovers immediately when optimization fails but the original works", async ({page}) => {
  const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jL1sAAAAASUVORK5CYII=", "base64");
  await page.route("**/_next/image?**",route=>route.fulfill({status:502,body:"Optimizer unavailable"}));
  await page.route("https://*.amazonaws.com/**",route=>route.fulfill({status:200,contentType:"image/png",body:pixel}));
  await page.goto("/categories/birthday");
  const img=page.getByAltText("Kids Birthday Balloon Decor",{exact:true});
  await page.getByRole("heading",{name:"Kids Birthday Balloon Decor",exact:true}).scrollIntoViewIfNeeded();
  await expect.poll(()=>img.evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
  await expect(img).toHaveAttribute("src",/^https:\/\//);
  await expect(page).toHaveURL(/\/categories\/birthday$/);
});

test("category image stops retrying and shows a clear fallback when the source is inaccessible",async({page})=>{
  let originalRequests=0;
  await page.route("**/_next/image?**",route=>route.fulfill({status:502,body:"Optimizer unavailable"}));
  await page.route("https://*.amazonaws.com/**",route=>{originalRequests++;return route.fulfill({status:403,body:"Access denied"});});
  await page.goto("/categories/birthday");
  const card=page.locator("a").filter({has:page.getByRole("heading",{name:"Kids Birthday Balloon Decor",exact:true})});
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole("img",{name:"Kids Birthday Balloon Decor ? image unavailable"})).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
  expect(originalRequests).toBeGreaterThan(0);
});
