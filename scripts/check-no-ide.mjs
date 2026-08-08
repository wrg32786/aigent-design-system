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

for (const path of ["README.md", "PRODUCT.md", "DESIGN.md", "SECURITY.md", "publish/README.md", "skills/publish-site/SKILL.md", "skills/aigent-design/SKILL.md"]) {
  const body = fs.readFileSync(path, "utf8");
  assert.ok(!body.includes("AIgent Studio"), `${path} still contains the retired Studio product.`);
  assert.ok(!body.includes("AIgent Desktop"), `${path} still contains the retired Desktop product.`);
  assert.ok(!body.includes("aigent-studio"), `${path} still routes to the retired Studio skill.`);
}

const readme = fs.readFileSync("README.md", "utf8");
assert.ok(!readme.includes("readme-hero"), "README still references obsolete hero artwork.");
assert.ok(!readme.includes("studio-core"), "README still references the retired Studio registry item.");

const skill = fs.readFileSync("skills/aigent-design/SKILL.md", "utf8");
assert.ok(!skill.includes("DOM-backed visual canvas"), "Primary skill still describes the removed visual IDE.");

console.log("Agent-native boundary check passed.");
