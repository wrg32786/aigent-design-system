import assert from "node:assert/strict";
import { IMPROVE_ACTIONS, improvePrompt } from "../studio/improve.js";

assert.deepEqual(Object.keys(IMPROVE_ACTIONS), ["bolder", "quieter", "delight", "polish"]);
for (const [id, action] of Object.entries(IMPROVE_ACTIONS)) {
  assert.ok(action.label);
  assert.ok(improvePrompt(id).length > 120);
  assert.match(improvePrompt(id), /Preserve|preserving|preserve/i);
}
assert.equal(improvePrompt("missing"), "");
console.log("AIgent Studio improve-action check passed.");
