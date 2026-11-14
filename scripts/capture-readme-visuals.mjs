#!/usr/bin/env node
// Capture README visuals for docs/before-after/. Requires Playwright Chromium.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs/before-after");
const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

async function shot(page, file, { fullPage = false, width, height, scale = 2 } = {}) {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await page.waitForTimeout(150);
  const buf = await page.screenshot({
    type: "png",
    fullPage,
    animations: "disabled",
    scale: scale === 2 ? "device" : "css",
  });
  // Playwright scale:"device" uses deviceScaleFactor from context. We'll set DSF on context.
  fs.writeFileSync(file, buf);
}

function fileUrl(rel) {
  return pathToFileURL(path.join(outDir, rel)).href;
}

async function open(context, rel) {
  const page = await context.newPage();
  await page.goto(fileUrl(rel), { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  return page;
}

async function capturePage(context, name, rel) {
  const page = await open(context, rel);
  await shot(page, path.join(outDir, `${name}-desktop-fold.png`), { width: desktop.width, height: desktop.height, fullPage: false });
  await shot(page, path.join(outDir, `${name}-desktop-full.png`), { width: desktop.width, height: desktop.height, fullPage: true });
  await shot(page, path.join(outDir, `${name}-mobile-fold.png`), { width: mobile.width, height: mobile.height, fullPage: false });
  await shot(page, path.join(outDir, `${name}-mobile-full.png`), { width: mobile.width, height: mobile.height, fullPage: true });
  await page.close();
}

function stitchSideBySide(leftPath, rightPath, dest, leftLabel, rightLabel) {
  return import("node:child_process").then(() => {
    const py = `
from PIL import Image, ImageDraw, ImageFont
left = Image.open(${JSON.stringify(leftPath)}).convert("RGB")
right = Image.open(${JSON.stringify(rightPath)}).convert("RGB")
gap = 28
label_h = 64
# match heights (fold shots should already match)
h = max(left.height, right.height)
def pad(im, h):
    if im.height == h: return im
    canvas = Image.new("RGB", (im.width, h), (28, 28, 26))
    canvas.paste(im, (0, 0))
    return canvas
left, right = pad(left, h), pad(right, h)
w = left.width + right.width + gap
out = Image.new("RGB", (w, h + label_h), (18, 18, 16))
draw = ImageDraw.Draw(out)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except Exception:
    font = ImageFont.load_default()
    small = font
draw.text((8, 18), ${JSON.stringify(leftLabel)}, fill=(240, 237, 227), font=font)
draw.text((left.width + gap + 8, 18), ${JSON.stringify(rightLabel)}, fill=(240, 237, 227), font=font)
out.paste(left, (0, label_h))
out.paste(right, (left.width + gap, label_h))
# max width 2400 for GitHub
if out.width > 2400:
    ratio = 2400 / out.width
    out = out.resize((2400, int(out.height * ratio)), Image.Resampling.LANCZOS)
out.save(${JSON.stringify(dest)}, "WEBP", quality=82, method=6)
print("wrote", ${JSON.stringify(dest)}, out.size)
`;
    const result = spawnSync("python3", ["-c", py], { encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || "stitch failed");
    process.stdout.write(result.stdout);
  });
}

function contactSheet(paths, labels, dest) {
  const py = `
from PIL import Image, ImageDraw, ImageFont
paths = ${JSON.stringify(paths)}
labels = ${JSON.stringify(labels)}
imgs = [Image.open(p).convert("RGB") for p in paths]
# fit each to width 720 keeping aspect
W = 720
fitted = []
for im in imgs:
    r = W / im.width
    fitted.append(im.resize((W, int(im.height * r)), Image.Resampling.LANCZOS))
gap, label_h, pad = 20, 44, 24
col_w = W
row_h = [max(fitted[0].height, fitted[1].height), max(fitted[2].height, fitted[3].height)]
out_w = pad * 2 + col_w * 2 + gap
out_h = pad * 2 + label_h * 2 + row_h[0] + row_h[1] + gap
out = Image.new("RGB", (out_w, out_h), (18, 18, 16))
draw = ImageDraw.Draw(out)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
except Exception:
    font = ImageFont.load_default()
positions = [
    (pad, pad),
    (pad + col_w + gap, pad),
    (pad, pad + label_h + row_h[0] + gap),
    (pad + col_w + gap, pad + label_h + row_h[0] + gap),
]
for (x,y), im, label in zip(positions, fitted, labels):
    draw.text((x, y), label, fill=(240, 237, 227), font=font)
    out.paste(im, (x, y + label_h))
out.save(${JSON.stringify(dest)}, "WEBP", quality=82, method=6)
print("wrote", ${JSON.stringify(dest)}, out.size)
`;
  const result = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "contact sheet failed");
  process.stdout.write(result.stdout);
}

function toWebp(src, dest, quality = 82) {
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(src)}).convert("RGB")
# shrink very tall full-page shots to a max width of 1600
if im.width > 1600:
    r = 1600 / im.width
    im = im.resize((1600, int(im.height * r)), Image.Resampling.LANCZOS)
im.save(${JSON.stringify(dest)}, "WEBP", quality=${quality}, method=6)
print("webp", ${JSON.stringify(dest)}, im.size, "bytes later")
`;
  const result = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  process.stdout.write(result.stdout);
}

function startStaticServer(dir) {
  return import("node:http").then((http) => new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      const file = path.join(dir, url === "/" ? "index.html" : url);
      if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end("missing"); return; }
        const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
        res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  }));
}

async function captureStarter(context) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-starter-visual-"));
  const site = path.join(tmp, "site");
  console.log("scaffolding starter into", site);
  const created = spawnSync(process.execPath, [path.join(root, "scripts/create-site.mjs"), site, "--no-skills", "--theme", "graphite"], { encoding: "utf8" });
  if (created.status !== 0) throw new Error(`create-site failed: ${created.stderr || created.stdout}`);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const install = spawnSync(npm, ["install", "--no-audit", "--no-fund"], { cwd: site, encoding: "utf8", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  if (install.status !== 0) throw new Error(`starter npm install failed: ${install.stderr || install.stdout}`);
  const build = spawnSync(npm, ["run", "build"], { cwd: site, encoding: "utf8", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  if (build.status !== 0) throw new Error(`starter build failed: ${build.stdout}\n${build.stderr}`);
  const dist = path.join(site, "dist");
  const server = await startStaticServer(dist);
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await shot(page, path.join(outDir, "starter-desktop-fold.png"), { width: desktop.width, height: desktop.height });
  await shot(page, path.join(outDir, "starter-mobile-fold.png"), { width: mobile.width, height: mobile.height });
  await page.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmp, { recursive: true, force: true });
}

async function captureVisionViewports(context) {
  const page = await open(context, "aigent.html");
  const widths = [390, 768, 1280, 1440];
  const files = [];
  for (const width of widths) {
    const height = width <= 390 ? 844 : 900;
    const file = path.join(outDir, `vision-${width}.png`);
    await shot(page, file, { width, height, fullPage: false });
    files.push(file);
  }
  await page.close();
  contactSheet(
    files,
    ["390 phone", "768 tablet", "1280 laptop", "1440 desktop"],
    path.join(outDir, "vision.webp"),
  );
  for (const file of files) fs.rmSync(file, { force: true });
}

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
try {
  await capturePage(context, "stock-ai", "stock-ai.html");
  await capturePage(context, "aigent", "aigent.html");
  const direction = await open(context, "direction.html");
  await shot(direction, path.join(outDir, "direction.png"), { width: 1440, height: 900 });
  await direction.close();
  const taste = await open(context, "taste.html");
  await shot(taste, path.join(outDir, "taste.png"), { width: 1440, height: 900 });
  await taste.close();
  await captureVisionViewports(context);
  await captureStarter(context);
} finally {
  await browser.close();
}

// Convert singles to webp and stitch compares
const pngs = [
  "stock-ai-desktop-fold", "stock-ai-desktop-full", "stock-ai-mobile-fold", "stock-ai-mobile-full",
  "aigent-desktop-fold", "aigent-desktop-full", "aigent-mobile-fold", "aigent-mobile-full",
  "direction", "taste", "starter-desktop-fold", "starter-mobile-fold",
];
for (const name of pngs) {
  const src = path.join(outDir, `${name}.png`);
  if (!fs.existsSync(src)) continue;
  toWebp(src, path.join(outDir, `${name}.webp`));
  fs.rmSync(src);
}

await stitchSideBySide(
  path.join(outDir, "stock-ai-desktop-fold.webp"),
  path.join(outDir, "aigent-desktop-fold.webp"),
  path.join(outDir, "compare-desktop-fold.webp"),
  "Stock AI (unguided agent)",
  "Same brief, with Aigent",
);
await stitchSideBySide(
  path.join(outDir, "stock-ai-mobile-fold.webp"),
  path.join(outDir, "aigent-mobile-fold.webp"),
  path.join(outDir, "compare-mobile-fold.webp"),
  "Stock AI, phone",
  "Aigent, phone",
);
console.log("README visuals captured in", outDir);
