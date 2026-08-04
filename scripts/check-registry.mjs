import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const allowedTypes = new Set(["registry:item", "registry:block", "registry:file", "registry:component", "registry:lib", "registry:ui"]);
const repositoryPrefix = "wrg32786/aigent-design-system/";

function dependencyName(dependency) {
  const address = dependency.split("#")[0];
  if (!address.includes("/")) return address;
  if (address.startsWith(repositoryPrefix)) return address.slice(repositoryPrefix.length);
  return null;
}

function safeInclude(root, parent, declared) {
  if (!declared || path.isAbsolute(declared)) return null;
  const resolved = path.resolve(path.dirname(parent), declared);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

function loadRegistry(root, file, findings, stack = []) {
  const relative = path.relative(root, file);
  if (stack.includes(file)) {
    findings.push({ severity: "error", message: `Registry include cycle: ${[...stack, file].map((entry) => path.relative(root, entry)).join(" -> ")}` });
    return { items: [] };
  }
  if (!fs.existsSync(file)) {
    findings.push({ severity: "error", message: `Registry source is missing: ${relative}` });
    return { items: [] };
  }

  let source;
  try {
    source = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    findings.push({ severity: "error", message: `Invalid registry JSON in ${relative}: ${error.message}` });
    return { items: [] };
  }

  if (source.$schema !== "https://ui.shadcn.com/schema/registry.json") findings.push({ severity: "error", message: `Unexpected registry schema in ${relative}.` });
  const base = path.relative(root, path.dirname(file)).split(path.sep).join("/");
  const items = (source.items || []).map((item) => ({
    ...item,
    files: (item.files || []).map((entry) => ({
      ...entry,
      path: base ? path.posix.normalize(`${base}/${entry.path}`) : entry.path,
    })),
  }));

  for (const include of source.include || []) {
    const target = safeInclude(root, file, include);
    if (!target) {
      findings.push({ severity: "error", message: `Unsafe registry include in ${relative}: ${include}` });
      continue;
    }
    items.push(...loadRegistry(root, target, findings, [...stack, file]).items);
  }
  return { ...source, items };
}

export function checkRegistry(root = process.cwd()) {
  const findings = [];
  const registryPath = path.join(root, "registry.json");
  const registry = loadRegistry(root, registryPath, findings);

  if (!registry.name || !registry.homepage) findings.push({ severity: "error", message: "Registry name and homepage are required." });
  if (!registry.items.length) findings.push({ severity: "error", message: "Registry requires items." });

  const names = new Set();
  for (const item of registry.items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name || "")) findings.push({ severity: "error", message: `Invalid item name: ${item.name}` });
    if (names.has(item.name)) findings.push({ severity: "error", message: `Duplicate item: ${item.name}` });
    names.add(item.name);
    if (!allowedTypes.has(item.type)) findings.push({ severity: "error", message: `Invalid type for ${item.name}: ${item.type}` });
    if (!item.title || !item.description || item.description.length < 24) findings.push({ severity: "error", message: `Item ${item.name} needs a useful title and description.` });
    if (!Array.isArray(item.files) || !item.files.length) findings.push({ severity: "error", message: `Item ${item.name} has no files.` });

    const targets = new Set();
    for (const file of item.files || []) {
      if (!file.path || file.path.startsWith("/") || file.path.split("/").includes("..")) findings.push({ severity: "error", message: `${item.name} has unsafe source path: ${file.path}` });
      if (file.type !== "registry:file") findings.push({ severity: "error", message: `${item.name}/${file.path} must use registry:file for this framework-neutral registry.` });
      if (!file.target?.startsWith("~/")) findings.push({ severity: "error", message: `${item.name}/${file.path} needs a project-root target.` });
      if (targets.has(file.target)) findings.push({ severity: "error", message: `${item.name} has duplicate target: ${file.target}` });
      targets.add(file.target);
      if (!fs.existsSync(path.join(root, file.path))) findings.push({ severity: "error", message: `${item.name} references missing file: ${file.path}` });
    }
  }

  const byName = new Map(registry.items.map((item) => [item.name, item]));
  for (const item of registry.items) {
    for (const dependency of item.registryDependencies || []) {
      const local = dependencyName(dependency);
      if (!local) continue;
      if (!byName.has(local)) findings.push({ severity: "error", message: `${item.name} depends on missing item: ${dependency}` });
      if (dependency.includes("/") && !dependency.startsWith(repositoryPrefix)) findings.push({ severity: "error", message: `${item.name} has malformed GitHub dependency: ${dependency}` });
    }
  }

  function visit(name, stack = [], visited = new Set()) {
    if (stack.includes(name)) {
      findings.push({ severity: "error", message: `Registry dependency cycle: ${[...stack, name].join(" -> ")}` });
      return;
    }
    if (visited.has(name)) return;
    visited.add(name);
    for (const dependency of byName.get(name)?.registryDependencies || []) {
      const local = dependencyName(dependency);
      if (local) visit(local, [...stack, name], visited);
    }
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
