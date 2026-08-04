import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { plan } from "./plan-design.mjs";

export function checkEvals(root = process.cwd()) {
  const findings = [];
  const briefDir = path.join(root, "evals/briefs");
  const files = fs.existsSync(briefDir) ? fs.readdirSync(briefDir).filter((name) => name.endsWith(".json")).sort() : [];
  if (files.length < 5) findings.push({ severity: "error", message: `Expected at least five eval briefs; found ${files.length}.` });

  const names = new Set();
  for (const name of files) {
    try {
      const brief = JSON.parse(fs.readFileSync(path.join(briefDir, name), "utf8"));
      if (names.has(brief.name)) findings.push({ severity: "error", message: `Duplicate eval name: ${brief.name}` });
      names.add(brief.name);
      const result = plan(brief);
      if (!result.layout?.recommended?.id || !result.typography?.recommended?.id || !result.motion?.focal?.id) {
        findings.push({ severity: "error", message: `${name} did not produce a complete design plan.` });
      }
      if (!result.direction?.antiPatterns?.length || !result.verification?.length) findings.push({ severity: "error", message: `${name} is missing guardrails.` });
    } catch (error) {
      findings.push({ severity: "error", message: `${name}: ${error.message}` });
    }
  }
  return findings;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const findings = checkEvals();
  findings.forEach((finding) => console.log(`[${finding.severity}] ${finding.message}`));
  const errors = findings.filter((finding) => finding.severity === "error").length;
  console.log(`Eval check: ${errors} errors, ${findings.length - errors} warnings.`);
  if (errors) process.exitCode = 1;
}
