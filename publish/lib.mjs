import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const PUBLISH_PROVIDERS = Object.freeze({
  local: {
    id: "local",
    label: "Local export",
    description: "Create a clean static production bundle without contacting a host.",
    supportsPreview: true,
    supportsProduction: true,
    supportsDomain: false,
    requiresLogin: false,
  },
  netlify: {
    id: "netlify",
    label: "Netlify",
    description: "One-click anonymous previews or authenticated production deploys.",
    supportsPreview: true,
    supportsProduction: true,
    supportsDomain: "dashboard",
    requiresLogin: false,
  },
  vercel: {
    id: "vercel",
    label: "Vercel",
    description: "Preview and production deployments with optional domain aliasing.",
    supportsPreview: true,
    supportsProduction: true,
    supportsDomain: true,
    requiresLogin: true,
  },
  cloudflare: {
    id: "cloudflare",
    label: "Cloudflare Pages",
    description: "Static preview and production deployments through Wrangler.",
    supportsPreview: true,
    supportsProduction: true,
    supportsDomain: "dashboard",
    requiresLogin: true,
  },
});

const BLOCKED_SEGMENTS = new Set([
  ".git", ".aigent", ".claude", ".codex", "node_modules", "desktop", "scripts", "skills", "docs",
  "evals", "case-studies", "resolve", "vision", "inspiration", "creative-production", "integrations", "recipes",
]);
const BLOCKED_ROOT_FILES = new Set([
  "PRODUCT.md", "DESIGN.md", "BRIEF.md", "AGENTS.md", "CLAUDE.md", "CONTRIBUTING.md", "SECURITY.md",
  "THIRD_PARTY.md", "CHANGELOG.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
  "registry.json", "studio.project.json", "design-brief.json",
]);
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{16,}\b/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[=:]\s*["'][^"']{12,}["']/i,
];
const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".svg", ".xml", ".txt", ".webmanifest"]);
const PUBLIC_ROOT_FILES = ["robots.txt", "favicon.ico", "favicon.svg", "site.webmanifest", "manifest.webmanifest", "_headers", "_redirects"];
const MAX_FILES = 5000;
const MAX_BYTES = 250 * 1024 * 1024;

export function normalizeProvider(value) {
  const provider = String(value || "local").toLowerCase();
  if (!PUBLISH_PROVIDERS[provider]) throw new Error(`Unsupported publish provider: ${provider}`);
  return provider;
}

export function normalizeMode(value) {
  return String(value || "preview").toLowerCase() === "production" ? "production" : "preview";
}

export function safeSiteName(value) {
  const name = String(value || "site").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63);
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(name || "")) throw new Error("Site name must use lowercase letters, numbers, and hyphens.");
  return name;
}

export function safeDomain(value) {
  const domain = String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!domain) return "";
  if (domain.length > 253 || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new Error("Custom domain is not valid.");
  }
  return domain;
}

export function publishRoot(projectDirectory) {
  return path.join(path.resolve(projectDirectory), ".aigent", "publish");
}

export function publishStateFile(projectDirectory) {
  return path.join(publishRoot(projectDirectory), "state.json");
}

export function defaultPublishState() {
  return { schemaVersion: 1, updatedAt: null, lastDeploymentId: null, deployments: [] };
}

export function readPublishState(projectDirectory, explicitFile = null) {
  const file = explicitFile ? path.resolve(explicitFile) : publishStateFile(projectDirectory);
  if (!fs.existsSync(file)) return defaultPublishState();
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      ...defaultPublishState(),
      ...value,
      deployments: Array.isArray(value.deployments) ? value.deployments : [],
    };
  } catch {
    return defaultPublishState();
  }
}

