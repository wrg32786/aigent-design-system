#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

export const VISUAL_DIMENSIONS = [
  ["product-clarity", "Product clarity", "Can a new visitor understand what this is, why it matters, and what to do next?"],
  ["hierarchy", "Hierarchy", "Does attention move through the surface in the intended order?"],
  ["composition", "Composition", "Are scale, balance, density, whitespace, alignment, and focal points intentional?"],
  ["typography", "Typography", "Do type choice, scale, measure, rhythm, and contrast support the product and surface mode?"],
  ["color-material", "Color and material", "Do palette, surfaces, borders, depth, texture, and contrast form one coherent visual world?"],
  ["motion-media", "Motion and media", "Do motion, video, 3D, and imagery clarify or reward rather than decorate or distract?"],
  ["interaction", "Interaction", "Are controls discoverable, states understandable, and feedback proportional?"],
  ["product-specificity", "Product specificity", "Could the surface be relabeled for an unrelated product without substantial redesign?"],
  ["originality", "Originality", "Does the result synthesize its references rather than imitate one source or a generic AI pattern?"],
  ["responsive-quality", "Responsive quality", "Does each viewport feel recomposed rather than compressed?"],
  ["trust-usability", "Trust and usability", "Does anything feel misleading, unstable, inaccessible, or difficult to understand?"],
  ["finish", "Finish", "Are crops, spacing, alignment, states, and details resolved enough to ship?"],
].map(([id, label, prompt]) => ({ id, label, prompt }));

export const REQUIRED_REVIEW_STATUSES = new Set(["pass", "issue", "not-applicable"]);
export const REQUIRED_VIEWPORT_STATUS = "reviewed";
export const FINDING_PRIORITIES = new Set(["P0", "P1", "P2", "P3"]);
export const FINDING_STATUSES = new Set(["open", "resolved", "accepted"]);
export const REVIEWER_KINDS = new Set(["host-agent", "human", "vlm-adapter"]);

export function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

export function hasFlag(args, name) {
  return args.includes(name);
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function relativeTo(root, file) {
  return path.relative(root, file).split(path.sep).join("/") || ".";
}

export function outputRoot(target, declared) {
  return path.resolve(declared || path.join(target, ".aigent", "resolve"));
}

export function requiredViewportIds(report) {
  const ids = report.captures?.map((capture) => capture.reducedMotion ? "reduced-motion" : capture.viewport?.id).filter(Boolean) || [];
  return [...new Set(ids.length ? ids : ["desktop", "tablet", "mobile", "reduced-motion"])];
}

function initialDimensionState() {
  return Object.fromEntries(VISUAL_DIMENSIONS.map((dimension) => [dimension.id, {
    status: "issue",
    rationale: "Replace this placeholder after opening and inspecting the rendered capture.",
  }]));
}

export function createReviewTemplate(report, task) {
  return {
    schemaVersion: 1,
    runId: report.runId,
    reviewer: {
      kind: "host-agent",
      name: "",
      model: "",
      tool: "native image viewer",
    },
    reviewedAt: null,
    status: "draft",
    viewports: Object.fromEntries(task.requiredViewports.map((viewport) => [viewport, {
      status: "unreviewed",
      summary: "",
      dimensions: initialDimensionState(),
    }])),
    findings: [],
    overall: {
      strengths: [],
      risks: [],
      verdict: "needs-repair",
      notes: "",
    },
  };
}
