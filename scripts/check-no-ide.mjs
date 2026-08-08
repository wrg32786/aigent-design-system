import assert from "node:assert/strict";
import fs from "node:fs";
for (const path of ["desktop", "studio", "skills/aigent-studio", "electron-builder.yml"]) assert.equal(fs.existsSync(path), false, `Obsolete IDE surface must stay removed: ${path}`);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(pkg.main, undefined);
assert.equal(pkg.dependencies?.["electron-updater"], undefined);
assert.equal(pkg.devDependencies?.electron, undefined);
assert.equal(pkg.devDependencies?.["electron-builder"], undefined);
console.log("Agent-native boundary check passed.");
