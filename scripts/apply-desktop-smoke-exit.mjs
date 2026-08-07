#!/usr/bin/env node
import fs from "node:fs";

const file = "desktop/main.mjs";
let source = fs.readFileSync(file, "utf8");
const before = "    setTimeout(() => app.quit(), 150);";
const after = "    setTimeout(() => { mainWindow?.destroy(); app.exit(0); }, 150);";
if (!source.includes(before)) throw new Error("Desktop smoke-exit marker was not found.");
source = source.replace(before, after);
fs.writeFileSync(file, source);
fs.rmSync("scripts/apply-desktop-smoke-exit.mjs", { force: true });
fs.rmSync(".github/workflows/apply-desktop-smoke-exit.yml", { force: true });
console.log("Desktop smoke test now exits the Electron process deterministically.");
