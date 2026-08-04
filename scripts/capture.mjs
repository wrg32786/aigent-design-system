#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4177";
const out = path.resolve(process.env.CAPTURE_DIR || "artifacts/visual");
const pages = [
  { id: "home", url: "/" },
  { id: "cinematic-page", url: "/templates/modular-scroll-starter/" },
  { id: "immersive-sales-deck", url: "/templates/immersive-sales-deck/" },
  { id: "command-center-interface", url: "/templates/command-center-interface/" },
  { id: "threejs-product-stage", url: "/templates/threejs-product-stage/" },
  { id: "design-vault", url: "/vault/" }
];
const viewports = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "mobile", width: 390, height: 844 }
];

async function preparePage(page) {
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(async () => {
    const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const step = Math.max(240, Math.floor(window.innerHeight * 0.72));
    let position = 0;
    let maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    while (position < maximum) {
      position = Math.min(maximum, position + step);
      window.scrollTo(0, position);
      await pause(70);
      maximum = Math.max(maximum, document.documentElement.scrollHeight - window.innerHeight);
    }

    window.scrollTo(0, 0);
    await pause(180);
  });
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const manifest = [];

try {
  for (const viewport of viewports) {
    for (const item of pages) {
      const page = await browser.newPage({ viewport });
      await page.goto(`${base}${item.url}`, { waitUntil: "networkidle" });
      await preparePage(page);
      const filename = `${item.id}-${viewport.id}.png`;
      await page.screenshot({ path: path.join(out, filename), fullPage: true, animations: "disabled" });
      manifest.push({ ...item, viewport, file: filename, reducedMotion: false });
      await page.close();
    }
  }

  for (const item of pages.filter((page) => ["cinematic-page", "immersive-sales-deck", "threejs-product-stage"].includes(page.id))) {
    const page = await browser.newPage({ viewport: viewports[0], reducedMotion: "reduce" });
    await page.goto(`${base}${item.url}`, { waitUntil: "networkidle" });
    await preparePage(page);
    const filename = `${item.id}-reduced-motion.png`;
    await page.screenshot({ path: path.join(out, filename), fullPage: true, animations: "disabled" });
    manifest.push({ ...item, viewport: viewports[0], file: filename, reducedMotion: true });
    await page.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(out, "manifest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), captures: manifest }, null, 2)}\n`);
console.log(`Captured ${manifest.length} visual proofs in ${path.relative(process.cwd(), out)}.`);
