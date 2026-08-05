import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { VISUAL_DIMENSIONS } from "../vision/lib/common.mjs";
import { finalizeVisualReview, validateVisualReview } from "../vision/lib/review.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-vision-"));
const output = path.join(root, ".aigent", "resolve");
fs.mkdirSync(path.join(output, "runs", "test-run"), { recursive: true });
const requiredViewports = ["desktop", "tablet", "mobile", "reduced-motion"];
const task = {
  schemaVersion: 1,
  runId: "test-run",
  requiredViewports,
  elementMap: ".aigent/resolve/runs/test-run/element-map.json",
};
const mechanical = {
  runId: "test-run",
  score: 100,
  totals: { errors: 0, warnings: 0 },
  gate: { pass: true },
  repairContract: { topActions: [] },
};
write(path.join(output, "latest.json"), mechanical);
write(path.join(output, "latest.visual-review-task.json"), task);
write(path.join(output, "runs", "test-run", "element-map.json"), { viewports: { mobile: [{ id: "E001" }] } });

function write(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function dimensions() {
  return Object.fromEntries(VISUAL_DIMENSIONS.map(({ id, label }) => [id, {
    status: "pass",
    rationale: `${label} is resolved in this fixture.`,
  }]));
}

function review(findings, verdict) {
  return {
    schemaVersion: 1,
    runId: "test-run",
    reviewer: { kind: "host-agent", name: "fixture", model: "fixture", tool: "native image viewer" },
    reviewedAt: new Date().toISOString(),
    status: "reviewed",
    viewports: Object.fromEntries(requiredViewports.map((viewport) => [viewport, {
      status: "reviewed",
      summary: `${viewport} was opened and reviewed in full.`,
      dimensions: dimensions(),
    }])),
    findings,
    overall: {
      strengths: ["Clear hierarchy"],
      risks: [],
      verdict,
      notes: "Complete visual judgment recorded.",
    },
  };
}

const failing = review([{
  id: "mobile-controls",
  viewport: "mobile",
  severity: "P1",
  dimension: "composition",
  finding: "Theme controls compete with the first product statement.",
  evidence: "The controls occupy most of the top third before the heading.",
  recommendation: "Collapse them into one compact accessible control.",
  elementIds: ["E001"],
  suspectedOwner: ".ds-theme-picker",
  preserve: ["theme switching", "keyboard access"],
  confidence: 0.94,
  status: "open",
}], "needs-repair");
assert.deepEqual(validateVisualReview(failing, task, { viewports: { mobile: [{ id: "E001" }] } }), []);
write(path.join(output, "latest.visual-review.json"), failing);
const failed = finalizeVisualReview({ target: root });
assert.equal(failed.gate.pass, false);
assert.deepEqual(failed.visual.openBlockingFindings, ["mobile-controls"]);

const passing = review([], "pass");
write(path.join(output, "latest.visual-review.json"), passing);
const passed = finalizeVisualReview({ target: root });
assert.equal(passed.gate.pass, true);
assert.deepEqual(passed.visual.comparison.resolved, ["mobile-controls"]);

const invalid = structuredClone(passing);
delete invalid.viewports.mobile;
assert.ok(validateVisualReview(invalid, task).some((message) => message.includes("mobile")));

console.log(`AIgent Vision check passed with ${VISUAL_DIMENSIONS.length} dimensions and a failing-to-passing visual comparison.`);
