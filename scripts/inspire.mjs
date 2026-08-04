#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  hasFlag,
  isUrl,
  option,
  parseList,
  parseViewports,
  positional,
  readJson,
  writeJson,
} from "../inspiration/lib/common.mjs";
import { importFile } from "../inspiration/lib/file-forensics.mjs";
import { auditOriginality } from "../inspiration/lib/originality.mjs";
import { captureUrl } from "../inspiration/lib/url-forensics.mjs";
import {
  applyDirection,
  auditPlanTarget,
  composeFromStore,
  searchSources,
} from "../inspiration/lib/synthesis.mjs";
import { listSources, loadSource, openStore, resolveSources } from "../inspiration/lib/store.mjs";
import { summarizeDesignDna } from "../inspiration/lib/design-dna.mjs";

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function root(args) {
  return path.resolve(option(args, "--root", ".aigent/inspiration"));
}

function output(value, file) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (!file) return process.stdout.write(text);
  writeJson(path.resolve(file), value);
  console.log(`Wrote ${file}`);
}

function parseAssignments(value) {
  return Object.fromEntries(parseList(value).map((entry) => {
    const [dimension, id] = entry.split(":").map((part) => part.trim());
    if (!dimension || !id) throw new Error(`Invalid assignment "${entry}". Use structure:source-id,typography:source-id.`);
    return [dimension, id];
  }));
}

async function add(args) {
  const values = positional(args, ["--root", "--label", "--id", "--viewports", "--frames", "--scroll-steps", "--timeout", "--analysis", "--kind"]);
  const input = values[0];
  if (!input) throw new Error("Usage: aigent-design inspire add <url|file> [--label name] [--root dir]");
  const options = {
    root: root(args),
    label: option(args, "--label"),
    id: option(args, "--id"),
    frames: Number(option(args, "--frames", 7)),
    scrollSteps: Number(option(args, "--scroll-steps", 8)),
    timeout: Number(option(args, "--timeout", 30000)),
    raw: hasFlag(args, "--raw"),
    viewports: parseViewports(option(args, "--viewports")),
    analysis: option(args, "--analysis"),
    kind: option(args, "--kind"),
  };
  const result = isUrl(input) ? await captureUrl(input, options) : importFile(input, options);
  console.log(`Added ${result.source.id}: ${result.source.label}`);
  console.log(`Design DNA: ${path.join(result.directory, "design-dna.json")}`);
  console.log(`Report: ${path.join(result.directory, result.source.report || "report.html")}`);
}

function list(args) {
  const sources = listSources(openStore(root(args)));
  if (hasFlag(args, "--json")) return output(sources, option(args, "--out"));
  if (!sources.length) return console.log("No inspiration sources. Add a URL or file first.");
  const width = Math.max(...sources.map((source) => source.id.length));
  for (const source of sources) console.log(`${source.id.padEnd(width)}  ${source.kind.padEnd(20)}  ${Math.round((source.confidence || 0) * 100).toString().padStart(3)}%  ${source.label}`);
}

function inspect(args) {
  const id = positional(args, ["--root", "--out"])[0];
  if (!id) throw new Error("Usage: aigent-design inspire inspect <source-id> [--json]");
  const source = loadSource(openStore(root(args)), id);
  const value = hasFlag(args, "--summary") ? { ...source, designDna: summarizeDesignDna(source.designDna), directory: undefined } : { ...source, directory: undefined };
  output(value, option(args, "--out"));
}

function search(args) {
  const query = positional(args, ["--root", "--limit", "--out"])[0] || "";
  const results = searchSources(query, { root: root(args), limit: Number(option(args, "--limit", 12)) });
  if (hasFlag(args, "--json") || option(args, "--out")) return output(results, option(args, "--out"));
  for (const result of results) console.log(`${String(Math.round(result.score * 100)).padStart(3)}  ${result.id}  ${result.label}`);
}

