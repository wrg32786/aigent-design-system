#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = process.env.AIGENT_REGISTRY_PATH
  ? path.resolve(process.env.AIGENT_REGISTRY_PATH)
  : path.join(packageRoot, "registry.json");
const repositoryPrefix = "wrg32786/aigent-design-system/";
const defaultInstall = "aigent-design-skill";
const installManifest = ".aigent/install.json";
const ignoreBlock = `# aigent-runtime-start\n.aigent/inspiration/\n.aigent/resolve/\n.aigent/publish/\n.aigent/**/*.png\n.aigent/**/*.webm\n# aigent-runtime-end`;

function fail(message) { console.error(message); process.exitCode = 1; }

function safeRegistryPath(parent, declared) {
  if (!declared || path.isAbsolute(declared)) throw new Error(`Unsafe registry include: ${declared}`);
  const resolved = path.resolve(path.dirname(parent), declared);
  if (resolved !== packageRoot && !resolved.startsWith(`${packageRoot}${path.sep}`)) throw new Error(`Registry include leaves the package: ${declared}`);
  return resolved;
}

function readRegistryFile(file, seen = new Set()) {
  if (seen.has(file)) throw new Error(`Registry include cycle: ${path.relative(packageRoot, file)}`);
  if (!fs.existsSync(file)) throw new Error(`Registry not found: ${file}`);
  seen.add(file);
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const base = file === registryPath ? "" : path.relative(packageRoot, path.dirname(file)).split(path.sep).join("/");
  const items = (source.items || []).map((item) => ({ ...item, files: (item.files || []).map((entry) => ({ ...entry, path: base ? path.posix.normalize(`${base}/${entry.path}`) : entry.path })) }));
  for (const include of source.include || []) items.push(...readRegistryFile(safeRegistryPath(file, include), new Set(seen)).items);
  return { ...source, items };
}

function readRegistry() { return readRegistryFile(registryPath); }
function option(args, name, fallback = null) { const index = args.indexOf(name); return index >= 0 ? args[index + 1] ?? fallback : fallback; }
function flags(args) { return { force: args.includes("--force"), dryRun: args.includes("--dry-run"), target: path.resolve(option(args, "--target", process.cwd())) }; }

function dependencyName(dependency) {
  const address = dependency.split("#")[0];
  if (!address.includes("/")) return address;
  if (address.startsWith(repositoryPrefix)) return address.slice(repositoryPrefix.length);
  throw new Error(`The local CLI cannot install external registry dependency: ${dependency}`);
}

function destinationFor(file, targetRoot) {
  const declared = file.target || `~/${file.path}`;
  const relative = declared.startsWith("~/") ? declared.slice(2) : declared;
  const destination = path.resolve(targetRoot, relative);
  if (destination !== targetRoot && !destination.startsWith(`${targetRoot}${path.sep}`)) throw new Error(`Refusing target outside project: ${declared}`);
  return destination;
}

