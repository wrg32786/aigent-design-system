import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { importFile } from "../inspiration/lib/file-forensics.mjs";
import { compareDesignDna } from "../inspiration/lib/originality.mjs";
import { applyDirection, composeFromStore, searchSources } from "../inspiration/lib/synthesis.mjs";

const root = process.cwd();
const required = [
  "inspiration/README.md",
  "inspiration/schemas/source.schema.json",
  "inspiration/schemas/design-dna.schema.json",
  "inspiration/schemas/motion-dna.schema.json",
  "inspiration/schemas/reference-matrix.schema.json",
  "inspiration/schemas/influence-ledger.schema.json",
  "inspiration/lib/common.mjs",
  "inspiration/lib/store.mjs",
  "inspiration/lib/design-dna.mjs",
  "inspiration/lib/url-forensics.mjs",
  "inspiration/lib/file-forensics.mjs",
  "inspiration/lib/synthesis.mjs",
  "inspiration/lib/originality.mjs",
  "inspiration/lib/report.mjs",
  "inspiration/examples/editorial-reference.json",
  "inspiration/examples/immersive-reference.json",
  "inspiration/examples/interface-reference.json",
  "inspiration/lab/index.html",
  "inspiration/lab/app.js",
  "inspiration/fixtures/site/index.html",
  "inspiration/evals/README.md",
  "inspiration/evals/rubric.json",
  "scripts/inspire.mjs",
  "scripts/inspiration-smoke.mjs",
  "skills/design-forensics/SKILL.md",
  "skills/reference-synthesis/SKILL.md",
  "skills/inspiration-originality-audit/SKILL.md",
  "skills/aigent-design/reference/inspiration.md"
];
for (const relative of required) assert.ok(fs.existsSync(path.join(root, relative)), `Missing inspiration file: ${relative}`);
for (const relative of required.filter((file) => file.endsWith(".json"))) assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8")), `Invalid JSON: ${relative}`);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-inspiration-"));
const storeRoot = path.join(temporary, "store");
const first = importFile(path.join(root, "inspiration/examples/editorial-reference.json"), { root: storeRoot, id: "editorial", label: "Editorial", kind: "structured-reference", analysis: path.join(root, "inspiration/examples/editorial-reference.json") });
const second = importFile(path.join(root, "inspiration/examples/immersive-reference.json"), { root: storeRoot, id: "immersive", label: "Immersive", kind: "structured-reference", analysis: path.join(root, "inspiration/examples/immersive-reference.json") });
const third = importFile(path.join(root, "inspiration/examples/interface-reference.json"), { root: storeRoot, id: "interface", label: "Interface", kind: "structured-reference", analysis: path.join(root, "inspiration/examples/interface-reference.json") });
assert.ok(first.designDna.confidence.overall >= 0.72);
assert.equal(searchSources("scroll linked immersive", { root: storeRoot })[0].id, "immersive");
const brief = { id: "inspiration-check", product: { name: "Example Product", job: "Explain and convert" }, surface: { mode: "persuade" }, brand: { adjectives: ["industrial", "editorial"], antiReferences: ["clone"], themePreference: "dark" } };
const { plan, directory } = composeFromStore(brief, ["editorial", "immersive", "interface"], { root: storeRoot });
assert.equal(plan.referenceMatrix.dimensions.length, 6);
const counts = Object.values(plan.referenceMatrix.assignments).reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
assert.ok([...counts.values()].every((count) => count <= 2), "A reference controls more than two dimensions.");
assert.ok(plan.direction.doNotCopy.includes("source copy or claims"));
const target = path.join(temporary, "target");
applyDirection(plan, target);
assert.ok(fs.existsSync(path.join(target, ".aigent/INSPIRATION.md")));
assert.ok(fs.existsSync(path.join(directory, "influence-ledger.json")));
const similarity = compareDesignDna(first.designDna, second.designDna);
assert.ok(similarity.overall >= 0 && similarity.overall <= 1);

for (const skill of ["design-forensics", "reference-synthesis", "inspiration-originality-audit"]) {
  const body = fs.readFileSync(path.join(root, `skills/${skill}/SKILL.md`), "utf8");
  assert.match(body, new RegExp(`^---\\nname: ${skill}\\ndescription: .{24,}\\n---`, "m"));
}

console.log("Inspiration intelligence check passed: schemas, source import, search, synthesis, influence limits, application, and originality heuristics.");
