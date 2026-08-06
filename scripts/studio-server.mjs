#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createStudioPublishController } from "./studio-publish.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultProjectsRoot = path.join(packageRoot, ".aigent", "studio", "projects");
const MAX_BODY_BYTES = 1_000_000;
const PROJECT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const ENTITY_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
const PROVIDERS = new Set(["claude", "codex", "manual"]);
const BLOCKED_PATH_SEGMENTS = new Set([".git", ".aigent", ".claude", ".codex", "node_modules"]);
const ATTRIBUTE_NAMES = new Set(["href", "src", "alt", "title", "target", "rel", "aria-label", "aria-hidden", "role"]);
const STYLE_PROPERTIES = new Set([
  "display", "position", "inset", "top", "right", "bottom", "left", "z-index",
  "width", "min-width", "max-width", "height", "min-height", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left", "margin-inline", "margin-block",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "padding-inline", "padding-block",
  "gap", "row-gap", "column-gap", "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
  "flex-direction", "flex-wrap", "justify-content", "align-items", "align-content", "align-self", "justify-self",
  "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "text-transform",
  "color", "background", "background-color", "border", "border-color", "border-width", "border-style",
  "border-radius", "box-shadow", "opacity", "overflow", "overflow-x", "overflow-y", "object-fit", "object-position",
  "transform", "transform-origin", "filter", "backdrop-filter", "cursor", "pointer-events", "visibility",
]);
const STARTERS = Object.freeze({
  blank: { label: "Blank static site", item: "studio-core", entry: "/index.html", mode: "persuade" },
  cinematic: { label: "Cinematic scroll page", item: "cinematic-page", entry: "/templates/modular-scroll-starter/", mode: "experience" },
  deck: { label: "Immersive sales deck", item: "immersive-sales-deck", entry: "/templates/immersive-sales-deck/", mode: "persuade" },
  interface: { label: "Command center interface", item: "command-center-interface", entry: "/templates/command-center-interface/", mode: "operate" },
  threejs: { label: "Progressive Three.js stage", item: "threejs-product-stage", entry: "/templates/threejs-product-stage/", mode: "experience" },
});
const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"],
  [".webp", "image/webp"], [".gif", "image/gif"], [".mp4", "video/mp4"], [".webm", "video/webm"], [".woff2", "font/woff2"],
]);

