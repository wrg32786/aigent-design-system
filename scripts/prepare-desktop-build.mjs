#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browsers = path.join(root, "desktop", "resources", "playwright");
const playwright = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "playwright.cmd" : "playwright");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
    windowsHide: true,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

fs.rmSync(browsers, { recursive: true, force: true });
fs.mkdirSync(browsers, { recursive: true });
run(process.execPath, [path.join(root, "scripts", "generate-desktop-assets.mjs")]);
run(playwright, ["install", "--only-shell", "chromium"], {
  PLAYWRIGHT_BROWSERS_PATH: browsers,
  PLAYWRIGHT_SKIP_BROWSER_GC: "1",
});

const marker = path.join(browsers, ".aigent-runtime.json");
fs.writeFileSync(marker, `${JSON.stringify({
  preparedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  playwrightVersion: JSON.parse(fs.readFileSync(path.join(root, "node_modules", "playwright", "package.json"), "utf8")).version,
}, null, 2)}\n`);

console.log(`Prepared AIgent Desktop runtime at ${path.relative(root, browsers)}.`);
