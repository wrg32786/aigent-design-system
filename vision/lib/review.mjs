import fs from "node:fs";
import path from "node:path";
import { FINDING_PRIORITIES, FINDING_STATUSES, REQUIRED_REVIEW_STATUSES, REQUIRED_VIEWPORT_STATUS, REVIEWER_KINDS, VISUAL_DIMENSIONS, outputRoot, readJson, writeJson } from "./common.mjs";

export function validateVisualReview(review, task, elementMap = null) {
  const errors = [];
  if (!review || typeof review !== "object") return ["Review must be a JSON object."];
  if (review.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (review.runId !== task.runId) errors.push(`runId must match ${task.runId}.`);
  if (review.status !== "reviewed") errors.push('status must be "reviewed".');
  if (!review.reviewer || !REVIEWER_KINDS.has(review.reviewer.kind)) errors.push(`reviewer.kind must be one of ${[...REVIEWER_KINDS].join(", ")}.`);
  if (!review.reviewer?.name?.trim() && !review.reviewer?.model?.trim()) errors.push("reviewer must identify a name or model.");
  if (!review.reviewedAt || Number.isNaN(Date.parse(review.reviewedAt))) errors.push("reviewedAt must be an ISO date-time.");

  const dimensions = new Set(VISUAL_DIMENSIONS.map((dimension) => dimension.id));
  for (const viewport of task.requiredViewports) {
    const item = review.viewports?.[viewport];
    if (!item) {
      errors.push(`Missing viewport review: ${viewport}.`);
      continue;
    }
    if (item.status !== REQUIRED_VIEWPORT_STATUS) errors.push(`${viewport}.status must be reviewed.`);
    if (!item.summary?.trim()) errors.push(`${viewport}.summary is required.`);
    for (const dimension of dimensions) {
      const result = item.dimensions?.[dimension];
      if (!result) {
        errors.push(`${viewport} is missing dimension ${dimension}.`);
        continue;
      }
      if (!REQUIRED_REVIEW_STATUSES.has(result.status)) errors.push(`${viewport}.${dimension}.status is invalid.`);
      if (!result.rationale?.trim() || result.rationale.trim().length < 12) errors.push(`${viewport}.${dimension}.rationale is too short.`);
    }
  }

  const ids = new Set();
  const validElements = new Set(Object.values(elementMap?.viewports || {}).flat().map((element) => element.id));
  for (const [index, finding] of (review.findings || []).entries()) {
    const prefix = `findings[${index}]`;
    if (!finding.id || ids.has(finding.id)) errors.push(`${prefix}.id must be unique.`);
    ids.add(finding.id);
    if (!task.requiredViewports.includes(finding.viewport)) errors.push(`${prefix}.viewport is invalid.`);
    if (!FINDING_PRIORITIES.has(finding.severity)) errors.push(`${prefix}.severity is invalid.`);
    if (!dimensions.has(finding.dimension)) errors.push(`${prefix}.dimension is invalid.`);
    if (!FINDING_STATUSES.has(finding.status)) errors.push(`${prefix}.status is invalid.`);
    for (const field of ["finding", "evidence", "recommendation"]) {
      if (!finding[field]?.trim() || finding[field].trim().length < 12) errors.push(`${prefix}.${field} is too short.`);
    }
    if (!Number.isFinite(finding.confidence) || finding.confidence < 0 || finding.confidence > 1) errors.push(`${prefix}.confidence must be between 0 and 1.`);
    if ((finding.severity === "P0" || finding.severity === "P1") && (!Array.isArray(finding.preserve) || !finding.preserve.length)) {
      errors.push(`${prefix}.preserve must name at least one constraint for P0/P1 findings.`);
    }
    for (const elementId of finding.elementIds || []) {
      if (validElements.size && !validElements.has(elementId)) errors.push(`${prefix}.elementIds contains unknown ID ${elementId}.`);
    }
    if (finding.status === "accepted" && !finding.acceptanceRationale?.trim()) errors.push(`${prefix}.acceptanceRationale is required for accepted findings.`);
  }

  if (!review.overall || !["pass", "pass-with-notes", "needs-repair"].includes(review.overall.verdict)) {
    errors.push("overall.verdict must be pass, pass-with-notes, or needs-repair.");
  }
  return errors;
}

function visualComparison(previous, current) {
  const before = new Map((previous?.findings || []).map((finding) => [finding.id, finding]));
  const after = new Map((current?.findings || []).map((finding) => [finding.id, finding]));
  return {
    previousRun: previous?.runId || null,
    resolved: [...before.keys()].filter((id) => !after.has(id) || after.get(id).status === "resolved"),
    introduced: [...after.keys()].filter((id) => !before.has(id) && after.get(id).status === "open"),
    persistent: [...after.keys()].filter((id) => before.has(id) && after.get(id).status === "open"),
  };
}

function combinedMarkdown(combined) {
  const lines = [
    "# AIgent Vision + Resolve completion report",
    "",
    `- **Completion:** ${combined.gate.pass ? "passed" : "blocked"}`,
    `- **Mechanical gate:** ${combined.gate.mechanicalPass ? "passed" : "failed"} (${combined.mechanical.score}/100)`,
    `- **Visual review:** ${combined.gate.visualReviewComplete ? "complete" : "incomplete"}`,
    `- **Visual gate:** ${combined.gate.visualPass ? "passed" : "failed"}`,
    `- **Open P0/P1 visual findings:** ${combined.visual.openBlockingFindings.length}`,
    `- **Reviewer:** ${combined.visual.reviewer}`,
    "",
    "## Unified repair order",
    "",
  ];
  if (!combined.repairOrder.length) {
    lines.push("No mechanical or blocking visual findings remain. Record the final shipping decision.");
  } else {
    for (const [index, finding] of combined.repairOrder.entries()) {
      lines.push(`${index + 1}. **${finding.priority} · ${finding.source} · ${finding.dimension || finding.rule}** — ${finding.action}`);
      lines.push(`   - Evidence: ${finding.evidence}`);
      if (finding.viewport) lines.push(`   - Viewport: ${finding.viewport}`);
      if (finding.elementIds?.length) lines.push(`   - Elements: ${finding.elementIds.join(", ")}`);
      if (finding.suspectedOwner) lines.push(`   - Suspected owner: ${finding.suspectedOwner}`);
      if (finding.preserve?.length) lines.push(`   - Preserve: ${finding.preserve.join(", ")}`);
    }
  }
  lines.push("", "## Visual review by viewport", "");
  for (const [viewport, item] of Object.entries(combined.visual.viewports)) {
    lines.push(`- **${viewport}:** ${item.summary}`);
  }
  lines.push("", "## Change since previous visual review", "");
  lines.push(`- Resolved: ${combined.visual.comparison.resolved.length}`);
  lines.push(`- Introduced: ${combined.visual.comparison.introduced.length}`);
  lines.push(`- Persistent: ${combined.visual.comparison.persistent.length}`);
  lines.push("", "## Stop condition", "");
  lines.push("Ship only when the mechanical gate passes, every required capture was actually inspected, no open P0 or P1 visual finding remains, and the final product-specific visual judgment is recorded.");
  return `${lines.join("\n")}\n`;
}

export function finalizeVisualReview(options = {}) {
  const target = path.resolve(options.target || process.cwd());
  const root = outputRoot(target, options.out);
  const reportFile = path.resolve(options.report || path.join(root, "latest.json"));
  const taskFile = path.resolve(options.task || path.join(root, "latest.visual-review-task.json"));
  const reviewFile = path.resolve(options.review || path.join(root, "latest.visual-review.json"));
  if (!fs.existsSync(reportFile)) throw new Error(`Resolve report not found: ${reportFile}`);
  if (!fs.existsSync(taskFile)) throw new Error(`Visual review task not found: ${taskFile}`);
  if (!fs.existsSync(reviewFile)) throw new Error(`Visual review not found: ${reviewFile}`);
  const mechanical = readJson(reportFile);
  const task = readJson(taskFile);
  const review = readJson(reviewFile);
  const mapFile = path.resolve(target, task.elementMap);
  const elementMap = fs.existsSync(mapFile) ? readJson(mapFile) : null;
  const validationErrors = validateVisualReview(review, task, elementMap);
  if (validationErrors.length) throw new Error(`Visual review validation failed:\n- ${validationErrors.join("\n- ")}`);

  const priorFile = path.join(root, "latest.visual-review.validated.json");
  const previous = fs.existsSync(priorFile) ? readJson(priorFile) : null;
  const openFindings = review.findings.filter((finding) => finding.status === "open");
  const blocking = openFindings.filter((finding) => finding.severity === "P0" || finding.severity === "P1");
  const visualPass = blocking.length === 0 && review.overall.verdict !== "needs-repair";
  const mechanicalActions = (mechanical.repairContract?.topActions || []).map((item) => ({
    id: item.id,
    source: "mechanical",
    priority: item.priority,
    rule: item.rule,
    action: item.action,
    evidence: item.message,
    viewport: item.viewport || null,
    elementIds: [],
  }));
  const visualActions = openFindings.map((finding) => ({
    id: finding.id,
    source: "visual",
    priority: finding.severity,
    dimension: finding.dimension,
    action: finding.recommendation,
    evidence: finding.evidence,
    viewport: finding.viewport,
    elementIds: finding.elementIds || [],
    suspectedOwner: finding.suspectedOwner || null,
    preserve: finding.preserve || [],
  }));
  const priority = (value) => Number(value.slice(1));
  const repairOrder = [...mechanicalActions, ...visualActions].sort((left, right) => priority(left.priority) - priority(right.priority));
  const comparison = visualComparison(previous, review);
  const combined = {
    schemaVersion: 1,
    runId: mechanical.runId,
    generatedAt: new Date().toISOString(),
    gate: {
      mechanicalPass: Boolean(mechanical.gate?.pass),
      visualReviewComplete: true,
      visualPass,
      pass: Boolean(mechanical.gate?.pass) && visualPass,
    },
    mechanical: {
      score: mechanical.score,
      errors: mechanical.totals?.errors || 0,
      warnings: mechanical.totals?.warnings || 0,
    },
    visual: {
      reviewer: review.reviewer.name || review.reviewer.model,
      reviewerKind: review.reviewer.kind,
      verdict: review.overall.verdict,
      viewports: review.viewports,
      findings: review.findings,
      openBlockingFindings: blocking.map((finding) => finding.id),
      comparison,
    },
    repairOrder,
  };

  const runDirectory = path.join(root, "runs", mechanical.runId);
  writeJson(path.join(runDirectory, "visual-review.json"), review);
  writeJson(path.join(runDirectory, "combined-report.json"), combined);
  fs.writeFileSync(path.join(runDirectory, "combined-report.md"), combinedMarkdown(combined));
  writeJson(priorFile, review);
  writeJson(path.join(root, "latest.combined.json"), combined);
  fs.writeFileSync(path.join(root, "latest.combined.md"), combinedMarkdown(combined));
  return combined;
}

export function checkVisualReview(options = {}) {
  const target = path.resolve(options.target || process.cwd());
  const root = outputRoot(target, options.out);
  const taskFile = path.resolve(options.task || path.join(root, "latest.visual-review-task.json"));
  const reviewFile = path.resolve(options.review || path.join(root, "latest.visual-review.json"));
  if (!fs.existsSync(taskFile)) throw new Error(`Visual review task not found: ${taskFile}`);
  if (!fs.existsSync(reviewFile)) throw new Error(`Visual review not found: ${reviewFile}`);
  const task = readJson(taskFile);
  const review = readJson(reviewFile);
  const mapFile = path.resolve(target, task.elementMap);
  const errors = validateVisualReview(review, task, fs.existsSync(mapFile) ? readJson(mapFile) : null);
  if (errors.length) throw new Error(`Visual review validation failed:\n- ${errors.join("\n- ")}`);
  return { task, review };
}
