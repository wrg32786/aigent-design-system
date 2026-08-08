#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = process.env.AIGENT_REGISTRY_PATH
  ? path.resolve(process.env.AIGENT_REGISTRY_PATH)
  : path.join(packageRoot, "registry.json");
const repositoryPrefix = "wrg32786/aigent-design-system/";
const defaultInstall = "aigent-design-skill";

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function safeRegistryPath(parent, declared) {
  if (!declared || path.isAbsolute(declared)) throw new Error(`Unsafe registry include: ${declared}`);
  const resolved = path.resolve(path.dirname(parent), declared);
  if (resolved !== packageRoot && !resolved.startsWith(`${packageRoot}${path.sep}`)) {
    throw new Error(`Registry include leaves the package: ${declared}`);
  }
  return resolved;
}

function readRegistryFile(file, seen = new Set()) {
  if (seen.has(file)) throw new Error(`Registry include cycle: ${path.relative(packageRoot, file)}`);
  if (!fs.existsSync(file)) throw new Error(`Registry not found: ${file}`);
  seen.add(file);

  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const base = file === registryPath ? "" : path.relative(packageRoot, path.dirname(file)).split(path.sep).join("/");
  const items = (source.items || []).map((item) => ({
    ...item,
    files: (item.files || []).map((entry) => ({
      ...entry,
      path: base ? path.posix.normalize(`${base}/${entry.path}`) : entry.path,
    })),
  }));

  for (const include of source.include || []) {
    items.push(...readRegistryFile(safeRegistryPath(file, include), new Set(seen)).items);
  }
  return { ...source, items };
}

function readRegistry() {
  return readRegistryFile(registryPath);
}

function dependencyName(dependency) {
  const address = dependency.split("#")[0];
  if (!address.includes("/")) return address;
  if (address.startsWith(repositoryPrefix)) return address.slice(repositoryPrefix.length);
  throw new Error(`The local CLI cannot install external registry dependency: ${dependency}`);
}

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function flags(args) {
  return {
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
    target: path.resolve(option(args, "--target", process.cwd())),
  };
}

function destinationFor(file, targetRoot) {
  const declared = file.target || `~/${file.path}`;
  const relative = declared.startsWith("~/") ? declared.slice(2) : declared;
  const destination = path.resolve(targetRoot, relative);
  if (destination !== targetRoot && !destination.startsWith(`${targetRoot}${path.sep}`)) {
    throw new Error(`Refusing target outside project: ${declared}`);
  }
  return destination;
}

function list(registry) {
  const width = Math.max(...registry.items.map((item) => item.name.length));
  for (const item of registry.items) console.log(`${item.name.padEnd(width)}  ${item.description}`);
}

