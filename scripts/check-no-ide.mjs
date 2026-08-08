import assert from "node:assert/strict";
import fs from "node:fs";

for (const path of [
  "desktop",
  "studio",
  "skills/aigent-studio",
  "electron-builder.yml",
  "docs/GETTING_STARTED_MAC.md",
  "docs/assets/readme/studio-demo.svg",
  "docs/assets/readme/readme-hero.svg",
]) {
  assert.equal(fs.existsSync(path), false, `Obsolete IDE surface must stay removed: ${path}`);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(pkg.main, undefined);
assert.equal(pkg.dependencies?.["electron-updater"], undefined);
assert.equal(pkg.devDependencies?.electron, undefined);
assert.equal(pkg.devDependencies?.["electron-builder"], undefined);

const cli = fs.readFileSync("scripts/cli.mjs", "utf8");
assert.ok(!cli.includes("studio-server"), "CLI still references the removed Studio server.");
assert.ok(!cli.includes("async function studio"), "CLI still exposes the removed Studio runtime.");

const readme = fs.readFileSync("README.md", "utf8");
assert.ok(!readme.includes("AIgent Studio"), "README still contains Studio-era product copy.");
assert.ok(!readme.includes("readme-hero"), "README still references obsolete hero artwork.");

const skill = fs.readFileSync("skills/aigent-design/SKILL.md", "utf8");
assert.ok(!skill.includes("aigent-studio"), "Primary skill still routes to the removed Studio skill.");
assert.ok(!skill.includes("DOM-backed visual canvas"), "Primary skill still describes the removed visual IDE.");

console.log("Agent-native boundary check passed.");
