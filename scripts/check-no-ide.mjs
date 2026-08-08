import assert from "node:assert/strict";
import fs from "node:fs";

for (const path of ["desktop", "studio", "skills/aigent-studio", "electron-builder.yml"]) {
  assert.equal(fs.existsSync(path), false, `Obsolete IDE surface must stay removed: ${path}`);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(pkg.main, undefined, "Agent-native package must not declare a Desktop entrypoint.");
assert.equal(pkg.dependencies?.electron, undefined);
assert.equal(pkg.dependencies?.["electron-updater"], undefined);
assert.equal(pkg.devDependencies?.["electron-builder"], undefined);

const readme = fs.readFileSync("README.md", "utf8");
assert.match(readme, /There is no separate IDE to learn\./);

console.log("Agent-native boundary check passed.");
