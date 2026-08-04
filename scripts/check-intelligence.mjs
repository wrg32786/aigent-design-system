#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { plan, validateBrief } from "./plan-design.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(here, "..");

function read(root, relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

function add(findings, condition, message) {
  if (!condition) findings.push({ severity: "error", message });
}

function unique(findings, items, label) {
  const ids = items.map((item) => item.id);
  add(findings, new Set(ids).size === ids.length, `Duplicate ${label} id.`);
  add(findings, ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)), `Invalid ${label} id.`);
}

export function checkIntelligence(root = defaultRoot) {
  const findings = [];
  try {
    const layouts = read(root, "design-intelligence/layouts.json").layouts;
    const types = read(root, "design-intelligence/type-systems.json").typeSystems;
    const motions = read(root, "design-intelligence/motion-systems.json").motionSystems;
    const sources = read(root, "design-intelligence/component-sources.json").sources;
    const interfaces = read(root, "design-intelligence/interface-systems.json").interfaceSystems;
    const brief = read(root, "design-intelligence/example-brief.json");

    add(findings, layouts.length >= 15, "Layout catalog is too small.");
    add(findings, types.length >= 8, "Type catalog is too small.");
    add(findings, motions.length >= 14, "Motion catalog is too small.");
    add(findings, sources.length >= 8, "Component source catalog is too small.");
    add(findings, interfaces.length >= 5, "Interface catalog is too small.");

    unique(findings, layouts, "layout");
    unique(findings, types, "type system");
    unique(findings, motions, "motion system");
    unique(findings, sources, "component source");
    unique(findings, interfaces, "interface system");

    layouts.forEach((layout) => {
      add(findings, layout.thesis && layout.structure?.length >= 4, `${layout.id} needs thesis and structure.`);
      add(findings, Boolean(layout.mobile), `${layout.id} needs mobile contract.`);
      add(findings, Boolean(layout.avoidWhen?.length), `${layout.id} needs avoidWhen.`);
    });
    types.forEach((system) => {
      add(findings, system.display && system.body && system.data, `${system.id} needs all type roles.`);
      add(findings, Boolean(system.rules?.length), `${system.id} needs role rules.`);
    });
    motions.forEach((motion) => add(findings, motion.purpose && motion.reducedMotion, `${motion.id} needs purpose and reducedMotion.`));
    sources.forEach((source) => {
      add(findings, /^https:\/\/github\.com\//.test(source.url), `${source.id} must use an official GitHub source.`);
      add(findings, Boolean(source.rules?.length), `${source.id} needs curation rules.`);
    });

    validateBrief(brief);
    const result = plan(brief);
    add(findings, Boolean(result.layout.recommended.id), "Planner did not choose layout.");
    add(findings, Boolean(result.typography.recommended.id), "Planner did not choose type.");
    add(findings, Boolean(result.motion.focal.id), "Planner did not choose motion.");
    add(findings, Boolean(result.direction.runtime.length), "Planner did not choose runtime.");
    add(findings, result.direction.antiPatterns.length >= 5, "Planner needs anti-patterns.");

    const operate = structuredClone(brief);
    operate.name = "Operations queue";
    operate.modes = ["operate"];
    operate.contentProfile = "data-heavy";
    operate.density = "high";
    operate.interactionLevel = "high";
    operate.media = { available: ["data"], needsProduction: false, preferred: "auto" };
    operate.framework = "react";
    operate.brand.adjectives = ["precise", "operational", "fast"];
    const operatePlan = plan(operate);
    add(findings, operatePlan.layout.recommended.id === "operator-command-center", "Operate fixture did not choose operator-command-center.");
  } catch (error) {
    findings.push({ severity: "error", message: error instanceof Error ? error.message : String(error) });
  }
  return findings;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const findings = checkIntelligence();
  findings.forEach((finding) => console.log(`[${finding.severity}] ${finding.message}`));
  const errors = findings.filter((finding) => finding.severity === "error").length;
  const layouts = read(defaultRoot, "design-intelligence/layouts.json").layouts.length;
  const types = read(defaultRoot, "design-intelligence/type-systems.json").typeSystems.length;
  const motions = read(defaultRoot, "design-intelligence/motion-systems.json").motionSystems.length;
  const sources = read(defaultRoot, "design-intelligence/component-sources.json").sources.length;
  console.log(`Design intelligence check: ${errors} errors; ${layouts} layouts, ${types} type systems, ${motions} motion systems, ${sources} component sources.`);
  if (errors) process.exitCode = 1;
}
