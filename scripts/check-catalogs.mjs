import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const allowedCostTiers = new Set(["free", "freemium", "low-cost", "subscription", "paid", "local-free"]);
const allowedLicenseStatuses = new Set(["clear", "item-specific", "plan-specific", "restricted", "verify"]);
const allowedCommercialUse = new Set(["yes", "with-attribution", "paid-plan", "no", "verify"]);
const allowedAttribution = new Set(["not-required", "required", "item-specific", "plan-specific", "verify"]);
const allowedRoutes = new Set(["source", "generate", "produce"]);
const allowedPhases = new Set(["runtime", "build-time", "authoring-and-runtime"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validUrl(value) {
  if (value == null) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function add(findings, severity, file, item, message) {
  findings.push({ severity, file, item, message });
}

function scanForSecrets(value, location, findings, file) {
  if (typeof value === "string") {
    const secretPatterns = [
      /\bsk-[A-Za-z0-9_-]{16,}\b/,
      /\bghp_[A-Za-z0-9]{20,}\b/,
      /\bAKIA[A-Z0-9]{16}\b/,
      /\bAIza[A-Za-z0-9_-]{20,}\b/,
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
    ];
    if (secretPatterns.some((pattern) => pattern.test(value))) {
      add(findings, "error", file, location, "Possible credential or private key in public catalog.");
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${location}[${index}]`, findings, file));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (/^(api[-_]?key|access[-_]?token|secret|password)$/i.test(key) && entry) {
        add(findings, "error", file, `${location}.${key}`, "Credential-shaped field must not contain a public value.");
      }
      scanForSecrets(entry, `${location}.${key}`, findings, file);
    }
  }
}

export function checkCatalogs(root = process.cwd()) {
  const findings = [];
  const resourceFile = path.join(root, "creative-production/catalog.json");
  const integrationFile = path.join(root, "integrations/catalog.json");

  for (const file of [resourceFile, integrationFile]) {
    if (!fs.existsSync(file)) {
      add(findings, "error", path.relative(root, file), "<file>", "Catalog file is missing.");
    }
  }

  if (findings.length) return findings;

  const resources = readJson(resourceFile);
  const resourcePath = path.relative(root, resourceFile);
  if (resources.schemaVersion !== 1) add(findings, "error", resourcePath, "<catalog>", "schemaVersion must be 1.");
  if (!validDate(resources.verifiedAt)) add(findings, "error", resourcePath, "<catalog>", "verifiedAt must be YYYY-MM-DD.");
  if (!Array.isArray(resources.resources) || !resources.resources.length) {
    add(findings, "error", resourcePath, "<catalog>", "resources must be a non-empty array.");
  } else {
    const ids = new Set();
    for (const item of resources.resources) {
      const label = item?.id || "<unknown>";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label)) add(findings, "error", resourcePath, label, "id must be lowercase kebab-case.");
      if (ids.has(label)) add(findings, "error", resourcePath, label, "duplicate resource id.");
      ids.add(label);

      if (!item.name) add(findings, "error", resourcePath, label, "name is required.");
      if (!Array.isArray(item.categories) || !item.categories.length) add(findings, "error", resourcePath, label, "categories must be non-empty.");
      if (!allowedRoutes.has(item.route)) add(findings, "error", resourcePath, label, `invalid route: ${item.route}`);
      if (!allowedCostTiers.has(item.costTier)) add(findings, "error", resourcePath, label, `invalid costTier: ${item.costTier}`);
      if (!allowedLicenseStatuses.has(item.licenseStatus)) add(findings, "error", resourcePath, label, `invalid licenseStatus: ${item.licenseStatus}`);
      if (!allowedCommercialUse.has(item.commercialUse)) add(findings, "error", resourcePath, label, `invalid commercialUse: ${item.commercialUse}`);
      if (!allowedAttribution.has(item.attribution)) add(findings, "error", resourcePath, label, `invalid attribution: ${item.attribution}`);
      if (!item.license) add(findings, "error", resourcePath, label, "license summary is required.");
      for (const field of ["officialUrl", "licenseUrl", "pricingUrl"]) {
        if (!validUrl(item[field])) add(findings, "error", resourcePath, label, `${field} must be an http(s) URL or null.`);
      }
      if (!validDate(item.verifiedAt)) add(findings, "error", resourcePath, label, "verifiedAt must be YYYY-MM-DD.");
      if (!Array.isArray(item.bestFor) || !item.bestFor.length) add(findings, "error", resourcePath, label, "bestFor must be non-empty.");
      if (!Array.isArray(item.cautions)) add(findings, "error", resourcePath, label, "cautions must be an array.");
      if (item.licenseStatus !== "clear" && item.commercialUse === "yes" && !item.cautions.length) {
        add(findings, "warning", resourcePath, label, "Non-clear license should explain its production caveat.");
      }
    }
  }
  scanForSecrets(resources, "resources", findings, resourcePath);

  const integrations = readJson(integrationFile);
  const integrationPath = path.relative(root, integrationFile);
  if (integrations.schemaVersion !== 1) add(findings, "error", integrationPath, "<catalog>", "schemaVersion must be 1.");
  if (!validDate(integrations.verifiedAt)) add(findings, "error", integrationPath, "<catalog>", "verifiedAt must be YYYY-MM-DD.");
  if (!Array.isArray(integrations.integrations) || !integrations.integrations.length) {
    add(findings, "error", integrationPath, "<catalog>", "integrations must be a non-empty array.");
  } else {
    const ids = new Set();
    for (const item of integrations.integrations) {
      const label = item?.id || "<unknown>";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label)) add(findings, "error", integrationPath, label, "id must be lowercase kebab-case.");
      if (ids.has(label)) add(findings, "error", integrationPath, label, "duplicate integration id.");
      ids.add(label);

      if (!item.name || !item.role || !item.install || !item.license) add(findings, "error", integrationPath, label, "name, role, install, and license are required.");
      if (!allowedPhases.has(item.phase)) add(findings, "error", integrationPath, label, `invalid phase: ${item.phase}`);
      if (typeof item.required !== "boolean") add(findings, "error", integrationPath, label, "required must be boolean.");
      for (const field of ["officialUrl", "licenseUrl", "docsUrl"]) {
        if (!validUrl(item[field])) add(findings, "error", integrationPath, label, `${field} must be an http(s) URL.`);
      }
      if (!Array.isArray(item.useWhen) || !item.useWhen.length) add(findings, "error", integrationPath, label, "useWhen must be non-empty.");
      if (!Array.isArray(item.avoidWhen) || !item.avoidWhen.length) add(findings, "error", integrationPath, label, "avoidWhen must be non-empty.");
      if (!item.relatedSkill || !fs.existsSync(path.join(root, item.relatedSkill))) {
        add(findings, "error", integrationPath, label, `relatedSkill does not exist: ${item.relatedSkill}`);
      }
      const readme = path.join(root, "integrations", label, "README.md");
      if (!fs.existsSync(readme)) add(findings, "error", integrationPath, label, `integration README is missing: integrations/${label}/README.md`);
    }
  }
  scanForSecrets(integrations, "integrations", findings, integrationPath);

  return findings;
}

function print(findings) {
  for (const item of findings) {
    const marker = item.severity === "error" ? "error" : "warn";
    console.log(`[${marker}] ${item.file} ${item.item} — ${item.message}`);
  }
  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.length - errors;
  console.log(`Catalog check: ${errors} errors, ${warnings} warnings.`);
  return { errors, warnings };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  try {
    const findings = checkCatalogs();
    const totals = print(findings);
    if (totals.errors) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