function resolveItems(registry, name, stack = [], resolved = []) {
  const item = registry.items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Unknown item: ${name}. Run "aigent-design list".`);
  if (stack.includes(name)) throw new Error(`Registry dependency cycle: ${[...stack, name].join(" -> ")}`);
  if (resolved.some((candidate) => candidate.name === name)) return resolved;

  for (const dependency of item.registryDependencies || []) {
    resolveItems(registry, dependencyName(dependency), [...stack, name], resolved);
  }
  resolved.push(item);
  return resolved;
}

function sameFile(source, destination) {
  return fs.existsSync(destination) && fs.readFileSync(source).equals(fs.readFileSync(destination));
}

function add(registry, name, args, { friendly = false } = {}) {
  const items = resolveItems(registry, name);
  const { force, dryRun, target } = flags(args);
  const byDestination = new Map();

  for (const item of items) {
    for (const file of item.files) {
      const source = path.resolve(packageRoot, file.path);
      const destination = destinationFor(file, target);
      if (!source.startsWith(`${packageRoot}${path.sep}`) || !fs.existsSync(source)) {
        throw new Error(`Registry source is missing: ${file.path}`);
      }
      const existing = byDestination.get(destination);
      if (existing && existing.source !== source) {
        throw new Error(`Registry items target the same file from different sources: ${file.target}`);
      }
      byDestination.set(destination, { item: item.name, file, source, destination });
    }
  }

  const operations = [...byDestination.values()].map((operation) => ({
    ...operation,
    exists: fs.existsSync(operation.destination),
    identical: sameFile(operation.source, operation.destination),
  }));
  const conflicts = operations.filter((operation) => operation.exists && !operation.identical && !force);
  if (conflicts.length) {
    const files = conflicts.map((operation) => path.relative(target, operation.destination)).join("\n- ");
    throw new Error(`Aigent found existing project files it will not overwrite. Re-run with --force only if you want to replace them:\n- ${files}`);
  }

  if (friendly) console.log(`Installing Aigent into ${target}`);
  else console.log(`${dryRun ? "Would install" : "Installing"} ${name} with ${items.length - 1} dependencies into ${target}`);

  let changed = 0;
  for (const operation of operations) {
    const relative = path.relative(target, operation.destination);
    if (operation.identical) {
      if (!friendly) console.log(`  keep    ${relative}`);
      continue;
    }
    changed += 1;
    if (!friendly) console.log(`  ${operation.exists ? "replace" : "create"} ${relative}`);
    if (dryRun) continue;
    fs.mkdirSync(path.dirname(operation.destination), { recursive: true });
    fs.copyFileSync(operation.source, operation.destination);
  }

  if (dryRun) return;
  if (friendly) {
    console.log(changed ? `✓ Aigent installed (${changed} files updated).` : "✓ Aigent is already installed and up to date.");
    console.log("\nNext:\n  1. Open Claude Code in this repo: claude\n  2. Say: \"Use Aigent to help me design this.\"\n\nYou do not need to memorize Aigent commands. Claude routes the design skills for you.");
  } else {
    console.log(`Installed ${changed} changed files.`);
  }
}

function doctor(registry) {
  const failures = [];
  if (Number(process.versions.node.split(".")[0]) < 20) failures.push("Node.js 20 or newer is required.");
  for (const item of registry.items) {
    for (const file of item.files) {
      if (!fs.existsSync(path.join(packageRoot, file.path))) failures.push(`Missing registry source: ${file.path}`);
    }
  }
  if (failures.length) {
    failures.forEach((message) => console.error(`error: ${message}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Aigent doctor passed: ${registry.items.length} installable items, Node ${process.versions.node}.`);
}

async function plan(args) {
  const optionValues = new Set([option(args, "--out")].filter(Boolean));
  const brief = args.find((arg) => !arg.startsWith("--") && !optionValues.has(arg));
  if (!brief) throw new Error("Usage: aigent-design plan <brief.json> [--out plan.json]");

  const planner = await import(pathToFileURL(path.join(packageRoot, "scripts/plan-design.mjs")));
  const source = JSON.parse(fs.readFileSync(path.resolve(brief), "utf8"));
  const result = planner.plan(source);
  const out = option(args, "--out");
  const text = `${JSON.stringify(result, null, 2)}\n`;
  if (out) {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(path.resolve(out), text);
    console.log(`Wrote ${out}`);
  } else process.stdout.write(text);
}

async function inspire(args) {
  const { runInspire } = await import(pathToFileURL(path.join(packageRoot, "scripts/inspire.mjs")));
  await runInspire(args);
}

async function resolve(args) {
  const { runResolve } = await import(pathToFileURL(path.join(packageRoot, "scripts/resolve-design.mjs")));
  await runResolve(args);
}

async function vision(args) {
  const { runVision } = await import(pathToFileURL(path.join(packageRoot, "scripts/vision-review.mjs")));
  await runVision(args);
}

async function publish(args) {
  const { runPublish } = await import(pathToFileURL(path.join(packageRoot, "scripts/publish-site.mjs")));
  await runPublish(args);
}

function help() {
  console.log(`Aigent\n\nQuick start:\n  install [--target dir] [--force]\n\nAdvanced:\n  list\n  add <item> [--target dir] [--dry-run] [--force]\n  plan <brief.json> [--out plan.json]\n  inspire <add|list|inspect|search|compose|apply|audit|doctor> ...\n  resolve [--target dir] [--url url] [--init] [--no-fail]\n  vision <prepare|check|finalize> ...\n  publish <export|auth|deploy|rollback|status> ...\n  doctor\n`);
}

try {
  const registry = readRegistry();
  const [command = "help", ...args] = process.argv.slice(2);
  if (command === "install") add(registry, defaultInstall, args, { friendly: true });
  else if (command === "list") list(registry);
  else if (command === "add") {
    if (!args[0]) throw new Error("Usage: aigent-design add <item> [--target dir] [--dry-run] [--force]");
    add(registry, args[0], args.slice(1));
  } else if (command === "doctor") doctor(registry);
  else if (command === "plan") await plan(args);
  else if (command === "inspire") await inspire(args);
  else if (command === "resolve") await resolve(args);
  else if (command === "vision") await vision(args);
  else if (command === "publish") await publish(args);
  else help();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
