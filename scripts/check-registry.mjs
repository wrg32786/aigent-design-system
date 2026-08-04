import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const allowedTypes = new Set(["registry:item", "registry:block", "registry:file", "registry:component", "registry:lib", "registry:ui"]);

export function checkRegistry(root = process.cwd()) {
  const findings = [];
  const registryPath = path.join(root, "registry.json");
  if (!fs.existsSync(registryPath)) return [{ severity: "error", message: "registry.json is missing." }];

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (error) {
    return [{ severity: "error", message: `Invalid registry JSON: ${error.message}` }];
  }

  if (registry.$schema !== "https://ui.shadcn.com/schema/registry.json") findings.push({ severity: "error", message: "Unexpected registry schema." });
  if (!registry.name || !registry.homepage) findings.push({ severity: "error", message: "Registry name and homepage are required." });
  if (!Array.isArray(registry.items) || !registry.items.length) findings.push({ severity: "error", message: "Registry requires items." });

  const names = new Set();
  for (const item of registry.items || []) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name || "")) findings.push({ severity: "error", message: `Invalid item name: ${item.name}` });
    if (names.has(item.name)) findings.push({ severity: "error", message: `Duplicate item: ${item.name}` });
    names.add(item.name);
    if (!allowedTypes.has(item.type)) findings.push({ severity: "error", message: `Invalid type for ${item.name}: ${item.type}` });
    if (!item.title || !item.description || item.description.length < 24) findings.push({ severity: "error", message: `Item ${item.name} needs a useful title and description.` });
    if (!Array.isArray(item.files) || !item.files.length) findings.push({ severity: "error", message: `Item ${item.name} has no files.` });

    const targets = new Set();
    for (const file of item.files || []) {
      if (!file.path || file.path.startsWith("/") || file.path.includes("..")) findings.push({ severity: "error", message: `${item.name} has unsafe source path: ${file.path}` });
      if (file.type !== "registry:file") findings.push({ severity: "error", message: `${item.name}/${file.path} must use registry:file for this framework-neutral registry.` });
      if (!file.target?.startsWith("~/")) findings.push({ severity: "error", message: `${item.name}/${file.path} needs a project-root target.` });
      if (targets.has(file.target)) findings.push({ severity: "error", message: `${item.name} has duplicate target: ${file.target}` });
      targets.add(file.target);
      if (!fs.existsSync(path.join(root, file.path))) findings.push({ severity: "error", message: `${item.name} references missing file: ${file.path}` });
    }
  }

  const byName = new Map((registry.items || []).map((item) => [item.name, item]));
  for (const item of registry.items || []) {
    for (const dependency of item.registryDependencies || []) {
      if (!byName.has(dependency)) findings.push({ severity: "error", message: `${item.name} depends on missing item: ${dependency}` });
    }
  }

  function visit(name, stack = [], visited = new Set()) {
    if (stack.includes(name)) {
      findings.push({ severity: "error", message: `Registry dependency cycle: ${[...stack, name].join(" -> ")}` });
      return;
    }
    if (visited.has(name)) return;
    visited.add(name);
    for (const dependency of byName.get(name)?.registryDependencies || []) visit(dependency, [...stack, name], visited);
  }
  for (const name of names) visit(name);

  for (const required of ["studio-core", "aigent-design-skill", "design-intelligence", "immersive-sales-deck", "command-center-interface", "threejs-product-stage", "full-studio"]) {
    if (!names.has(required)) findings.push({ severity: "error", message: `Missing required registry item: ${required}` });
  }
  return findings;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const findings = checkRegistry();
  findings.forEach((finding) => console.log(`[${finding.severity}] ${finding.message}`));
  const errors = findings.filter((finding) => finding.severity === "error").length;
  console.log(`Registry check: ${errors} errors, ${findings.length - errors} warnings.`);
  if (errors) process.exitCode = 1;
}