function filesUnder(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

function hashFile(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function readManifest(target) { const file = path.join(target, installManifest); return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null; }
function writeManifest(target, files) {
  const file = path.join(target, installManifest);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const version = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")).version;
  fs.writeFileSync(file, `${JSON.stringify({ schemaVersion: 1, version, installedAt: new Date().toISOString(), files }, null, 2)}\n`);
}

function updateGitignore(target) {
  const file = path.join(target, ".gitignore");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (existing.includes("# aigent-runtime-start")) return;
  fs.writeFileSync(file, `${existing}${existing && !existing.endsWith("\n") ? "\n" : ""}${ignoreBlock}\n`);
}

function removeGitignoreBlock(target) {
  const file = path.join(target, ".gitignore");
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/# aigent-runtime-start\n[\s\S]*?# aigent-runtime-end\n?/m, ""));
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
  for (const dependency of item.registryDependencies || []) resolveItems(registry, dependencyName(dependency), [...stack, name], resolved);
  resolved.push(item);
  return resolved;
}

function sameFile(source, destination) { return fs.existsSync(destination) && fs.readFileSync(source).equals(fs.readFileSync(destination)); }

function defaultOperations(registry, target) {
  const item = registry.items.find((candidate) => candidate.name === defaultInstall);
  if (!item) throw new Error(`Missing default install item: ${defaultInstall}`);
  const operations = [];
  for (const file of item.files || []) {
    const destination = destinationFor(file, target);
    const relative = path.relative(target, destination).split(path.sep).join("/");
    if (!relative.startsWith(".claude/skills/aigent-design/") || relative.endsWith("/reference/canvas.md")) continue;
    operations.push({ item: item.name, file, source: path.resolve(packageRoot, file.path), destination });
  }
  const publishSource = path.join(packageRoot, "skills", "aigent-design", "reference", "publish.md");
  operations.push({ item: item.name, file: { path: "skills/aigent-design/reference/publish.md" }, source: publishSource, destination: path.join(target, ".claude", "skills", "aigent-design", "reference", "publish.md") });
  const exemplarRoot = path.join(packageRoot, "skills", "aigent-design", "visual-exemplars");
  for (const source of filesUnder(exemplarRoot)) {
    const relative = path.relative(exemplarRoot, source);
    operations.push({ item: defaultInstall, file: { path: relative }, source, destination: path.join(target, ".claude", "skills", "aigent-design", "visual-exemplars", relative) });
  }
  return operations;
}

function add(registry, name, args, { friendly = false } = {}) {
  const { force, dryRun, target } = flags(args);
  const items = friendly && name === defaultInstall ? [] : resolveItems(registry, name);
  const raw = friendly && name === defaultInstall
    ? defaultOperations(registry, target)
    : items.flatMap((item) => (item.files || []).map((file) => ({ item: item.name, file, source: path.resolve(packageRoot, file.path), destination: destinationFor(file, target) })));
  const byDestination = new Map();
  for (const operation of raw) {
    if (!operation.source.startsWith(`${packageRoot}${path.sep}`) || !fs.existsSync(operation.source)) throw new Error(`Registry source is missing: ${operation.file.path}`);
    const existing = byDestination.get(operation.destination);
    if (existing && existing.source !== operation.source) throw new Error(`Registry items target the same file from different sources: ${operation.file.target}`);
    byDestination.set(operation.destination, operation);
  }

  const previous = friendly ? readManifest(target) : null;
  const operations = [...byDestination.values()].map((operation) => ({ ...operation, exists: fs.existsSync(operation.destination), identical: sameFile(operation.source, operation.destination) }));
  const previousByPath = new Map((previous?.files || []).map((entry) => [entry.path, entry]));
  const conflicts = operations.filter((operation) => {
    if (!operation.exists || operation.identical || force) return false;
    const relative = path.relative(target, operation.destination).split(path.sep).join("/");
    const prior = previousByPath.get(relative);
    return !prior || hashFile(operation.destination) !== prior.hash;
  });
  if (conflicts.length) {
    const files = conflicts.map((operation) => path.relative(target, operation.destination)).join("\n- ");
    throw new Error(`Aigent found project-modified files it will not overwrite. Re-run with --force only if you intend to replace them:\n- ${files}`);
  }

  if (friendly) console.log(`Installing Aigent into ${target}`);
  else console.log(`${dryRun ? "Would install" : "Installing"} ${name} with ${Math.max(0, items.length - 1)} dependencies into ${target}`);

  let changed = 0;
  for (const operation of operations) {
    if (operation.identical) continue;
    changed += 1;
    if (dryRun) continue;
    fs.mkdirSync(path.dirname(operation.destination), { recursive: true });
    fs.copyFileSync(operation.source, operation.destination);
  }

  if (dryRun) return;
  if (friendly) {
    const currentPaths = new Set(operations.map((operation) => path.relative(target, operation.destination).split(path.sep).join("/")));
    for (const old of previous?.files || []) {
      if (currentPaths.has(old.path)) continue;
      const candidate = path.join(target, old.path);
      if (fs.existsSync(candidate) && hashFile(candidate) === old.hash) fs.rmSync(candidate, { force: true });
    }
    updateGitignore(target);
    writeManifest(target, operations.map((operation) => ({ path: path.relative(target, operation.destination).split(path.sep).join("/"), hash: hashFile(operation.destination) })));
    console.log(changed ? `✓ Aigent installed (${changed} vendor files updated).` : "✓ Aigent is already installed and up to date.");
    console.log("\nNext:\n  1. Run: npx github:wrg32786/aigent-design-system init\n  2. Run: npx github:wrg32786/aigent-design-system setup-browser\n  3. Open Claude Code: claude\n  4. Say: \"Use Aigent to help me design this.\"");
  } else console.log(`Installed ${changed} changed files.`);
}

function init(args) {
  const target = path.resolve(option(args, "--target", process.cwd()));
  const out = path.join(target, ".aigent", "project-context.md");
  if (fs.existsSync(out) && !args.includes("--force")) return console.log(`Aigent project context already exists: ${path.relative(target, out)}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(path.join(packageRoot, "docs", "project-context.md"), out);
  updateGitignore(target);
  console.log(`Created ${path.relative(target, out)}. Existing PRODUCT.md, DESIGN.md, brand docs, and source remain authoritative; Aigent did not replace them.`);
}

function uninstall(args) {
  const target = path.resolve(option(args, "--target", process.cwd()));
  const manifest = readManifest(target);
  if (!manifest) return console.log("Aigent install manifest not found; nothing removed.");
  const preserved = [];
  for (const entry of manifest.files || []) {
    const file = path.join(target, entry.path);
    if (!fs.existsSync(file)) continue;
    if (hashFile(file) !== entry.hash) { preserved.push(entry.path); continue; }
    fs.rmSync(file, { force: true });
  }
  fs.rmSync(path.join(target, installManifest), { force: true });
  removeGitignoreBlock(target);
  console.log(`Aigent vendor files removed.${preserved.length ? ` Preserved ${preserved.length} modified file(s):\n- ${preserved.join("\n- ")}` : ""}`);
}

async function setupBrowser() {
  const cli = path.join(packageRoot, "node_modules", "playwright", "cli.js");
  if (!fs.existsSync(cli)) throw new Error("Playwright package is missing from Aigent. Reinstall Aigent and retry.");
  const result = spawnSync(process.execPath, [cli, "install", "chromium"], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("Chromium installation failed.");
  console.log("✓ Aigent browser runtime is ready.");
}

function commandExists(command) { return spawnSync(process.platform === "win32" ? "where" : "which", [command], { stdio: "ignore" }).status === 0; }

async function doctor(registry, args) {
  const failures = [];
  const warnings = [];
  if (Number(process.versions.node.split(".")[0]) < 20) failures.push("Node.js 20 or newer is required.");
  if (!registry.items.some((item) => item.name === defaultInstall)) failures.push("Default Aigent registry item is missing.");
  if (!commandExists("claude")) warnings.push("Claude Code CLI was not found on PATH.");
  try {
    const { chromium } = await import("playwright");
    if (!fs.existsSync(chromium.executablePath())) warnings.push("Chromium is not installed. Run: npx github:wrg32786/aigent-design-system setup-browser");
  } catch { failures.push("Playwright package is unavailable inside Aigent."); }
  const target = path.resolve(option(args, "--target", process.cwd()));
  if (!readManifest(target)) warnings.push("No Aigent install manifest found in this project.");
  failures.forEach((message) => console.error(`error: ${message}`));
  warnings.forEach((message) => console.warn(`warning: ${message}`));
  if (failures.length || (args.includes("--strict") && warnings.length)) process.exitCode = 1;
  else console.log(`Aigent doctor passed with ${warnings.length} warning(s).`);
}

async function plan(args) {
  const optionValues = new Set([option(args, "--out")].filter(Boolean));
  const brief = args.find((arg) => !arg.startsWith("--") && !optionValues.has(arg));
  if (!brief) throw new Error("Usage: aigent-design plan <brief.json> [--out plan.json]");
  const planner = await import(pathToFileURL(path.join(packageRoot, "scripts/plan-design.mjs")));
  const result = planner.plan(JSON.parse(fs.readFileSync(path.resolve(brief), "utf8")));
  const out = option(args, "--out");
  const text = `${JSON.stringify(result, null, 2)}\n`;
  if (out) { fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(path.resolve(out), text); console.log(`Wrote ${out}`); }
  else process.stdout.write(text);
}

function taste(args) {
  const result = spawnSync(process.execPath, [path.join(packageRoot, "scripts", "design-audit.mjs"), "--taste-only", ...(args.length ? args : [process.cwd()])], { stdio: "inherit" });
  if (result.status !== 0) process.exitCode = result.status || 1;
}

async function inspire(args) { const { runInspire } = await import(pathToFileURL(path.join(packageRoot, "scripts/inspire.mjs"))); await runInspire(args); }
async function resolve(args) { const { runResolve } = await import(pathToFileURL(path.join(packageRoot, "scripts/resolve-design.mjs"))); await runResolve(args); }
async function vision(args) { const { runVision } = await import(pathToFileURL(path.join(packageRoot, "scripts/vision-review.mjs"))); await runVision(args); }
async function publish(args) { const { runPublish } = await import(pathToFileURL(path.join(packageRoot, "scripts/publish-site.mjs"))); await runPublish(args); }

function help() {
  console.log(`Aigent\n\nProject setup:\n  install [--target dir] [--force]\n  init [--target dir] [--force]\n  setup-browser\n  doctor [--target dir] [--strict]\n  uninstall [--target dir]\n\nDesign tooling:\n  taste [target]\n  plan <brief.json> [--out plan.json]\n  inspire <add|list|inspect|search|compose|apply|audit|doctor> ...\n  resolve [--target dir] [--url url] [--init] [--no-fail]\n  vision <prepare|check|finalize> ...\n  publish <export|auth|deploy|rollback|status> ...\n\nAdvanced registry:\n  list\n  add <item> [--target dir] [--dry-run] [--force]\n`);
}

try {
  const registry = readRegistry();
  const [command = "help", ...args] = process.argv.slice(2);
  if (command === "install") add(registry, defaultInstall, args, { friendly: true });
  else if (command === "init") init(args);
  else if (command === "setup-browser") await setupBrowser();
  else if (command === "uninstall") uninstall(args);
  else if (command === "doctor") await doctor(registry, args);
  else if (command === "taste") taste(args);
  else if (command === "plan") await plan(args);
  else if (command === "inspire") await inspire(args);
  else if (command === "resolve") await resolve(args);
  else if (command === "vision") await vision(args);
  else if (command === "publish") await publish(args);
  else if (command === "list") list(registry);
  else if (command === "add") {
    if (!args[0]) throw new Error("Usage: aigent-design add <item> [--target dir] [--dry-run] [--force]");
    add(registry, args[0], args.slice(1));
  } else help();
} catch (error) { fail(error instanceof Error ? error.message : String(error)); }
