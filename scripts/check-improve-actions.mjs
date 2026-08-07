import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../studio/publish.js", import.meta.url), "utf8");
for (const label of ["Bolder", "Quieter", "Delight", "Polish"]) assert.match(source, new RegExp(`\\[\\"${label}\\"`));
assert.match(source, /Run AIgent Taste/);
assert.match(source, /form\.requestSubmit\(\)/);
assert.match(source, /Preserve product truth|Preserve the chosen visual world|preserving the strongest focal idea/);
console.log("AIgent Studio improve-action check passed.");
