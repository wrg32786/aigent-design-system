import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4177";
const pages = [
  "/",
  "/vault/",
  "/templates/modular-scroll-starter/",
  "/templates/immersive-sales-deck/",
  "/templates/command-center-interface/",
  "/templates/threejs-product-stage/",
  "/templates/free-design-stack/",
  "/templates/spline-scroll-landing/",
  "/templates/asset-scroll-gallery/"
];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
];

async function launchBrowser() {
  try { return await chromium.launch({ channel: "chrome", headless: true }); }
  catch { return chromium.launch({ headless: true }); }
}

const browser = await launchBrowser();
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const url of pages) {
      errors.length = 0;
      await page.goto(`${base}${url}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      const title = await page.title();
      const bodyText = await page.locator("body").innerText();
      const links = await page.locator("a").count();
      const h1s = await page.locator("h1").count();
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);

      if (!title) throw new Error(`${viewport.name} ${url}: missing title`);
      if (bodyText.trim().length < 80) throw new Error(`${viewport.name} ${url}: body text too sparse`);
      if (links < 1) throw new Error(`${viewport.name} ${url}: no links found`);
      if (h1s !== 1) throw new Error(`${viewport.name} ${url}: expected one h1, found ${h1s}`);
      if (horizontalOverflow) throw new Error(`${viewport.name} ${url}: horizontal overflow`);
      if (errors.length) throw new Error(`${viewport.name} ${url}: page error: ${errors.join(" | ")}`);

      if (url === "/templates/modular-scroll-starter/") {
        await page.locator('[data-set-theme="paper"]').click();
        const theme = await page.locator("html").getAttribute("data-theme");
        const pressed = await page.locator('[data-set-theme="paper"]').getAttribute("aria-pressed");
        if (theme !== "paper" || pressed !== "true") throw new Error(`${viewport.name} ${url}: theme picker state failed`);
      }

      if (url === "/templates/immersive-sales-deck/") {
        await page.locator("#next").click();
        if ((await page.locator("#slide-label").innerText()) !== "Slide 2 of 6") throw new Error(`${viewport.name} ${url}: deck navigation failed`);
        await page.locator("#previous").click();
      }

      if (url === "/templates/command-center-interface/") {
        await page.locator("#search").fill("registry");
        if ((await page.locator("#queue-list button").count()) !== 1) throw new Error(`${viewport.name} ${url}: queue filtering failed`);
        await page.locator("#open-palette").click();
        if (!(await page.locator("#command-dialog").evaluate((node) => node.open))) throw new Error(`${viewport.name} ${url}: command palette failed`);
        await page.keyboard.press("Escape");
      }

      if (url === "/templates/threejs-product-stage/") {
        const status = await page.locator("#status").innerText();
        if (!/fallback|active|loading/i.test(status)) throw new Error(`${viewport.name} ${url}: progressive 3D status missing`);
      }

      if (url === "/vault/") {
        await page.waitForFunction(() => document.querySelectorAll("#items .item").length >= 8);
        await page.locator("#search").fill("deck");
        if ((await page.locator("#items .item").count()) < 1) throw new Error(`${viewport.name} ${url}: catalog search failed`);
      }

      console.log(`[ok] ${viewport.name} ${url} :: ${title}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
