import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4177";
const pages = [
  "/",
  "/vault/",
  "/inspiration/lab/",
  "/templates/modular-scroll-starter/",
  "/templates/immersive-sales-deck/",
  "/templates/command-center-interface/",
  "/templates/threejs-product-stage/",
  "/templates/free-design-stack/",
  "/templates/spline-scroll-landing/",
  "/templates/asset-scroll-gallery/",
];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function text(locator) {
  return ((await locator.textContent()) || "").trim();
}

async function verifyScrollReveals(page, label) {
  const reveals = page.locator("[data-reveal]");
  const total = await reveals.count();
  if (!total) return;

  for (let index = 0; index < total; index += 1) {
    await reveals.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(130);
  }
  await page.waitForTimeout(800);

  const hidden = await reveals.evaluateAll((nodes) => nodes
    .filter((node) => {
      const style = getComputedStyle(node);
      return Number(style.opacity) < 0.95 || style.visibility === "hidden";
    })
    .map((node) => node.textContent?.trim().slice(0, 60) || node.tagName));

  if (hidden.length) {
    throw new Error(
      `${label}: ${hidden.length} scroll reveals remained hidden: ${hidden.slice(0, 3).join(" | ")}`,
    );
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
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
      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2,
      );

      if (!title) throw new Error(`${viewport.name} ${url}: missing title`);
      if (bodyText.trim().length < 80) throw new Error(`${viewport.name} ${url}: body text too sparse`);
      if (links < 1) throw new Error(`${viewport.name} ${url}: no links found`);
      if (h1s !== 1) throw new Error(`${viewport.name} ${url}: expected one h1, found ${h1s}`);
      if (horizontalOverflow) throw new Error(`${viewport.name} ${url}: horizontal overflow`);
      if (errors.length) throw new Error(`${viewport.name} ${url}: page error: ${errors.join(" | ")}`);

      if (url === "/" || url === "/templates/modular-scroll-starter/") {
        await verifyScrollReveals(page, `${viewport.name} ${url}`);
      }

      if (url === "/templates/modular-scroll-starter/") {
        const mobileTheme = page.locator("#mobile-theme");
        if (viewport.name === "mobile" && await mobileTheme.isVisible()) {
          await mobileTheme.selectOption("paper");
        } else {
          await page.locator('[data-set-theme="paper"]').click();
        }
        const theme = await page.locator("html").getAttribute("data-theme");
        const pressed = await page.locator('[data-set-theme="paper"]').getAttribute("aria-pressed");
        if (theme !== "paper" || pressed !== "true") {
          throw new Error(`${viewport.name} ${url}: theme picker state failed`);
        }
      }

      if (url === "/templates/immersive-sales-deck/") {
        await page.waitForFunction(() => document.documentElement.dataset.deckReady === "true");
        if ((await text(page.locator("#slide-label"))) !== "Slide 1 of 6") {
          throw new Error(`${viewport.name} ${url}: deck initial state failed`);
        }
        await page.locator("#next").click();
        await page.waitForFunction(() => document.documentElement.dataset.activeSlide === "2");
        if ((await text(page.locator("#slide-label"))) !== "Slide 2 of 6") {
          throw new Error(`${viewport.name} ${url}: deck navigation failed`);
        }
        await page.locator("#previous").click();
        await page.waitForFunction(() => document.documentElement.dataset.activeSlide === "1");
      }

      if (url === "/templates/command-center-interface/") {
        await page.locator("#search").fill("registry");
        if ((await page.locator("#queue-list button").count()) !== 1) {
          throw new Error(`${viewport.name} ${url}: queue filtering failed`);
        }
        await page.locator("#open-palette").click();
        if (!(await page.locator("#command-dialog").evaluate((node) => node.open))) {
          throw new Error(`${viewport.name} ${url}: command palette failed`);
        }
        await page.keyboard.press("Escape");
      }

      if (url === "/templates/threejs-product-stage/") {
        const status = await text(page.locator("#status"));
        if (!/fallback|active|loading/i.test(status)) {
          throw new Error(`${viewport.name} ${url}: progressive 3D status missing`);
        }
      }

      if (url === "/vault/") {
        await page.waitForFunction(() => document.querySelectorAll("#items .item").length >= 8);
        await page.locator("#search").fill("inspiration");
        if ((await page.locator("#items .item").count()) < 1) {
          throw new Error(`${viewport.name} ${url}: Inspiration Intelligence is missing from the catalog`);
        }
      }

      if (url === "/inspiration/lab/") {
        await page.waitForFunction(() => document.querySelectorAll("#sources .source").length === 3);
        if ((await page.locator("#matrix .row").count()) !== 6) {
          throw new Error(`${viewport.name} ${url}: reference matrix is incomplete`);
        }
        await page.locator("#synthesize").click();
        await page.waitForFunction(() => !document.querySelector("#ledger").hidden);
        if ((await page.locator("#ledger-list li").count()) !== 3) {
          throw new Error(`${viewport.name} ${url}: influence ledger is incomplete`);
        }
      }

      console.log(`[ok] ${viewport.name} ${url} :: ${title}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
