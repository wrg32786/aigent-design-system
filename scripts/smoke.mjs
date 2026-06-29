import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4177";
const pages = [
  "/",
  "/templates/free-design-stack/",
  "/templates/spline-scroll-landing/",
  "/templates/asset-scroll-gallery/"
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
];

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

const browser = await launchBrowser();

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    for (const url of pages) {
      const target = `${base}${url}`;
      await page.goto(target, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      const title = await page.title();
      const bodyText = await page.locator("body").innerText();
      const links = await page.locator("a").count();
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);

      if (!title) throw new Error(`${viewport.name} ${url}: missing title`);
      if (bodyText.trim().length < 80) throw new Error(`${viewport.name} ${url}: body text too sparse`);
      if (links < 1) throw new Error(`${viewport.name} ${url}: no links found`);
      if (horizontalOverflow) throw new Error(`${viewport.name} ${url}: horizontal overflow`);

      console.log(`[ok] ${viewport.name} ${url} :: ${title}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
