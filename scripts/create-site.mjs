#!/usr/bin/env node
// Scaffold the Aigent agent site starter (Astro) into a new directory.
// The registry items "agent-site-starter" and "agent-site-remotion-hero" are the file manifest.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const starterItem = "agent-site-starter";
const remotionItem = "agent-site-remotion-hero";
const targetPrefix = "~/aigent-site/";
const themes = ["graphite", "ember", "cobalt", "paper"];
const specialistSkills = ["gsap-scroll-choreography", "publish-site"];

const usage = `Usage: create-site <dir> [--theme ${themes.join("|")}] [--with-remotion] [--no-install] [--no-skills] [--force]

Creates an Astro site wired to the Aigent design rules, installs the Aigent skills
into <dir>/.claude/skills, and runs npm install (skip with --no-install).`;

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function registryItem(name) {
  const registry = JSON.parse(fs.readFileSync(path.join(packageRoot, "registry.json"), "utf8"));
  const item = registry.items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Registry item is missing: ${name}`);
  return item;
}

export function starterFiles({ withRemotion = false } = {}) {
  const items = [registryItem(starterItem), ...(withRemotion ? [registryItem(remotionItem)] : [])];
  return items.flatMap((item) => item.files.map((file) => {
    if (!file.target?.startsWith(targetPrefix)) throw new Error(`Unexpected starter target: ${file.target}`);
    const relative = file.target.slice(targetPrefix.length);
    if (!relative || path.isAbsolute(relative) || relative.split("/").includes("..")) throw new Error(`Unsafe starter target: ${file.target}`);
    return { source: path.join(packageRoot, file.path), relative };
  }));
}

function packageName(dir) {
  const name = path.basename(dir).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[._-]+|[-]+$/g, "");
  return name || "aigent-site";
}

export function createSite(args) {
  const valueOptions = new Set(["--theme"]);
  const positional = args.filter((arg, index) => !arg.startsWith("--") && !valueOptions.has(args[index - 1]));
  if (!positional[0] || args.includes("--help") || args.includes("-h")) {
    console.log(usage);
    if (!positional[0] && !args.includes("--help") && !args.includes("-h")) process.exitCode = 1;
    return null;
  }
  const target = path.resolve(positional[0]);
  const theme = option(args, "--theme") ?? "graphite";
  if (!themes.includes(theme)) throw new Error(`Unknown theme "${theme}". Use one of: ${themes.join(", ")}.`);
  const withRemotion = args.includes("--with-remotion");
  const force = args.includes("--force");

  if (fs.existsSync(target) && fs.readdirSync(target).length && !force) {
    throw new Error(`${target} is not empty. Choose a new directory or pass --force to write into it.`);
  }

  const files = starterFiles({ withRemotion });
  for (const { source, relative } of files) {
    if (!fs.existsSync(source)) throw new Error(`Starter source is missing: ${path.relative(packageRoot, source)}`);
    const destination = path.join(target, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }

  const pkgFile = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  pkg.name = packageName(target);
  fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);

  const configFile = path.join(target, "src", "site.config.ts");
  fs.writeFileSync(configFile, fs.readFileSync(configFile, "utf8").replace(/theme: "graphite"/, `theme: "${theme}"`));

  if (!args.includes("--no-skills")) {
    const install = spawnSync(process.execPath, [path.join(packageRoot, "scripts", "cli.mjs"), "install", "--target", target], { encoding: "utf8" });
    if (install.status !== 0) throw new Error(`Aigent skill install failed.\n${install.stderr || install.stdout}`);
    for (const skill of [...specialistSkills, ...(withRemotion ? ["remotion-web-assets"] : [])]) {
      const destination = path.join(target, ".claude", "skills", skill, "SKILL.md");
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(packageRoot, "skills", skill, "SKILL.md"), destination);
    }
  }

  if (!args.includes("--no-install")) {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const result = spawnSync(npm, ["install", "--no-audit", "--no-fund"], { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) throw new Error("npm install failed in the new site. Fix the error above, then run npm install there.");
  }

  const relativeTarget = path.relative(process.cwd(), target).startsWith("..") ? target : path.relative(process.cwd(), target) || ".";
  console.log(`\n✓ Aigent site created in ${relativeTarget} (theme: ${theme}${withRemotion ? ", Remotion hero loop folder included, off until you render it" : ""}).`);
  console.log(`\nNext:\n  cd ${relativeTarget}\n${args.includes("--no-install") ? "  npm install\n" : ""}  npm run dev\n\nOpen your agent there (claude, cursor, or codex). AGENTS.md tells it which skills to load and to run "npm run gates" before shipping.`);
  return { target, theme, withRemotion, files: files.length };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  try { createSite(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