export function writePublishState(projectDirectory, state, explicitFile = null) {
  const file = explicitFile ? path.resolve(explicitFile) : publishStateFile(projectDirectory);
  const value = { ...defaultPublishState(), ...state, updatedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

function executable(name) {
  if (process.platform === "win32" && name === "npx") return "npx.cmd";
  if (process.platform === "win32" && name === "npm") return "npm.cmd";
  return name;
}

function existsCommand(command) {
  const probe = process.platform === "win32" ? "where.exe" : "which";
  return spawnSync(probe, [command], { stdio: "ignore", windowsHide: true }).status === 0;
}

export function publishProviderStatus() {
  const npx = executable("npx");
  const npxAvailable = existsCommand(npx);
  return Object.values(PUBLISH_PROVIDERS).map((provider) => ({
    ...provider,
    available: provider.id === "local" || npxAvailable,
    command: provider.id === "local" ? null : npx,
  }));
}

export function authSpec(providerValue) {
  const provider = normalizeProvider(providerValue);
  if (provider === "local") return null;
  const packages = { netlify: "netlify-cli@latest", vercel: "vercel@latest", cloudflare: "wrangler@latest" };
  return {
    label: `Authenticate ${PUBLISH_PROVIDERS[provider].label}`,
    command: executable("npx"),
    args: ["--yes", packages[provider], "login"],
  };
}

export function deploySteps(options = {}) {
  const provider = normalizeProvider(options.provider);
  const mode = normalizeMode(options.mode);
  const directory = path.resolve(options.directory);
  const siteName = safeSiteName(options.siteName || "aigent-site");
  const commit = String(options.commit || "local").slice(0, 80);
  const branch = mode === "production" ? "main" : `preview-${commit.slice(0, 8).replace(/[^a-z0-9-]/gi, "") || "local"}`;
  const npx = executable("npx");

  if (provider === "local") return [];
  if (provider === "netlify") {
    const args = ["--yes", "netlify-cli@latest", "deploy", "--dir", directory, "--no-build", "--json"];
    if (mode === "production") args.push("--site-name", siteName, "--prod");
    else args.push("--allow-anonymous");
    return [{ label: `Deploy ${mode} to Netlify`, command: npx, args }];
  }
  if (provider === "vercel") {
    return [
      { label: "Link Vercel project", command: npx, args: ["--yes", "vercel@latest", "link", "--cwd", directory, "--yes", "--project", siteName] },
      { label: `Deploy ${mode} to Vercel`, command: npx, args: ["--yes", "vercel@latest", "deploy", "--cwd", directory, "--yes", ...(mode === "production" ? ["--prod"] : [])] },
    ];
  }
  return [
    { label: "Ensure Cloudflare Pages project", command: npx, args: ["--yes", "wrangler@latest", "pages", "project", "create", siteName, "--production-branch", "main"], allowFailure: true },
    { label: `Deploy ${mode} to Cloudflare Pages`, command: npx, args: ["--yes", "wrangler@latest", "pages", "deploy", directory, "--project-name", siteName, "--branch", branch, "--commit-hash", commit, "--commit-message", `AIgent Studio ${mode} publish`] },
  ];
}

export function domainStep(options = {}) {
  const provider = normalizeProvider(options.provider);
  const domain = safeDomain(options.domain);
  if (!domain || provider !== "vercel" || !options.url) return null;
  return {
    label: `Alias ${domain}`,
    command: executable("npx"),
    args: ["--yes", "vercel@latest", "alias", "set", String(options.url), domain],
  };
}

function jsonObjects(value) {
  const source = String(value || "");
  const candidates = [];
  for (let start = source.indexOf("{"); start >= 0; start = source.indexOf("{", start + 1)) {
    for (let end = source.lastIndexOf("}"); end > start; end = source.lastIndexOf("}", end - 1)) {
      try { candidates.push(JSON.parse(source.slice(start, end + 1))); break; } catch { /* try shorter */ }
    }
  }
  return candidates;
}

export function parseDeploymentResult(providerValue, stdout = "", stderr = "") {
  const provider = normalizeProvider(providerValue);
  const combined = `${stdout}\n${stderr}`;
  if (provider === "local") return { url: null, dashboardUrl: null, raw: combined.trim() };
  if (provider === "netlify") {
    const value = jsonObjects(combined).find((item) => item.deploy_url || item.url || item.ssl_url) || {};
    const url = value.deploy_ssl_url || value.ssl_url || value.deploy_url || value.url || combined.match(/https:\/\/[^\s"']+\.netlify\.app\b/i)?.[0] || null;
    return { url, dashboardUrl: value.admin_url || value.adminUrl || null, deploymentId: value.deploy_id || value.id || null, raw: combined.trim() };
  }
  if (provider === "vercel") {
    const urls = [...combined.matchAll(/https:\/\/[^\s"']+(?:\.vercel\.app|\.vercel\.com)\b/gi)].map((match) => match[0]);
    return { url: urls.at(-1) || null, dashboardUrl: "https://vercel.com/dashboard", raw: combined.trim() };
  }
  const urls = [...combined.matchAll(/https:\/\/[^\s"']+\.pages\.dev\b/gi)].map((match) => match[0]);
  return { url: urls.at(-1) || null, dashboardUrl: "https://dash.cloudflare.com/", raw: combined.trim() };
}

function cleanReference(value) {
  let reference = String(value || "").trim().replace(/^['"]|['"]$/g, "");
  if (!reference || reference.startsWith("#") || reference.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(reference)) return null;
  reference = reference.split("#")[0].split("?")[0];
  return reference || null;
}

function referencesFrom(source, extension) {
  const values = [];
  if ([".html", ".htm", ".svg"].includes(extension)) {
    for (const match of source.matchAll(/\b(?:src|href|poster|data-src|data-href|data-poster)\s*=\s*["']([^"']+)["']/gi)) values.push(match[1]);
    for (const match of source.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      for (const part of match[1].split(",")) values.push(part.trim().split(/\s+/)[0]);
    }
  }
  if ([".css", ".html", ".htm", ".svg"].includes(extension)) {
    for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) values.push(match[1]);
    for (const match of source.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']/gi)) values.push(match[1]);
  }
  if ([".js", ".mjs", ".cjs"].includes(extension)) {
    for (const match of source.matchAll(/(?:import\s+(?:[^"']+?\s+from\s+)?|export\s+[^"']+?\s+from\s+|import\s*\()\s*["']([^"']+)["']/g)) values.push(match[1]);
    for (const match of source.matchAll(/new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)) values.push(match[1]);
  }
  return values.map(cleanReference).filter(Boolean);
}

function blockedRelative(relative) {
  const normal = relative.split(path.sep).join("/");
  const segments = normal.split("/").filter(Boolean);
  if (!segments.length || segments.some((segment) => segment === ".." || (segment.startsWith(".") && segment !== ".well-known") || BLOCKED_SEGMENTS.has(segment))) return true;
  if (segments.length === 1 && BLOCKED_ROOT_FILES.has(segments[0])) return true;
  if (/\.(?:pem|key|p12|pfx|mobileprovision|env)$/i.test(normal) || /(?:^|\/)\.env(?:\.|$)/i.test(normal)) return true;
  return false;
}

function resolveCandidate(projectDirectory, fromFile, reference) {
  const root = path.resolve(projectDirectory);
  const base = reference.startsWith("/") ? path.resolve(root, reference.slice(1)) : path.resolve(path.dirname(fromFile), reference);
  const candidates = [base, `${base}.js`, `${base}.mjs`, `${base}.json`, path.join(base, "index.js"), path.join(base, "index.html")];
  for (const candidate of candidates) {
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) continue;
    const relative = path.relative(root, candidate);
    if (blockedRelative(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function insertBase(html, base) {
  if (/<base\b/i.test(html)) return html;
  const tag = `<base href="${base}">`;
  return /<head\b[^>]*>/i.test(html) ? html.replace(/<head\b[^>]*>/i, (match) => `${match}\n  ${tag}`) : `${tag}\n${html}`;
}

function scanTextForSecrets(file, source) {
  if (SECRET_PATTERNS.some((pattern) => pattern.test(source))) throw new Error(`Possible credential found in public export: ${file}`);
}

export function buildStaticExport(options = {}) {
  const projectDirectory = path.resolve(options.projectDirectory || process.cwd());
  const outputDirectory = path.resolve(options.outputDirectory || path.join(publishRoot(projectDirectory), "site"));
  const entryValue = String(options.entry || "/index.html");
  const entryRelative = entryValue.replace(/^\/+/, "").replace(/\/$/, "/index.html") || "index.html";
  const entryFile = path.resolve(projectDirectory, entryRelative);
  if (entryFile !== projectDirectory && !entryFile.startsWith(`${projectDirectory}${path.sep}`)) throw new Error("Publish entry escaped the project directory.");
  if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) throw new Error(`Publish entry does not exist: ${entryValue}`);
  if (blockedRelative(path.relative(projectDirectory, entryFile))) throw new Error("Publish entry is inside a private project directory.");

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  const queue = [entryFile];
  for (const rootFile of PUBLIC_ROOT_FILES) {
    const candidate = path.join(projectDirectory, rootFile);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) queue.push(candidate);
  }
  const visited = new Set();
  const warnings = [];
  let bytes = 0;

  while (queue.length) {
    const file = path.resolve(queue.shift());
    if (visited.has(file)) continue;
    const relative = path.relative(projectDirectory, file);
    if (blockedRelative(relative)) continue;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    visited.add(file);
    if (visited.size > MAX_FILES) throw new Error(`Publish export exceeded ${MAX_FILES} files.`);
    const stat = fs.statSync(file);
    bytes += stat.size;
    if (bytes > MAX_BYTES) throw new Error("Publish export exceeded 250 MB. Optimize the site or use a build adapter.");

    const extension = path.extname(file).toLowerCase();
    const inspectText = TEXT_EXTENSIONS.has(extension) && stat.size <= 5 * 1024 * 1024;
    const source = inspectText ? fs.readFileSync(file, "utf8") : null;
    if (source != null) scanTextForSecrets(relative, source);

    const destination = path.join(outputDirectory, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file, destination);

    if (source == null) continue;
    for (const reference of referencesFrom(source, extension)) {
      const resolved = resolveCandidate(projectDirectory, file, reference);
      if (resolved) queue.push(resolved);
      else if (!reference.startsWith("/") && !reference.includes("${")) warnings.push(`${relative}: missing local reference ${reference}`);
    }
  }

  const nestedDirectory = path.posix.dirname(entryRelative.split(path.sep).join("/"));
  if (nestedDirectory !== ".") {
    let rootHtml = fs.readFileSync(entryFile, "utf8");
    rootHtml = insertBase(rootHtml, `./${nestedDirectory.replace(/^\.\//, "")}/`);
    scanTextForSecrets("index.html", rootHtml);
    fs.writeFileSync(path.join(outputDirectory, "index.html"), rootHtml);
    visited.add(entryFile);
  }
  fs.writeFileSync(path.join(outputDirectory, ".nojekyll"), "");

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    entry: entryValue,
    outputDirectory,
    files: [...visited].map((file) => path.relative(projectDirectory, file).split(path.sep).join("/")).sort(),
    bytes,
    warnings: [...new Set(warnings)].slice(0, 200),
  };
  fs.mkdirSync(publishRoot(projectDirectory), { recursive: true });
  fs.writeFileSync(path.join(publishRoot(projectDirectory), "export-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function createDeploymentRecord(options = {}) {
  return {
    id: options.id || `${Date.now()}-${randomUUID().slice(0, 8)}`,
    provider: normalizeProvider(options.provider),
    mode: normalizeMode(options.mode),
    siteName: safeSiteName(options.siteName),
    domain: safeDomain(options.domain),
    status: options.status || "queued",
    commit: String(options.commit || "local").slice(0, 80),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: null,
    dashboardUrl: null,
    outputDirectory: null,
    qa: null,
    vision: null,
    error: null,
  };
}

export function upsertDeployment(stateValue, deployment) {
  const state = { ...defaultPublishState(), ...stateValue, deployments: [...(stateValue.deployments || [])] };
  const index = state.deployments.findIndex((item) => item.id === deployment.id);
  const value = { ...(index >= 0 ? state.deployments[index] : {}), ...deployment, updatedAt: new Date().toISOString() };
  if (index >= 0) state.deployments[index] = value;
  else state.deployments.unshift(value);
  state.deployments = state.deployments.slice(0, 60);
  state.lastDeploymentId = value.id;
  return state;
}
