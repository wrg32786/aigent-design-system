import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { captureUrl } from "../inspiration/lib/url-forensics.mjs";
import { importFile } from "../inspiration/lib/file-forensics.mjs";
import { composeFromStore, applyDirection, auditPlanTarget } from "../inspiration/lib/synthesis.mjs";

const base = process.env.BASE_URL || "http://127.0.0.1:4177";
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-inspiration-browser-"));
const storeRoot = path.join(temporary, "store");
const fixture = await captureUrl(`${base}/inspiration/fixtures/site/`, {
  root: storeRoot,
  id: "fixture",
  label: "Forensics Fixture",
  viewports: [
    { id: "desktop", width: 1440, height: 1000 },
    { id: "mobile", width: 390, height: 844 },
  ],
  frames: 4,
  scrollSteps: 5,
  timeout: 30000,
});
assert.equal(fixture.designDna.evidence.viewportCount, 2);
assert.notEqual(fixture.designDna.structure.topology, "unresolved");
assert.ok(fixture.designDna.evidence.cdpNodeCount > 0);
assert.ok(fixture.designDna.motion.animationCount > 0);
assert.ok(fs.existsSync(path.join(fixture.directory, "report.html")));
for (const capture of fixture.captures) {
  assert.ok(fs.existsSync(path.join(fixture.directory, capture.screenshots.viewport)));
  assert.ok(fs.existsSync(path.join(fixture.directory, capture.screenshots.full)));
}

const root = process.cwd();
importFile(path.join(root, "inspiration/examples/editorial-reference.json"), { root: storeRoot, id: "editorial", label: "Editorial", kind: "structured-reference", analysis: path.join(root, "inspiration/examples/editorial-reference.json") });
importFile(path.join(root, "inspiration/examples/interface-reference.json"), { root: storeRoot, id: "interface", label: "Interface", kind: "structured-reference", analysis: path.join(root, "inspiration/examples/interface-reference.json") });
const brief = {
  id: "browser-synthesis",
  product: { name: "Orbital Inspection", job: "Explain the mechanism and generate demos" },
  surface: { mode: "persuade" },
  brand: { adjectives: ["technical", "industrial", "editorial"], antiReferences: ["copying one reference"], themePreference: "dark" },
};
const { plan, sources } = composeFromStore(brief, ["fixture", "editorial", "interface"], { root: storeRoot });
const counts = Object.values(plan.referenceMatrix.assignments).reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
assert.ok([...counts.values()].every((count) => count <= 2));
const target = path.join(temporary, "target");
applyDirection(plan, target);
assert.ok(fs.existsSync(path.join(target, ".aigent/INSPIRATION.md")));
const audit = auditPlanTarget(fixture.designDna, plan, sources);
assert.ok(["pass", "review"].includes(audit.verdict));

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/inspiration/lab/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelectorAll("#sources .source").length === 3);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("#matrix .row").count(), 6);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
    await page.locator("#synthesize").click();
    await page.waitForFunction(() => !document.querySelector("#ledger").hidden);
    assert.equal(await page.locator("#ledger-list li").count(), 3);
    assert.match((await page.locator("#status").textContent()) || "", /synthesized/i);
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Inspiration browser smoke passed: ${fixture.designDna.structure.topology}, ${fixture.designDna.motion.animationCount} animations, three-source synthesis, responsive lab.`);
