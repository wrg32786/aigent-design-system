#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parse(argv) {
  const result = { command: "create", target: null, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--command") result.command = argv[++index];
    else if (value === "--target") result.target = argv[++index];
    else if (value === "--json") result.json = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return result;
}

function findProjectRoot(start) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, "PRODUCT.md")) || fs.existsSync(path.join(current, "DESIGN.md"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(start);
    current = parent;
  }
}

function firstHeading(content) {
  return content.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "") || null;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, "..");
const commands = JSON.parse(fs.readFileSync(path.join(skillRoot, "commands.json"), "utf8")).commands;

try {
  const args = parse(process.argv.slice(2));
  const command = commands.find((item) => item.name === args.command);
  if (!command) throw new Error(`Unknown command: ${args.command}`);

  const projectRoot = findProjectRoot(process.cwd());
  const files = [
    "PRODUCT.md",
    "DESIGN.md",
    args.target,
    path.relative(projectRoot, path.join(skillRoot, command.reference)),
    path.relative(projectRoot, path.join(skillRoot, "reference/craft-floor.md"))
  ].filter(Boolean);

  const context = files.map((relative) => {
    const absolute = path.isAbsolute(relative) ? relative : path.resolve(projectRoot, relative);
    return {
      path: path.relative(projectRoot, absolute) || path.basename(absolute),
      exists: fs.existsSync(absolute),
      heading: fs.existsSync(absolute) ? firstHeading(fs.readFileSync(absolute, "utf8")) : null
    };
  });

  const output = {
    projectRoot,
    command: command.name,
    owns: command.owns,
    reference: command.reference,
    context,
    next: command.name === "shape"
      ? "Read context, resolve the brief, and stop before code."
      : "Read only the listed context, inspect representative implementation truth, then build and verify."
  };

  if (args.json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`AIgent Design command: ${output.command}`);
    console.log(output.owns);
    for (const item of context) console.log(`${item.exists ? "read" : "missing"}  ${item.path}${item.heading ? ` — ${item.heading}` : ""}`);
    console.log(output.next);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
