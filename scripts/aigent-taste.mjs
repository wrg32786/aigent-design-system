import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage", ".aigent", "artifacts", "desktop-dist"]);

const RULES = [
  { id: "gradient-text", severity: "warning", re: /(?:background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text|bg-clip-text)/gi, message: "Generic gradient text is a common generated-design tell; use it only when the visual world earns it." },
  { id: "ai-gradient", severity: "warning", re: /(?:linear|radial)-gradient\([^)]*(?:purple|violet|indigo|#(?:7c3aed|8b5cf6|6366f1))[^)]*(?:blue|cyan|#(?:3b82f6|06b6d4))/gi, message: "Purple/indigo-to-blue gradients are an AI-design default; choose a product-specific palette." },
  { id: "overused-font", severity: "warning", re: /font-family\s*:\s*[^;]*(?:\bInter\b|\bArial\b|system-ui)/gi, message: "Brand-defining surfaces should not default to overused/system display typography." },
  { id: "bounce-easing", severity: "warning", re: /(?:bounce|elastic|cubic-bezier\s*\(\s*0\.68\s*,\s*-0\.55|cubic-bezier\s*\(\s*0\.175\s*,\s*0\.885)/gi, message: "Bounce/elastic motion needs a physical reason; prefer purposeful restrained easing." },
  { id: "fade-up-repetition", severity: "warning", re: /(?:fade[-_ ]?up|translateY\([^)]*\).*opacity|opacity[^;{}]*[;}]?[^{}]{0,120}translateY\()/gi, minMatches: 4, message: "Repeated fade-up reveals flatten authored motion into a generic template pattern." },
  { id: "pill-overuse", severity: "warning", re: /border-radius\s*:\s*(?:9999px|999px|100vw|50rem)|rounded-full/g, minMatches: 6, message: "Pill shapes appear heavily repeated; reserve them for compact controls, status, or intentional brand actions." },
  { id: "card-language", severity: "warning", re: /\b(?:card|feature-card|pricing-card|info-card)\b/gi, minMatches: 8, message: "The surface appears card-dominant; verify that proximity, rules, or a stronger composition would not communicate hierarchy better." },
  { id: "glow-overuse", severity: "warning", re: /(?:box-shadow|filter)\s*:[^;]*(?:0 0|drop-shadow)/gi, minMatches: 6, message: "Glow appears heavily repeated; tie emitted light to active instrumentation or meaningful media." },
];

function walk(root, out = []) {
  if (!fs.existsSync(root)) return out;
  const stat = fs.statSync(root);
  if (stat.isFile()) return TEXT_EXTENSIONS.has(path.extname(root).toLowerCase()) ? [root] : out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) walk(absolute, out);
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(absolute);
  }
  return out;
}

function lineFor(source, index) {
  return source.slice(0, index).split("\n").length;
}

function addMatches(findings, source, file, rule) {
  const matches = [...source.matchAll(rule.re)];
  if (matches.length < (rule.minMatches || 1)) return;
  const first = matches[0];
  findings.push({
    id: rule.id,
    severity: rule.severity,
    file,
    line: lineFor(source, first.index || 0),
    count: matches.length,
    message: rule.message,
  });
}

function nestedCards(source, file, findings) {
  const cardOpen = /<(?:div|section|article)[^>]*(?:class|data-[\w-]+)=["'][^"']*\bcard\b[^"']*["'][^>]*>/gi;
  const matches = [...source.matchAll(cardOpen)];
  for (const match of matches) {
    const start = match.index || 0;
    const next = source.slice(start + match[0].length, start + match[0].length + 1200);
    cardOpen.lastIndex = 0;
    if (!cardOpen.test(next)) continue;
    findings.push({ id: "nested-cards", severity: "warning", file, line: lineFor(source, start), count: 1, message: "Card-like containers appear nested; use hierarchy and proximity before adding another container." });
    break;
  }
}

export function checkTaste(targets, { root = process.cwd() } = {}) {
  const requested = targets?.length ? targets : [root];
  const files = [...new Set(requested.flatMap((target) => walk(path.resolve(root, target))))].sort();
  const findings = [];
  for (const absolute of files) {
    const relative = path.relative(root, absolute) || path.basename(absolute);
    const source = fs.readFileSync(absolute, "utf8");
    for (const rule of RULES) addMatches(findings, source, relative, rule);
    if (/\.html?$/.test(absolute)) nestedCards(source, relative, findings);
  }
  return { files: files.map((file) => path.relative(root, file)), findings };
}

function print(result, { json = false } = {}) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  for (const item of result.findings) console.log(`[taste] ${item.file}:${item.line} ${item.id}${item.count > 1 ? ` ×${item.count}` : ""} — ${item.message}`);
  console.log(`AIgent Taste: ${result.findings.length} findings across ${result.files.length} files.`);
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const strict = args.includes("--strict");
  const targets = args.filter((arg) => !arg.startsWith("--"));
  const result = checkTaste(targets);
  print(result, { json });
  if (strict && result.findings.length) process.exitCode = 1;
}