function compose(args) {
  const briefFile = option(args, "--brief");
  const ids = parseList(option(args, "--refs"));
  if (!briefFile || !ids.length) throw new Error("Usage: aigent-design inspire compose --brief brief.json --refs source-a,source-b [--out plan.json]");
  const brief = readJson(path.resolve(briefFile));
  const result = composeFromStore(brief, ids, {
    root: root(args),
    id: option(args, "--id"),
    threshold: Number(option(args, "--threshold", 0.72)),
    assignments: parseAssignments(option(args, "--assign")),
  });
  const clean = { ...result.plan };
  delete clean.markdown;
  if (option(args, "--out")) output(clean, option(args, "--out"));
  console.log(`Composed ${result.plan.id} from ${ids.length} references.`);
  console.log(`Direction: ${path.join(result.directory, "DIRECTION.md")}`);
}

function apply(args) {
  const values = positional(args, ["--target"]);
  const planFile = values[0];
  const target = option(args, "--target", ".");
  if (!planFile) throw new Error("Usage: aigent-design inspire apply <inspiration-plan.json> --target <project>");
  const plan = readJson(path.resolve(planFile));
  const markdownFile = path.join(path.dirname(path.resolve(planFile)), "DIRECTION.md");
  if (fs.existsSync(markdownFile)) plan.markdown = fs.readFileSync(markdownFile, "utf8");
  const directory = applyDirection(plan, target);
  console.log(`Applied inspiration direction to ${directory}`);
}

function audit(args) {
  const targetDnaFile = option(args, "--target-dna");
  const targetSource = option(args, "--source");
  const planFile = option(args, "--plan");
  const ids = parseList(option(args, "--refs"));
  if (!targetDnaFile && !targetSource) throw new Error("Usage: aigent-design inspire audit --target-dna design-dna.json --refs a,b [--plan plan.json]");
  const store = openStore(root(args));
  const targetDna = targetSource ? loadSource(store, targetSource).designDna : readJson(path.resolve(targetDnaFile));
  const references = ids.length ? resolveSources(store, ids) : [];
  let result;
  if (planFile) {
    const plan = readJson(path.resolve(planFile));
    const referenceIds = ids.length ? ids : plan.references.map((reference) => reference.id);
    result = auditPlanTarget(targetDna, plan, resolveSources(store, referenceIds));
  } else result = auditOriginality(targetDna, references, { threshold: Number(option(args, "--threshold", 0.72)) });
  output(result, option(args, "--out"));
  if (result.verdict === "review" && hasFlag(args, "--strict")) process.exitCode = 1;
}

async function doctor(args) {
  const store = openStore(root(args));
  let playwright = false;
  try { await import("playwright"); playwright = true; } catch {}
  console.log(`Inspiration store: ${store.root}`);
  console.log(`Sources: ${listSources(store).length}`);
  console.log(`Playwright: ${playwright ? "available" : "missing (needed only for URL forensics)"}`);
  if (!playwright && hasFlag(args, "--strict")) process.exitCode = 1;
}

function help() {
  console.log(`AIgent Inspiration Intelligence\n\nCommands:\n  add <url|file> [--label name] [--viewports desktop:1440x1000,mobile:390x844]\n  list [--json]\n  inspect <source-id> [--summary]\n  search <query> [--limit 12]\n  compose --brief brief.json --refs source-a,source-b [--assign structure:a,motion:b]\n  apply <inspiration-plan.json> --target <project>\n  audit --target-dna design-dna.json --refs source-a,source-b [--strict]\n  doctor\n\nAll source captures are stored under .aigent/inspiration by default.\n`);
}

export async function runInspire(argv = process.argv.slice(2)) {
  const [command = "help", ...args] = argv;
  if (command === "add") await add(args);
  else if (command === "list") list(args);
  else if (command === "inspect") inspect(args);
  else if (command === "search") search(args);
  else if (command === "compose") compose(args);
  else if (command === "apply") apply(args);
  else if (command === "audit") audit(args);
  else if (command === "doctor") await doctor(args);
  else help();
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runInspire().catch((error) => fail(error instanceof Error ? error.message : String(error)));
