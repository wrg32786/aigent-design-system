import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const manifestDir = "assets/manifests";
const allowedRoles = new Set(["hero-video", "scene-video", "scrub-video", "poster", "frame-sequence", "3d-model", "texture", "audio", "vfx", "other"]);
const allowedStatuses = new Set(["draft", "approved", "published", "retired"]);
const allowedSourceTypes = new Set(["owned", "commissioned", "stock", "generated", "open-source"]);
const allowedCommercialUse = new Set(["yes", "with-attribution", "paid-plan", "no", "verify"]);
const allowedVariants = new Set(["desktop", "mobile", "poster", "reduced-motion", "source-preview", "shared"]);

const roleBudgets = {
  "hero-video": { desktop: 8_000_000, mobile: 4_000_000 },
  "scene-video": { desktop: 8_000_000, mobile: 4_000_000 },
  "scrub-video": { desktop: 12_000_000, mobile: 6_000_000 },
  "poster": { default: 350_000 },
  "3d-model": { desktop: 5_000_000, mobile: 2_500_000, default: 5_000_000 },
  "texture": { default: 2_000_000 },
  "frame-sequence": { default: 20_000_000 },
  "audio": { default: 1_500_000 }
};

function add(findings, severity, file, message) {
  findings.push({ severity, file, message });
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasSecret(value) {
  return [
    /\bsk-[A-Za-z0-9_-]{16,}\b/,
    /\bghp_[A-Za-z0-9]{20,}\b/,
    /\bAKIA[A-Z0-9]{16}\b/,
    /\bAIza[A-Za-z0-9_-]{20,}\b/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /https?:\/\/[^/\s]+\/[^?\s]+\?(?:[^#\s]*)(?:token|signature|sig|key)=/i
  ].some((pattern) => pattern.test(value));
}

function budgetFor(role, variant) {
  const budget = roleBudgets[role];
  if (!budget) return null;
  return budget[variant] ?? budget.default ?? null;
}

function manifestFiles(root) {
  const dir = path.join(root, manifestDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".json") && name !== "asset-manifest.schema.json")
    .map((name) => path.join(dir, name))
    .sort();
}

export function checkAssetManifests(root = process.cwd(), { strictBudgets = false } = {}) {
  const findings = [];
  const schema = path.join(root, manifestDir, "asset-manifest.schema.json");
  if (!fs.existsSync(schema)) add(findings, "error", path.relative(root, schema), "Manifest schema is missing.");

  const files = manifestFiles(root);
  if (!files.length) add(findings, "error", manifestDir, "At least one manifest or example manifest is required.");

  const ids = new Set();
  for (const absolute of files) {
    const relative = path.relative(root, absolute);
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(absolute, "utf8"));
    } catch (error) {
      add(findings, "error", relative, `Invalid JSON: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    const serialized = JSON.stringify(manifest);
    if (hasSecret(serialized)) add(findings, "error", relative, "Possible credential, private key, or signed URL in public manifest.");

    if (manifest.schemaVersion !== 1) add(findings, "error", relative, "schemaVersion must be 1.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id || "")) add(findings, "error", relative, "id must be lowercase kebab-case.");
    if (ids.has(manifest.id)) add(findings, "error", relative, `Duplicate manifest id: ${manifest.id}`);
    ids.add(manifest.id);

    if (!allowedRoles.has(manifest.role)) add(findings, "error", relative, `Invalid role: ${manifest.role}`);
    if (!allowedStatuses.has(manifest.status)) add(findings, "error", relative, `Invalid status: ${manifest.status}`);

    const source = manifest.source || {};
    if (!allowedSourceTypes.has(source.type)) add(findings, "error", relative, `Invalid source type: ${source.type}`);
    if (!source.provider) add(findings, "error", relative, "source.provider is required.");
    if (!allowedCommercialUse.has(source.commercialUse)) add(findings, "error", relative, `Invalid source.commercialUse: ${source.commercialUse}`);
    if (typeof source.attributionRequired !== "boolean") add(findings, "error", relative, "source.attributionRequired must be boolean.");
    if (source.attributionRequired && !source.attributionText) add(findings, "error", relative, "Attribution text is required when attributionRequired is true.");
    if (!validDate(source.verifiedAt || "")) add(findings, "error", relative, "source.verifiedAt must be YYYY-MM-DD.");
    if (!isHttpUrl(source.sourceUrl)) add(findings, "error", relative, "source.sourceUrl must be an http(s) URL.");
    if (!manifest.exampleOnly && source.commercialUse === "verify") add(findings, "warning", relative, "Commercial use is unresolved.");

    const production = manifest.production || {};
    if (!Array.isArray(production.tools) || !production.tools.length) add(findings, "error", relative, "production.tools must be non-empty.");
    if (typeof production.edited !== "boolean") add(findings, "error", relative, "production.edited must be boolean.");

    if (!Array.isArray(manifest.outputs) || !manifest.outputs.length) {
      add(findings, "error", relative, "outputs must be non-empty.");
      continue;
    }

    for (const [index, output] of manifest.outputs.entries()) {
      const label = `${relative} output ${index + 1}`;
      if (!output.file || !/^assets\/(video|web|audio)\//.test(output.file)) add(findings, "error", label, "file must stay under assets/video, assets/web, or assets/audio.");
      if (!allowedVariants.has(output.variant)) add(findings, "error", label, `Invalid variant: ${output.variant}`);
      if (output.bytes != null && (!Number.isInteger(output.bytes) || output.bytes < 0)) add(findings, "error", label, "bytes must be a non-negative integer.");

      if (!manifest.exampleOnly && output.file) {
        const target = path.join(root, output.file);
        if (!fs.existsSync(target)) {
          add(findings, "error", label, `Output file does not exist: ${output.file}`);
        } else {
          const actual = fs.statSync(target).size;
          if (output.bytes != null && output.bytes !== actual) add(findings, "warning", label, `Declared bytes ${output.bytes} differs from file size ${actual}.`);
          const budget = budgetFor(manifest.role, output.variant);
          if (budget && actual > budget && !output.budgetOverrideReason) {
            add(findings, strictBudgets ? "error" : "warning", label, `File is ${actual} bytes; starting budget is ${budget}. Add budgetOverrideReason or optimize.`);
          }
        }
      } else if (manifest.exampleOnly && output.bytes != null) {
        const budget = budgetFor(manifest.role, output.variant);
        if (budget && output.bytes > budget && !output.budgetOverrideReason) {
          add(findings, "warning", label, `Example exceeds starting budget ${budget}.`);
        }
      }
    }
  }

  return findings;
}

function print(findings) {
  for (const item of findings) {
    const marker = item.severity === "error" ? "error" : "warn";
    console.log(`[${marker}] ${item.file} — ${item.message}`);
  }
  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.length - errors;
  console.log(`Asset check: ${errors} errors, ${warnings} warnings.`);
  return { errors, warnings };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  try {
    const strictBudgets = process.argv.includes("--strict-budgets");
    const findings = checkAssetManifests(process.cwd(), { strictBudgets });
    const totals = print(findings);
    if (totals.errors) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
