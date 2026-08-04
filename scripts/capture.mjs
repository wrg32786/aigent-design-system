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

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const manifest = [];

try {
  for (const viewport of viewports) {
    for (const item of pages) {
      const page = await browser.newPage({ viewport });
      await page.goto(`${base}${item.url}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(250);
      const filename = `${item.id}-${viewport.id}.png`;
      await page.screenshot({ path: path.join(out, filename), fullPage: true, animations: "disabled" });
      manifest.push({ ...item, viewport, file: filename, reducedMotion: false });
      await page.close();
    }
  }

  for (const item of pages.filter((page) => ["cinematic-page", "immersive-sales-deck", "threejs-product-stage"].includes(page.id))) {
    const page = await browser.newPage({ viewport: viewports[0], reducedMotion: "reduce" });
    await page.goto(`${base}${item.url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(150);
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