function now() { return new Date().toISOString(); }
function option(args, name, fallback = null) { const index = args.indexOf(name); return index >= 0 ? args[index + 1] ?? fallback : fallback; }
function hasFlag(args, name) { return args.includes(name); }
function text(value, fallback = "", maximum = 6000) {
  const selected = String(value ?? fallback).trim();
  return (selected || String(fallback)).slice(0, maximum);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
function safeId(id) {
  if (!PROJECT_ID.test(id || "")) throw Object.assign(new Error("Invalid project id."), { statusCode: 400 });
  return id;
}
function safeEntityId(id, label = "entity") {
  if (!ENTITY_ID.test(id || "")) throw Object.assign(new Error(`Invalid ${label} id.`), { statusCode: 400 });
  return id;
}
function slugify(value) {
  const slug = String(value || "project").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return safeId(slug || "project");
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function projectDirectory(projectsRoot, id) {
  const root = path.resolve(projectsRoot);
  const directory = path.resolve(root, safeId(id));
  if (directory !== root && !directory.startsWith(`${root}${path.sep}`)) throw new Error("Project path escaped workspace.");
  return directory;
}
function projectFile(projectsRoot, id) { return path.join(projectDirectory(projectsRoot, id), "studio.project.json"); }
function canvasFile(projectsRoot, id) { return path.join(projectDirectory(projectsRoot, id), ".aigent", "studio", "canvas.json"); }
function checkpointDirectory(projectsRoot, id) { return path.join(projectDirectory(projectsRoot, id), ".aigent", "studio", "checkpoints"); }
function existsCommand(command) {
  const probe = process.platform === "win32" ? "where.exe" : "which";
  return spawnSync(probe, [command], { stdio: "ignore", windowsHide: true }).status === 0;
}
function executable(name) {
  if (name === "claude") return process.env.AIGENT_STUDIO_CLAUDE_BIN || "claude";
  if (name === "codex") return process.env.AIGENT_STUDIO_CODEX_BIN || "codex";
  return name;
}
function providerStatus() {
  const claude = executable("claude");
  const codex = executable("codex");
  return {
    claude: { label: "Claude Code", available: existsCommand(claude), command: claude },
    codex: { label: "Codex CLI", available: existsCommand(codex), command: codex },
    manual: { label: "Manual prompt", available: true, command: null },
  };
}
function uniqueProjectId(projectsRoot, name) {
  const base = slugify(name);
  let candidate = base;
  let number = 2;
  while (fs.existsSync(projectDirectory(projectsRoot, candidate))) candidate = `${base.slice(0, 58)}-${number++}`;
  return candidate;
}
function readProject(projectsRoot, id) {
  const file = projectFile(projectsRoot, id);
  if (!fs.existsSync(file)) throw Object.assign(new Error("Project not found."), { statusCode: 404 });
  return readJson(file);
}
function listProjects(projectsRoot) {
  if (!fs.existsSync(projectsRoot)) return [];
  return fs.readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && PROJECT_ID.test(entry.name))
    .map((entry) => { try { return readProject(projectsRoot, entry.name); } catch { return null; } })
    .filter(Boolean)
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}
function normaliseReferences(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12);
}
function briefObject(input, starter) {
  const modes = Array.isArray(input.modes) && input.modes.length ? input.modes : [input.mode || starter.mode];
  return {
    $schema: "./design-intelligence/brief.schema.json",
    name: text(input.name, "Untitled project", 120),
    modes,
    audience: text(input.audience, "The intended customer or user", 1000),
    visitorGoal: text(input.goal, "Understand the offer and take the primary action", 2000),
    productMechanism: text(input.mechanism || input.description, "The product delivers the stated outcome", 3000),
    proof: Array.isArray(input.proof) ? input.proof.slice(0, 8) : String(input.proof || "working product, clear mechanism, credible evidence").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    contentProfile: input.contentProfile || (modes.includes("operate") ? "task" : "narrative"),
    contentLength: input.contentLength || "medium",
    density: input.density || (modes.includes("operate") ? "high" : "low"),
    interactionLevel: input.interactionLevel || "medium",
    media: { available: input.mediaAvailable || ["images", "data"], needsProduction: input.needsMedia !== false, preferred: input.mediaPreferred || "auto" },
    framework: "vanilla",
    brand: {
      existingWorld: Boolean(input.existingBrand),
      adjectives: Array.isArray(input.adjectives) ? input.adjectives : String(input.adjectives || "distinctive, clear, intentional").split(",").map((item) => item.trim()).filter(Boolean),
      antiReferences: Array.isArray(input.antiReferences) ? input.antiReferences : String(input.antiReferences || "generic AI gradient, identical feature cards, decorative 3D").split(",").map((item) => item.trim()).filter(Boolean),
      themePreference: input.theme || "dark",
    },
    constraints: { mobilePriority: true, reducedMotion: true, maxInitialKB: Number(input.maxInitialKB || 900), noWebGL: Boolean(input.noWebGL), noAutoplay: Boolean(input.noAutoplay), accessibility: "AA" },
  };
}
function briefMarkdown(project, brief) {
  return `# ${project.name}\n\n## Build target\n\n- **Surface:** ${brief.modes.join(" + ")}\n- **Preview entry:** ${project.entry}\n- **Audience:** ${brief.audience}\n- **Visitor goal:** ${brief.visitorGoal}\n- **Mechanism:** ${brief.productMechanism}\n- **Theme preference:** ${brief.brand.themePreference}\n\n## Proof\n\n${brief.proof.map((item) => `- ${item}`).join("\n")}\n\n## Brand direction\n\n- Adjectives: ${brief.brand.adjectives.join(", ")}\n- Avoid: ${brief.brand.antiReferences.join(", ")}\n\n## References\n\n${project.references.length ? project.references.map((item) => `- ${item}`).join("\n") : "- None supplied yet."}\n\n## Operator request\n\n${project.request || "Build the strongest product-specific version of this surface."}\n`;
}
function agentInstructions(project) {
  return `# AIgent Studio project\n\nRead these before editing:\n\n1. \`BRIEF.md\`\n2. \`PRODUCT.md\`\n3. \`DESIGN.md\`\n4. \`.claude/skills/aigent-design/SKILL.md\` when present\n5. \`.claude/skills/aigent-studio/SKILL.md\` when present\n6. \`.aigent/design-plan.json\` when present\n7. \`.aigent/inspiration-plan.json\` when present\n8. \`.aigent/studio/canvas.json\` when present\n\nWork directly on the preview entry \`${project.entry}\`. Reuse the installed tokens, patterns, skills, and starter before adding code or dependencies. Preserve accessibility, mobile recomposition, reduced motion, asset provenance, and the chosen product-specific visual world. The DOM-backed Canvas patch journal is operator intent: preserve it unless the operator explicitly asks you to distill it into source. Do not build a second disconnected demo elsewhere.\n`;
}
function blankFiles(directory, project) {
  const name = escapeHtml(project.name);
  const description = escapeHtml(project.description);
  const html = `<!doctype html>\n<html lang="en" data-theme="graphite">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="${description}">\n  <title>${name}</title>\n  <link rel="stylesheet" href="tokens/system.css">\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body class="ds-shell">\n  <main id="main" class="site-shell">\n    <p class="ds-eyebrow">AIgent Studio project</p>\n    <h1>${name}</h1>\n    <p>${description}</p>\n    <a class="ds-button" data-variant="solid" href="#start">Start</a>\n  </main>\n  <script type="module" src="app.js"></script>\n</body>\n</html>\n`;
  const css = `body{margin:0}.site-shell{width:min(1100px,calc(100% - 40px));min-height:100svh;margin:auto;display:grid;align-content:center;gap:24px}.site-shell h1{max-width:10ch;margin:0;font:800 clamp(4rem,12vw,9rem)/.9 var(--ds-font-display);letter-spacing:-.05em}.site-shell p:not(.ds-eyebrow){max-width:62ch;margin:0;color:var(--ds-color-muted);font:520 1.15rem/1.6 var(--ds-font-body)}.site-shell .ds-button{width:max-content}@media(max-width:600px){.site-shell{width:min(100% - 28px,1100px)}}\n`;
  fs.writeFileSync(path.join(directory, "index.html"), html);
  fs.writeFileSync(path.join(directory, "styles.css"), css);
  fs.writeFileSync(path.join(directory, "app.js"), "document.documentElement.dataset.ready = 'true';\n");
}
function executableScript(relativePath) {
  const packed = path.join(packageRoot, relativePath);
  const marker = `${path.sep}app.asar${path.sep}`;
  const unpacked = packed.includes(marker) ? packed.replace(marker, `${path.sep}app.asar.unpacked${path.sep}`) : packed;
  return fs.existsSync(unpacked) ? unpacked : packed;
}
function studioNodeSpec(relativePath, args = []) {
  const command = process.env.AIGENT_STUDIO_NODE_BIN || process.execPath;
  const env = { ...process.env };
  if (process.env.AIGENT_STUDIO_ELECTRON_NODE === "1" || process.versions.electron) env.ELECTRON_RUN_AS_NODE = "1";
  return { command, args: [executableScript(relativePath), ...args], env };
}
function runLocalCli(args, options = {}) {
  const studioRegistry = path.join(packageRoot, ".aigent", "studio", "registry.json");
  const spec = studioNodeSpec(path.join("scripts", "cli.mjs"), args);
  const result = spawnSync(spec.command, spec.args, {
    cwd: packageRoot,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
    env: { ...spec.env, ...(fs.existsSync(studioRegistry) ? { AIGENT_REGISTRY_PATH: studioRegistry } : {}) },
    ...options,
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || "AIgent CLI failed").trim());
  return result.stdout.trim();
}
function writeProjectFiles(projectsRoot, project, input) {
  const directory = projectDirectory(projectsRoot, project.id);
  const brief = briefObject({ ...input, name: project.name }, STARTERS[project.starter]);
  writeJson(path.join(directory, "design-brief.json"), brief);
  fs.writeFileSync(path.join(directory, "BRIEF.md"), briefMarkdown(project, brief));
  fs.writeFileSync(path.join(directory, "AGENTS.md"), agentInstructions(project));
  fs.writeFileSync(path.join(directory, "CLAUDE.md"), agentInstructions(project));
  writeJson(projectFile(projectsRoot, project.id), project);
}
function git(directory, args, allowFailure = false) {
  if (!existsCommand("git")) return { status: 127, stdout: "", stderr: "git not installed" };
  const result = spawnSync("git", args, { cwd: directory, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 });
  if (!allowFailure && result.status !== 0) throw new Error((result.stderr || result.stdout || "git failed").trim());
  return result;
}
function ensureGit(directory) {
  if (!existsCommand("git")) return null;
  if (!fs.existsSync(path.join(directory, ".git"))) git(directory, ["init"]);
  git(directory, ["config", "user.name", "AIgent Studio"]);
  git(directory, ["config", "user.email", "studio@localhost"]);
  const hasCommit = git(directory, ["rev-parse", "--verify", "HEAD"], true).status === 0;
  if (!hasCommit) {
    git(directory, ["add", "-A"]);
    git(directory, ["commit", "--allow-empty", "-m", "Initial AIgent Studio project"]);
  }
  return git(directory, ["rev-parse", "HEAD"]).stdout.trim();
}
function createProject(projectsRoot, input = {}) {
  const starterKey = STARTERS[input.starter] ? input.starter : "cinematic";
  const starter = STARTERS[starterKey];
  const id = uniqueProjectId(projectsRoot, input.name || "Untitled site");
  const directory = projectDirectory(projectsRoot, id);
  fs.mkdirSync(directory, { recursive: true });
  try {
    runLocalCli(["add", starter.item, "--target", directory]);
    const project = {
      schemaVersion: 2,
      id,
      name: text(input.name, "Untitled site", 120),
      description: text(input.description, "A distinctive product-specific website built in AIgent Studio.", 5000),
      audience: text(input.audience, "", 1000),
      goal: text(input.goal, "", 2000),
      mechanism: text(input.mechanism, "", 3000),
      request: text(input.request, "", 6000),
      starter: starterKey,
      entry: starter.entry,
      provider: PROVIDERS.has(input.provider) ? input.provider : "claude",
      references: normaliseReferences(input.references),
      createdAt: now(),
      updatedAt: now(),
      revision: 1,
      lastRun: null,
      claudeSessionId: null,
    };
    if (starterKey === "blank") blankFiles(directory, project);
    writeProjectFiles(projectsRoot, project, input);
    writeCanvas(projectsRoot, id, defaultCanvas());
    ensureGit(directory);
    return project;
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}
function updateProject(projectsRoot, id, input = {}) {
  const project = readProject(projectsRoot, id);
  for (const key of ["name", "description", "audience", "goal", "mechanism", "request"]) {
    if (input[key] != null) project[key] = text(input[key], "", key === "name" ? 120 : 6000);
  }
  if (input.provider && PROVIDERS.has(input.provider)) project.provider = input.provider;
  if (input.references != null) project.references = normaliseReferences(input.references);
  project.updatedAt = now();
  project.revision += 1;
  writeProjectFiles(projectsRoot, project, project);
  return project;
}
function defaultCanvas() {
  return { schemaVersion: 1, revision: 0, cursor: -1, operations: [], annotations: [], components: [], checkpoints: [] };
}
function readCanvas(projectsRoot, id) {
  const file = canvasFile(projectsRoot, id);
  if (!fs.existsSync(file)) writeCanvas(projectsRoot, id, defaultCanvas());
  const canvas = readJson(file);
  return { ...defaultCanvas(), ...canvas, operations: canvas.operations || [], annotations: canvas.annotations || [], components: canvas.components || [], checkpoints: canvas.checkpoints || [] };
}
function writeCanvas(projectsRoot, id, canvas) { writeJson(canvasFile(projectsRoot, id), canvas); }
function activeOperations(canvas) { return canvas.operations.slice(0, canvas.cursor + 1); }
function parseTokens() {
  const file = path.join(packageRoot, "tokens", "system.css");
  if (!fs.existsSync(file)) return [];
  const source = fs.readFileSync(file, "utf8");
  const tokens = new Map();
  for (const match of source.matchAll(/(--ds-[a-z0-9-]+)\s*:\s*([^;}{]+);/gi)) {
    if (!tokens.has(match[1])) {
      const value = match[2].trim();
      const preview = /^(?:#|rgb|hsl|oklch|color\()/i.test(value) ? value : "transparent";
      tokens.set(match[1], { name: match[1], value, preview });
    }
  }
  return [...tokens.values()].sort((left, right) => left.name.localeCompare(right.name));
}
function publicCanvas(canvas) {
  return {
    schemaVersion: canvas.schemaVersion,
    revision: canvas.revision,
    cursor: canvas.cursor,
    activeOperations: activeOperations(canvas),
    operationCount: canvas.operations.length,
    canUndo: canvas.cursor >= 0,
    canRedo: canvas.cursor < canvas.operations.length - 1,
    annotations: canvas.annotations,
    components: canvas.components,
    checkpoints: canvas.checkpoints,
    tokens: parseTokens(),
  };
}
function author(value = {}) {
  return {
    id: safeEntityId(text(value.id, "local", 128), "author"),
    name: text(value.name, "Local designer", 80),
    color: /^#[0-9a-f]{6}$/i.test(value.color || "") ? value.color : "#65f4df",
  };
}
function sanitizeHtml(value) {
  let html = String(value || "").slice(0, 100000);
  html = html.replace(/<(script|style|link|meta|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(link|meta)\b[^>]*>/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return html;
}
function validateOperation(input) {
  if (!input || typeof input !== "object") throw Object.assign(new Error("Operation is required."), { statusCode: 400 });
  const kind = input.kind;
  if (!new Set(["style", "text", "attribute", "remove", "move", "insert"]).has(kind)) throw Object.assign(new Error("Unsupported canvas operation."), { statusCode: 400 });
  const operation = { id: randomUUID(), kind, createdAt: now() };
  if (kind === "style") {
    const nodeIds = (input.nodeIds || [input.nodeId]).map((id) => safeEntityId(id, "node")).slice(0, 64);
    if (!nodeIds.length) throw Object.assign(new Error("Style operation needs at least one node."), { statusCode: 400 });
    if (!STYLE_PROPERTIES.has(input.property)) throw Object.assign(new Error("Unsupported style property."), { statusCode: 400 });
    operation.nodeIds = nodeIds;
    operation.property = input.property;
    operation.value = text(input.value, "", 1000);
    if (/[{}]/.test(operation.value) || /@import|javascript:/i.test(operation.value)) throw Object.assign(new Error("Unsafe style value."), { statusCode: 400 });
    operation.breakpoint = ["base", "tablet", "mobile"].includes(input.breakpoint) ? input.breakpoint : "base";
  } else {
    operation.nodeId = safeEntityId(input.nodeId, "node");
  }
  if (kind === "text") operation.value = String(input.value ?? "").slice(0, 20000);
  if (kind === "attribute") {
    if (!ATTRIBUTE_NAMES.has(input.name)) throw Object.assign(new Error("Unsupported attribute."), { statusCode: 400 });
    operation.name = input.name;
    operation.value = String(input.value ?? "").slice(0, 5000);
    if (["href", "src"].includes(operation.name) && /^\s*javascript:/i.test(operation.value)) throw Object.assign(new Error("Unsafe URL attribute."), { statusCode: 400 });
  }
  if (kind === "move") {
    if (!new Set(["up", "down"]).has(input.direction)) throw Object.assign(new Error("Move direction must be up or down."), { statusCode: 400 });
    operation.direction = input.direction;
  }
  if (kind === "insert") {
    operation.position = new Set(["before", "after", "inside"]).has(input.position) ? input.position : "after";
    operation.html = sanitizeHtml(input.html);
    if (!operation.html) throw Object.assign(new Error("Inserted component is empty."), { statusCode: 400 });
  }
  return operation;
}
function appendOperation(canvas, input, authorValue) {
  if (canvas.cursor < canvas.operations.length - 1) canvas.operations = canvas.operations.slice(0, canvas.cursor + 1);
  const operation = { ...validateOperation(input), author: author(authorValue) };
  canvas.operations.push(operation);
  if (canvas.operations.length > 1000) canvas.operations.shift();
  canvas.cursor = canvas.operations.length - 1;
  canvas.revision += 1;
  return operation;
}
function canvasSnapshot(canvas) {
  return { schemaVersion: canvas.schemaVersion, revision: canvas.revision, cursor: canvas.cursor, operations: canvas.operations, annotations: canvas.annotations, components: canvas.components };
}
function checkpointProject(projectsRoot, id, label, authorValue) {
  const directory = projectDirectory(projectsRoot, id);
  if (!existsCommand("git")) throw Object.assign(new Error("Git is required for checkpoints."), { statusCode: 409 });
  ensureGit(directory);
  git(directory, ["add", "-A"]);
  git(directory, ["commit", "--allow-empty", "-m", `Studio checkpoint: ${text(label, "Checkpoint", 120)}`]);
  const sha = git(directory, ["rev-parse", "HEAD"]).stdout.trim();
  const canvas = readCanvas(projectsRoot, id);
  const metadata = { id: sha, label: text(label, "Checkpoint", 120), createdAt: now(), author: author(authorValue) };
  writeJson(path.join(checkpointDirectory(projectsRoot, id), `${sha}.json`), canvasSnapshot(canvas));
  canvas.checkpoints = [metadata, ...canvas.checkpoints.filter((item) => item.id !== sha)].slice(0, 60);
  canvas.revision += 1;
  writeCanvas(projectsRoot, id, canvas);
  return canvas;
}
function restoreCheckpoint(projectsRoot, id, checkpointId) {
  safeEntityId(checkpointId, "checkpoint");
  const directory = projectDirectory(projectsRoot, id);
  const snapshotFile = path.join(checkpointDirectory(projectsRoot, id), `${checkpointId}.json`);
  if (!fs.existsSync(snapshotFile)) throw Object.assign(new Error("Checkpoint not found."), { statusCode: 404 });
  git(directory, ["restore", "--source", checkpointId, "--staged", "--worktree", "."]);
  const current = readCanvas(projectsRoot, id);
  const snapshot = readJson(snapshotFile);
  const canvas = { ...current, ...snapshot, checkpoints: current.checkpoints, revision: current.revision + 1 };
  writeCanvas(projectsRoot, id, canvas);
  return canvas;
}
function projectDiff(projectsRoot, id) {
  const directory = projectDirectory(projectsRoot, id);
  if (!existsCommand("git") || !fs.existsSync(path.join(directory, ".git"))) return "Git history is not available for this project.";
  return git(directory, ["diff", "--no-color", "--", "."], true).stdout.slice(0, 250000);
}
function readableClaudeLine(line) {
  try {
    const value = JSON.parse(line);
    const sessionId = value.session_id || value.sessionId || null;
    if (value.type === "assistant" && value.message?.content) {
      const textValue = value.message.content.map((item) => item.text || item.name || "").filter(Boolean).join("\n");
      return { sessionId, text: textValue };
    }
    if (value.type === "result") return { sessionId, text: value.result || value.subtype || "Claude turn complete." };
    if (value.type === "system" && value.subtype) return { sessionId, text: `Claude: ${value.subtype}` };
    return { sessionId, text: "" };
  } catch { return { sessionId: null, text: line }; }
}
function buildAgentPrompt(projectsRoot, project, request = {}) {
  const canvas = readCanvas(projectsRoot, project.id);
  const comments = canvas.annotations.filter((item) => item.status === "open" && (!request.commentIds?.length || request.commentIds.includes(item.id)));
  const selection = Array.isArray(request.selection) ? request.selection.slice(0, 24) : [];
  return [
    "You are the operating design-and-code agent inside AIgent Studio v1.0.",
    "Read BRIEF.md, PRODUCT.md, DESIGN.md, AGENTS.md, the installed AIgent skills, and .aigent/studio/canvas.json before editing.",
    `Edit the real preview entry ${project.entry}; do not create a disconnected alternative.`,
    "Reuse the current stack, tokens, patterns, components, and starter before adding code or dependencies.",
    "Preserve accessibility, responsive recomposition, reduced motion, asset provenance, and the current design lock.",
    activeOperations(canvas).length ? `Canvas operations currently express approved operator intent:\n${JSON.stringify(activeOperations(canvas), null, 2)}` : "No Canvas patch operations are active.",
    selection.length ? `Selected rendered elements:\n${JSON.stringify(selection, null, 2)}` : "No rendered elements were attached to this turn.",
    comments.length ? `Open element comments to resolve:\n${JSON.stringify(comments, null, 2)}` : "No open element comments were attached.",
    `Operator request:\n${text(request.prompt || project.request, "Build the strongest complete version and inspect the rendered result before stopping.", 12000)}`,
    "After editing, inspect the actual page, fix the shared cause rather than symptoms, and state what changed. Do not clear the Canvas journal unless explicitly instructed.",
  ].join("\n\n");
}
function distillPrompt(projectsRoot, project) {
  const canvas = readCanvas(projectsRoot, project.id);
  return [
    "Distill the current AIgent Studio Canvas patch journal into the actual project source.",
    `The live preview entry is ${project.entry}.`,
    "Read BRIEF.md, PRODUCT.md, DESIGN.md, AGENTS.md, all installed AIgent skills, and .aigent/studio/canvas.json.",
    "Apply every active text, attribute, layout, appearance, responsive, insertion, removal, and ordering operation to the smallest correct source files.",
    "Preserve breakpoint behavior, semantic tokens, accessibility, reduced motion, and the selected visual direction.",
    "Do not merely copy the runtime patch system into production. Consolidate repeated operations into the shared primitive or rule that owns them.",
    `Active operations:\n${JSON.stringify(activeOperations(canvas), null, 2)}`,
    "Run the smallest relevant checks and inspect the rendered result. Do not clear .aigent/studio/canvas.json; the operator will clear it only after comparing the distilled result.",
  ].join("\n\n");
}
function mimeType(file) { return CONTENT_TYPES.get(path.extname(file).toLowerCase()) || "application/octet-stream"; }
function sendJson(response, status, value) {
  const body = `${JSON.stringify(value)}\n`;
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body), "cache-control": "no-store" });
  response.end(body);
}
function sendText(response, status, value, type = "text/plain; charset=utf-8") {
  const body = String(value);
  response.writeHead(status, { "content-type": type, "content-length": Buffer.byteLength(body), "cache-control": "no-store" });
  response.end(body);
}
function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}
async function readBody(request) {
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    throw Object.assign(new Error("Request content type must be application/json."), { statusCode: 415 });
  }
  if (!sameOrigin(request)) throw Object.assign(new Error("Cross-origin writes are blocked."), { statusCode: 403 });
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }); }
}
function safeStaticFile(root, requestPath) {
  let decoded;
  try { decoded = decodeURIComponent(requestPath); } catch { return null; }
  const segments = decoded.split("/").filter(Boolean);
  if (segments.some((segment) => segment === ".." || segment.startsWith(".") || BLOCKED_PATH_SEGMENTS.has(segment))) return null;
  let file = path.resolve(root, segments.join(path.sep));
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  return file;
}
function injectStudio(html, projectId, operations) {
  const bootstrap = JSON.stringify({ projectId, operations, mode: "preview" }).replace(/</g, "\\u003c");
  const injection = `<script>window.__AIGENT_STUDIO_BOOTSTRAP__=${bootstrap}</script><script type="module" src="/studio/bridge.js"></script>`;
  if (html.includes("/studio/bridge.js")) return html;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${injection}</body>`) : `${html}${injection}`;
}
function serveFile(request, response, file, transform = null) {
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const type = mimeType(file);
  if (transform) {
    const value = transform(fs.readFileSync(file, "utf8"));
    sendText(response, 200, value, type);
    return true;
  }
  const stat = fs.statSync(file);
  response.writeHead(200, { "content-type": type, "content-length": stat.size, "cache-control": "no-store", "accept-ranges": "bytes" });
  if (request.method === "HEAD") response.end(); else fs.createReadStream(file).pipe(response);
  return true;
}
function previewPath(project) { return project.entry.endsWith("/") ? `${project.entry}index.html` : project.entry; }

export function createStudioServer(options = {}) {
  const projectsRoot = path.resolve(options.projectsRoot || process.env.AIGENT_STUDIO_ROOT || defaultProjectsRoot);
  const host = options.host || "127.0.0.1";
  const requestedPort = Number(options.port ?? process.env.PORT ?? 4180);
  fs.mkdirSync(projectsRoot, { recursive: true });
  const statuses = providerStatus();
  const tasks = new Map();
  const taskClients = new Map();
  const collaborationClients = new Map();
  const presence = new Map();
  let server;
  const publishController = createStudioPublishController({
    projectsRoot, projectDirectory, readCanvas, activeOperations, checkpointProject, startProcess, studioNodeSpec,
    sendJson, readBody, host, getPort: () => server.address().port, previewPath,
  });

  function taskSet(projectId) {
    if (!taskClients.has(projectId)) taskClients.set(projectId, new Set());
    return taskClients.get(projectId);
  }
  function collabSet(projectId) {
    if (!collaborationClients.has(projectId)) collaborationClients.set(projectId, new Set());
    return collaborationClients.get(projectId);
  }
  function emitTask(projectId, type, payload = {}) {
    const event = { at: now(), type, ...payload };
    const task = tasks.get(projectId);
    if (task) {
      task.events.push(event);
      if (task.events.length > 400) task.events.shift();
    }
    for (const response of taskSet(projectId)) response.write(`data: ${JSON.stringify(event)}\n\n`);
  }
  function emitCollaboration(projectId, type, payload = {}) {
    const event = { at: now(), type, ...payload };
    for (const response of collabSet(projectId)) response.write(`data: ${JSON.stringify(event)}\n\n`);
  }
  function participantList(projectId) {
    const map = presence.get(projectId) || new Map();
    const threshold = Date.now() - 20000;
    for (const [clientId, participant] of map) if (new Date(participant.seenAt).getTime() < threshold) map.delete(clientId);
    return [...map.values()].sort((left, right) => left.name.localeCompare(right.name));
  }
  function publishPresence(projectId) { emitCollaboration(projectId, "presence", { participants: participantList(projectId) }); }
  function finishTask(project, code, signal = null) {
    const task = tasks.get(project.id);
    if (!task || task.done) return;
    task.done = true;
    project.lastRun = { id: task.id, kind: task.kind, provider: task.provider, code, signal, finishedAt: now() };
    project.updatedAt = now();
    project.revision += 1;
    writeJson(projectFile(projectsRoot, project.id), project);
    emitTask(project.id, "done", { code, signal, revision: project.revision });
    task.child = null;
  }
  function startProcess(project, spec) {
    const existing = tasks.get(project.id);
    if (existing?.child) throw Object.assign(new Error("A task is already running for this project."), { statusCode: 409 });
    const task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind: spec.kind, provider: spec.provider || null, child: null, events: existing?.events || [], done: false };
    tasks.set(project.id, task);
    const child = spawn(spec.command, spec.args, { cwd: spec.cwd || projectDirectory(projectsRoot, project.id), env: { ...process.env, ...(spec.env || {}), FORCE_COLOR: "0", AIGENT_STUDIO: "1" }, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    task.child = child;
    emitTask(project.id, "start", { runId: task.id, kind: task.kind, provider: task.provider, command: path.basename(spec.command) });
    const consume = (stream, channel) => {
      let buffer = "";
      stream.setEncoding("utf8");
      stream.on("data", (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";
        for (const line of lines) if (line.trim()) spec.onLine ? spec.onLine(line, channel) : emitTask(project.id, "log", { channel, text: line });
      });
      stream.on("end", () => { if (buffer.trim()) spec.onLine ? spec.onLine(buffer, channel) : emitTask(project.id, "log", { channel, text: buffer }); });
    };
    consume(child.stdout, "stdout");
    consume(child.stderr, "stderr");
    child.on("error", (error) => { emitTask(project.id, "error", { message: error.message }); finishTask(project, 1); });
    child.on("exit", (code, signal) => finishTask(project, code ?? 1, signal));
    return task;
  }
  function runAgent(project, provider, prompt, model, manualPrompt = null) {
    if (!PROVIDERS.has(provider)) throw Object.assign(new Error("Unsupported agent provider."), { statusCode: 400 });
    const fullPrompt = manualPrompt || prompt;
    if (provider === "manual") return { manual: true, prompt: fullPrompt };
    if (!statuses[provider]?.available) throw Object.assign(new Error(`${statuses[provider]?.label || provider} is not installed or not on PATH.`), { statusCode: 409 });
    if (provider === "claude") {
      const args = ["-p", "--output-format", "stream-json", "--verbose", "--max-turns", String(Number(process.env.AIGENT_STUDIO_MAX_TURNS || 32)), "--permission-mode", "acceptEdits", "--allowedTools", "Read,Write,Edit,Glob,Grep,Bash(node:*),Bash(npm:*),Bash(npx:*),Bash(git:*)"];
      if (model) args.push("--model", model);
      if (project.claudeSessionId) args.push("--resume", project.claudeSessionId);
      args.push(fullPrompt);
      return startProcess(project, {
        kind: "agent", provider, command: statuses.claude.command, args,
        onLine(line, channel) {
          if (channel === "stderr") return emitTask(project.id, "log", { channel, text: line });
          const parsed = readableClaudeLine(line);
          if (parsed.sessionId && parsed.sessionId !== project.claudeSessionId) {
            project.claudeSessionId = parsed.sessionId;
            writeJson(projectFile(projectsRoot, project.id), project);
          }
          if (parsed.text) emitTask(project.id, "log", { channel, text: parsed.text });
        },
      });
    }
    const args = ["--ask-for-approval", "never", "exec", "--sandbox", "workspace-write", "--ephemeral"];
    if (model) args.push("--model", model);
    args.push(fullPrompt);
    return startProcess(project, { kind: "agent", provider, command: statuses.codex.command, args });
  }
  async function runAction(project, action) {
    const directory = projectDirectory(projectsRoot, project.id);
    if (action === "plan") {
      const { plan } = await import(pathToFileURL(path.join(packageRoot, "scripts", "plan-design.mjs")));
      const result = plan(readJson(path.join(directory, "design-brief.json")));
      writeJson(path.join(directory, ".aigent", "design-plan.json"), result);
      project.updatedAt = now(); project.revision += 1; writeJson(projectFile(projectsRoot, project.id), project);
      return { action, complete: true, summary: { layout: result.layout?.recommended?.name || result.layout?.name || null, type: result.typography?.name || null, motion: result.motion?.focal?.name || null }, revision: project.revision };
    }
    const address = server.address();
    const previewUrl = `http://${host}:${address.port}/preview/${project.id}${previewPath(project)}`;
    if (action === "resolve") { const spec = studioNodeSpec(path.join("scripts", "resolve-design.mjs"), ["--target", directory, "--url", previewUrl, "--out", path.join(directory, ".aigent", "resolve"), "--no-fail"]); return startProcess(project, { kind: action, ...spec }); }
    if (action === "vision") { const spec = studioNodeSpec(path.join("scripts", "vision-review.mjs"), ["prepare", "--target", directory, "--url", previewUrl, "--out", path.join(directory, ".aigent", "resolve")]); return startProcess(project, { kind: action, ...spec }); }
    if (action === "inspire") {
      const references = project.references.filter((item) => /^https?:\/\//i.test(item));
      if (!references.length) throw Object.assign(new Error("Add at least one public reference URL first."), { statusCode: 400 });
      const args = ["add", references[0], "--root", path.join(directory, ".aigent", "inspiration"), "--label", new URL(references[0]).hostname.replace(/[^a-z0-9]+/gi, "-").toLowerCase()];
      const spec = studioNodeSpec(path.join("scripts", "inspire.mjs"), args);
      return startProcess(project, { kind: action, ...spec });
    }
    throw Object.assign(new Error("Unsupported action."), { statusCode: 400 });
  }

  server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${requestedPort}`}`);
      const pathname = url.pathname;
      const method = request.method || "GET";

      if (pathname === "/api/status" && method === "GET") {
        sendJson(response, 200, { version: "1.2.0", providers: statuses, starters: Object.entries(STARTERS).map(([id, value]) => ({ id, ...value })), projectsRoot });
        return;
      }
      if (pathname === "/api/projects" && method === "GET") { sendJson(response, 200, { projects: listProjects(projectsRoot) }); return; }
      if (pathname === "/api/projects" && method === "POST") { const input = await readBody(request); const project = createProject(projectsRoot, input); sendJson(response, 201, { project }); return; }

      const projectMatch = /^\/api\/projects\/([^/]+)(.*)$/.exec(pathname);
      if (projectMatch) {
        const id = safeId(projectMatch[1]);
        const suffix = projectMatch[2] || "";
        const project = readProject(projectsRoot, id);
        const task = tasks.get(id);
        if (suffix === "/publish" || suffix.startsWith("/publish/")) {
          const handled = await publishController.handle({ request, response, method, suffix, project });
          if (handled) return;
        }
        if (!suffix && method === "GET") { sendJson(response, 200, { project, task: task ? { running: Boolean(task.child), kind: task.kind, provider: task.provider } : null }); return; }
        if (!suffix && method === "PATCH") { sendJson(response, 200, { project: updateProject(projectsRoot, id, await readBody(request)) }); return; }
        if (!suffix && method === "DELETE") {
          if (task?.child) task.child.kill("SIGTERM");
          fs.rmSync(projectDirectory(projectsRoot, id), { recursive: true, force: true });
          sendJson(response, 200, { deleted: true });
          return;
        }
        if (suffix === "/events" && method === "GET") {
          response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
          response.write(`data: ${JSON.stringify({ type: "connected", at: now() })}\n\n`);
          for (const event of task?.events || []) response.write(`data: ${JSON.stringify(event)}\n\n`);
          taskSet(id).add(response);
          request.on("close", () => taskSet(id).delete(response));
          return;
        }
        if (suffix === "/collaboration" && method === "GET") {
          response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
          response.write(`data: ${JSON.stringify({ type: "presence", at: now(), participants: participantList(id) })}\n\n`);
          collabSet(id).add(response);
          request.on("close", () => collabSet(id).delete(response));
          return;
        }
        if (suffix === "/presence" && method === "POST") {
          const input = await readBody(request);
          const participant = author({ id: input.clientId, name: input.name, color: input.color });
          const map = presence.get(id) || new Map();
          map.set(participant.id, { clientId: participant.id, name: participant.name, color: participant.color, selectedIds: (input.selectedIds || []).map((nodeId) => safeEntityId(nodeId, "node")).slice(0, 64), viewport: ["desktop", "tablet", "mobile"].includes(input.viewport) ? input.viewport : "desktop", mode: ["preview", "select", "comment"].includes(input.mode) ? input.mode : "select", seenAt: now() });
          presence.set(id, map);
          publishPresence(id);
          sendJson(response, 200, { participants: participantList(id) });
          return;
        }
        if (suffix === "/run" && method === "POST") {
          const input = await readBody(request);
          const provider = PROVIDERS.has(input.provider) ? input.provider : project.provider;
          const result = runAgent(project, provider, buildAgentPrompt(projectsRoot, project, input), text(input.model, "", 120));
          sendJson(response, result.manual ? 200 : 202, result.manual ? result : { started: true, provider, runId: result.id });
          return;
        }
        if (suffix === "/distill" && method === "POST") {
          const input = await readBody(request);
          const provider = PROVIDERS.has(input.provider) ? input.provider : project.provider;
          const result = runAgent(project, provider, distillPrompt(projectsRoot, project), text(input.model, "", 120));
          sendJson(response, result.manual ? 200 : 202, result.manual ? result : { started: true, provider, runId: result.id });
          return;
        }
        if (suffix === "/cancel" && method === "POST") {
          await readBody(request);
          if (task?.child) task.child.kill("SIGTERM");
          sendJson(response, 200, { cancelled: Boolean(task?.child) });
          return;
        }
        if (suffix === "/action" && method === "POST") { const input = await readBody(request); const result = await runAction(project, input.action); sendJson(response, result.complete ? 200 : 202, result.complete ? result : { started: true, action: input.action, runId: result.id }); return; }
        if (suffix === "/canvas" && method === "GET") { sendJson(response, 200, publicCanvas(readCanvas(projectsRoot, id))); return; }
        if (suffix === "/canvas/operations" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const operation = appendOperation(canvas, input.operation, input.author);
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "canvas", { authorId: operation.author.id, operationId: operation.id, revision: canvas.revision });
          sendJson(response, 201, { operation, canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/undo" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          if (canvas.cursor >= 0) canvas.cursor -= 1;
          canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "canvas", { authorId: author(input.author).id, action: "undo", revision: canvas.revision });
          sendJson(response, 200, { canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/redo" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          if (canvas.cursor < canvas.operations.length - 1) canvas.cursor += 1;
          canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "canvas", { authorId: author(input.author).id, action: "redo", revision: canvas.revision });
          sendJson(response, 200, { canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/clear" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          canvas.operations = []; canvas.cursor = -1; canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "canvas", { authorId: author(input.author).id, action: "clear", revision: canvas.revision });
          sendJson(response, 200, { canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/comments" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const commentAuthor = author(input.author);
          const comment = { id: randomUUID(), nodeId: safeEntityId(input.nodeId, "node"), nodeLabel: text(input.nodeLabel, input.nodeId, 120), body: text(input.body, "", 5000), viewport: ["desktop", "tablet", "mobile"].includes(input.viewport) ? input.viewport : "base", status: "open", authorId: commentAuthor.id, authorName: commentAuthor.name, createdAt: now(), updatedAt: now() };
          if (!comment.body) throw Object.assign(new Error("Comment body is required."), { statusCode: 400 });
          canvas.annotations.unshift(comment); canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "comment", { authorId: commentAuthor.id, commentId: comment.id, revision: canvas.revision });
          sendJson(response, 201, { comment, canvas: publicCanvas(canvas) });
          return;
        }
        const commentMatch = /^\/canvas\/comments\/([^/]+)$/.exec(suffix);
        if (commentMatch && method === "PATCH") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const commentId = safeEntityId(commentMatch[1], "comment");
          const comment = canvas.annotations.find((item) => item.id === commentId);
          if (!comment) throw Object.assign(new Error("Comment not found."), { statusCode: 404 });
          if (input.status) comment.status = input.status === "resolved" ? "resolved" : "open";
          if (input.body != null) comment.body = text(input.body, "", 5000);
          comment.updatedAt = now(); canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "comment", { authorId: author(input.author).id, commentId, revision: canvas.revision });
          sendJson(response, 200, { comment, canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/components" && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const componentAuthor = author(input.author);
          const component = { id: randomUUID(), name: text(input.name, "Component", 120), html: sanitizeHtml(input.html), sourceNodeId: safeEntityId(input.sourceNodeId, "node"), sourceLabel: text(input.sourceLabel, "Reusable section", 120), createdAt: now(), authorId: componentAuthor.id };
          if (!component.html) throw Object.assign(new Error("Component HTML is empty."), { statusCode: 400 });
          canvas.components.unshift(component); canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "component", { authorId: componentAuthor.id, componentId: component.id, revision: canvas.revision });
          sendJson(response, 201, { component, canvas: publicCanvas(canvas) });
          return;
        }
        const componentInsertMatch = /^\/canvas\/components\/([^/]+)\/insert$/.exec(suffix);
        if (componentInsertMatch && method === "POST") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const componentId = safeEntityId(componentInsertMatch[1], "component");
          const component = canvas.components.find((item) => item.id === componentId);
          if (!component) throw Object.assign(new Error("Component not found."), { statusCode: 404 });
          const operation = appendOperation(canvas, { kind: "insert", nodeId: input.targetId, position: input.position, html: component.html }, input.author);
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "canvas", { authorId: operation.author.id, operationId: operation.id, revision: canvas.revision });
          sendJson(response, 201, { operation, canvas: publicCanvas(canvas) });
          return;
        }
        const componentMatch = /^\/canvas\/components\/([^/]+)$/.exec(suffix);
        if (componentMatch && method === "DELETE") {
          const input = await readBody(request);
          const canvas = readCanvas(projectsRoot, id);
          const componentId = safeEntityId(componentMatch[1], "component");
          canvas.components = canvas.components.filter((item) => item.id !== componentId); canvas.revision += 1;
          writeCanvas(projectsRoot, id, canvas);
          emitCollaboration(id, "component", { authorId: author(input.author).id, componentId, action: "delete", revision: canvas.revision });
          sendJson(response, 200, { canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/canvas/checkpoints" && method === "POST") {
          const input = await readBody(request);
          const canvas = checkpointProject(projectsRoot, id, input.label, input.author);
          emitCollaboration(id, "checkpoint", { authorId: author(input.author).id, checkpointId: canvas.checkpoints[0]?.id, revision: canvas.revision });
          sendJson(response, 201, { canvas: publicCanvas(canvas) });
          return;
        }
        const restoreMatch = /^\/canvas\/checkpoints\/([^/]+)\/restore$/.exec(suffix);
        if (restoreMatch && method === "POST") {
          const input = await readBody(request);
          const canvas = restoreCheckpoint(projectsRoot, id, restoreMatch[1]);
          emitCollaboration(id, "checkpoint", { authorId: author(input.author).id, checkpointId: restoreMatch[1], action: "restore", revision: canvas.revision });
          sendJson(response, 200, { canvas: publicCanvas(canvas) });
          return;
        }
        if (suffix === "/diff" && method === "GET") { sendJson(response, 200, { diff: projectDiff(projectsRoot, id) }); return; }
      }

      const previewMatch = /^\/preview\/([^/]+)(\/.*)?$/.exec(pathname);
      if (previewMatch) {
        const id = safeId(previewMatch[1]);
        const project = readProject(projectsRoot, id);
        const requested = previewMatch[2] || previewPath(project);
        const file = safeStaticFile(projectDirectory(projectsRoot, id), requested);
        if (!file) { sendText(response, 404, "Not found"); return; }
        const isHtml = path.extname(file).toLowerCase() === ".html";
        if (!serveFile(request, response, file, isHtml ? (html) => injectStudio(html, id, activeOperations(readCanvas(projectsRoot, id))) : null)) sendText(response, 404, "Not found");
        return;
      }

      if (pathname === "/") { response.writeHead(302, { location: "/studio/" }); response.end(); return; }
      const staticFile = safeStaticFile(packageRoot, pathname);
      if (serveFile(request, response, staticFile)) return;
      sendText(response, 404, "Not found");
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });

  return {
    projectsRoot,
    server,
    listen(port = requestedPort) {
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => resolve(server.address()));
      });
    },
    close() {
      for (const task of tasks.values()) if (task.child) task.child.kill("SIGTERM");
      for (const clients of taskClients.values()) for (const response of clients) response.end();
      for (const clients of collaborationClients.values()) for (const response of clients) response.end();
      if (!server.listening) return Promise.resolve();
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

function openBrowser(url) {
  const commands = process.platform === "darwin" ? [["open", [url]]] : process.platform === "win32" ? [["cmd", ["/c", "start", "", url]]] : [["xdg-open", [url]]];
  for (const [command, args] of commands) {
    const result = spawnSync(command, args, { stdio: "ignore", windowsHide: true });
    if (result.status === 0) return true;
  }
  return false;
}
export async function runStudio(args = process.argv.slice(2)) {
  const app = createStudioServer({ projectsRoot: option(args, "--root", process.env.AIGENT_STUDIO_ROOT || defaultProjectsRoot), port: Number(option(args, "--port", 4180)), host: option(args, "--host", "127.0.0.1") });
  const address = await app.listen(Number(option(args, "--port", 4180)));
  const url = `http://127.0.0.1:${address.port}/studio/`;
  console.log(`AIgent Studio v1.1 running at ${url}`);
  console.log(`Projects: ${app.projectsRoot}`);
  if (hasFlag(args, "--open") && !openBrowser(url)) console.log(`Open ${url} in a browser.`);
  const shutdown = async () => { await app.close(); process.exit(0); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return app;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runStudio().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
