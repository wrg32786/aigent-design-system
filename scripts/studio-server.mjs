#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultProjectsRoot = path.join(packageRoot, ".aigent", "studio", "projects");
const MAX_BODY_BYTES = 1_000_000;
const PROJECT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const PROVIDERS = new Set(["claude", "codex", "manual"]);
const BLOCKED_PATH_SEGMENTS = new Set([".git", ".aigent", ".claude", ".codex", "node_modules"]);
const STARTERS = Object.freeze({
  blank: { label: "Blank static site", item: "studio-core", entry: "/index.html", mode: "persuade" },
  cinematic: { label: "Cinematic scroll page", item: "cinematic-page", entry: "/templates/modular-scroll-starter/", mode: "experience" },
  deck: { label: "Immersive sales deck", item: "immersive-sales-deck", entry: "/templates/immersive-sales-deck/", mode: "persuade" },
  interface: { label: "Command center interface", item: "command-center-interface", entry: "/templates/command-center-interface/", mode: "operate" },
  threejs: { label: "Progressive Three.js stage", item: "threejs-product-stage", entry: "/templates/threejs-product-stage/", mode: "experience" },
});

const types = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".gif", "image/gif"],
  [".mp4", "video/mp4"], [".webm", "video/webm"], [".woff2", "font/woff2"],
]);

function now() { return new Date().toISOString(); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
function text(value, fallback = "", maximum = 5000) {
  const selected = String(value ?? fallback).trim();
  return (selected || String(fallback)).slice(0, maximum);
}
function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}
function hasFlag(args, name) { return args.includes(name); }
function safeId(id) {
  if (!PROJECT_ID.test(id || "")) throw Object.assign(new Error("Invalid project id."), { statusCode: 400 });
  return id;
}
function slugify(value) {
  const slug = String(value || "project").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return safeId(slug || "project");
}
function projectDirectory(projectsRoot, id) {
  const root = path.resolve(projectsRoot);
  const directory = path.resolve(root, safeId(id));
  if (directory !== root && !directory.startsWith(`${root}${path.sep}`)) throw new Error("Project path escaped workspace.");
  return directory;
}
function projectFile(projectsRoot, id) { return path.join(projectDirectory(projectsRoot, id), "studio.project.json"); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
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
    .map((entry) => {
      try { return readProject(projectsRoot, entry.name); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
function normaliseReferences(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/\r?\n/);
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12);
}
function briefObject(input, starter) {
  const modes = Array.isArray(input.modes) && input.modes.length ? input.modes : [input.mode || starter.mode];
  return {
    $schema: "./design-intelligence/brief.schema.json",
    name: String(input.name || "Untitled project").trim(),
    modes,
    audience: String(input.audience || "The intended customer or user").trim(),
    visitorGoal: String(input.goal || "Understand the offer and take the primary action").trim(),
    productMechanism: String(input.mechanism || input.description || "The product delivers the stated outcome").trim(),
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
  return `# AIgent Studio project\n\nRead these before editing:\n\n1. \`BRIEF.md\`\n2. \`PRODUCT.md\`\n3. \`DESIGN.md\`\n4. \`.claude/skills/aigent-design/SKILL.md\` when present\n5. \`.aigent/design-plan.json\` when present\n6. \`.aigent/inspiration-plan.json\` when present\n\nWork directly on the preview entry \`${project.entry}\`. Reuse the installed tokens, patterns, skills, and starter before adding code or dependencies. Preserve accessibility, mobile recomposition, reduced motion, asset provenance, and the chosen product-specific visual world. Do not build a second disconnected demo elsewhere.\n`;
}
function blankFiles(directory, project) {
  const name = escapeHtml(project.name);
  const description = escapeHtml(project.description);
  const html = `<!doctype html>\n<html lang="en" data-theme="graphite">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="${description}">\n  <title>${name}</title>\n  <link rel="stylesheet" href="tokens/system.css">\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body class="ds-shell">\n  <main class="site-shell">\n    <p class="ds-eyebrow">AIgent Studio project</p>\n    <h1>${name}</h1>\n    <p>${description}</p>\n    <a class="ds-button" data-variant="solid" href="#start">Start</a>\n  </main>\n  <script type="module" src="app.js"></script>\n</body>\n</html>\n`;
  const css = `body{margin:0}.site-shell{width:min(1100px,calc(100% - 40px));min-height:100svh;margin:auto;display:grid;align-content:center;gap:24px}.site-shell h1{max-width:10ch;margin:0;font:800 clamp(4rem,12vw,9rem)/.9 var(--ds-font-display);letter-spacing:-.05em}.site-shell p:not(.ds-eyebrow){max-width:62ch;margin:0;color:var(--ds-color-muted);font:520 1.15rem/1.6 var(--ds-font-body)}.site-shell .ds-button{width:max-content}@media(max-width:600px){.site-shell{width:min(100% - 28px,1100px)}}\n`;
  fs.writeFileSync(path.join(directory, "index.html"), html);
  fs.writeFileSync(path.join(directory, "styles.css"), css);
  fs.writeFileSync(path.join(directory, "app.js"), "document.documentElement.dataset.ready = 'true';\n");
}
function runLocalCli(args, options = {}) {
  const studioRegistry = path.join(packageRoot, ".aigent", "studio", "registry.json");
  const result = spawnSync(process.execPath, [path.join(packageRoot, "scripts", "cli.mjs"), ...args], {
    cwd: packageRoot, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024,
    env: { ...process.env, ...(fs.existsSync(studioRegistry) ? { AIGENT_REGISTRY_PATH: studioRegistry } : {}) },
    ...options,
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || "AIgent CLI failed").trim());
  return result.stdout.trim();
}
function writeProjectFiles(projectsRoot, project, input) {
  const directory = projectDirectory(projectsRoot, project.id);
  const starter = STARTERS[project.starter];
  const brief = briefObject({ ...input, name: project.name }, starter);
  writeJson(path.join(directory, "design-brief.json"), brief);
  fs.writeFileSync(path.join(directory, "BRIEF.md"), briefMarkdown(project, brief));
  fs.writeFileSync(path.join(directory, "AGENTS.md"), agentInstructions(project));
  fs.writeFileSync(path.join(directory, "CLAUDE.md"), agentInstructions(project));
  writeJson(projectFile(projectsRoot, project.id), project);
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
      schemaVersion: 1, id, name: text(input.name, "Untitled site", 120),
      description: text(input.description, "A distinctive product-specific website built in AIgent Studio.", 5000),
      audience: text(input.audience, "", 1000), goal: text(input.goal, "", 2000),
      mechanism: text(input.mechanism, "", 3000), request: text(input.request, "", 6000),
      starter: starterKey, entry: starter.entry, provider: PROVIDERS.has(input.provider) ? input.provider : "claude",
      references: normaliseReferences(input.references), createdAt: now(), updatedAt: now(), revision: 1,
      lastRun: null, claudeSessionId: null,
    };
    if (starterKey === "blank") blankFiles(directory, project);
    writeProjectFiles(projectsRoot, project, input);
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
  project.updatedAt = now(); project.revision += 1;
  writeProjectFiles(projectsRoot, project, { ...readJson(path.join(projectDirectory(projectsRoot, id), "design-brief.json")), ...input });
  return project;
}
function previewPath(project) {
  const entry = project.entry.startsWith("/") ? project.entry : `/${project.entry}`;
  return `/preview/${project.id}${entry}`;
}
function buildAgentPrompt(project, userPrompt = "") {
  const references = project.references.length ? project.references.map((item) => `- ${item}`).join("\n") : "- none";
  return `You are the operating designer inside AIgent Studio.\n\nRead BRIEF.md, PRODUCT.md, DESIGN.md, AGENTS.md, and .claude/skills/aigent-design/SKILL.md before editing. Read .aigent/design-plan.json and .aigent/inspiration-plan.json when present.\n\nBuild directly in this project. The live preview entry is ${project.entry}. Do not create a separate demo or explain what you would build: edit the actual files. Reuse installed tokens, patterns, reference systems, skills, and native platform features before adding a dependency. Keep the surface product-specific, accessible, responsive, reduced-motion complete, and visually coherent.\n\nReferences supplied by the operator:\n${references}\n\nOperator request:\n${userPrompt || project.request || "Build the strongest complete version of the brief."}\n\nBefore stopping, inspect the rendered result if browser tools are available, fix the highest shared cause, and leave the preview entry working.`;
}
function readableClaudeLine(line) {
  try {
    const message = JSON.parse(line);
    if (message.type === "system" && message.session_id) return { text: `Claude session ${message.session_id}`, sessionId: message.session_id };
    if (message.type === "result") return { text: message.result || message.subtype || "Claude finished", sessionId: message.session_id || null };
    if (message.type === "assistant") {
      const content = message.message?.content;
      const text = Array.isArray(content) ? content.filter((item) => item.type === "text").map((item) => item.text).join("\n") : "";
      return { text: text || null, sessionId: message.session_id || null };
    }
    return { text: null, sessionId: message.session_id || null };
  } catch { return { text: line, sessionId: null }; }
}

export function createStudioServer(options = {}) {
  const projectsRoot = path.resolve(options.projectsRoot || process.env.AIGENT_STUDIO_ROOT || defaultProjectsRoot);
  const host = options.host || "127.0.0.1";
  const requestedPort = Number(options.port ?? process.env.STUDIO_PORT ?? 4180);
  fs.mkdirSync(projectsRoot, { recursive: true });
  const statuses = providerStatus();
  const tasks = new Map();

  function emit(id, type, payload = {}) {
    const task = tasks.get(id);
    if (!task) return;
    const event = { at: now(), type, ...payload };
    task.events.push(event);
    if (task.events.length > 400) task.events.shift();
    for (const response of task.clients) response.write(`data: ${JSON.stringify(event)}\n\n`);
  }
  function finishTask(project, code, signal = null) {
    const task = tasks.get(project.id);
    if (!task || task.done) return;
    task.done = true;
    project.lastRun = { id: task.id, kind: task.kind, provider: task.provider, code, signal, finishedAt: now() };
    project.updatedAt = now(); project.revision += 1;
    writeJson(projectFile(projectsRoot, project.id), project);
    emit(project.id, "done", { code, signal, revision: project.revision });
    task.child = null;
  }
  function startProcess(project, spec) {
    const existing = tasks.get(project.id);
    if (existing?.child) throw Object.assign(new Error("A task is already running for this project."), { statusCode: 409 });
    const task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind: spec.kind, provider: spec.provider || null, child: null, events: existing?.events || [], clients: existing?.clients || new Set(), done: false };
    tasks.set(project.id, task);
    const child = spawn(spec.command, spec.args, { cwd: spec.cwd || projectDirectory(projectsRoot, project.id), env: { ...process.env, FORCE_COLOR: "0", AIGENT_STUDIO: "1" }, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    task.child = child;
    emit(project.id, "start", { runId: task.id, kind: task.kind, provider: task.provider, command: path.basename(spec.command) });
    const consume = (stream, channel) => {
      let buffer = "";
      stream.setEncoding("utf8");
      stream.on("data", (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/); buffer = lines.pop() || "";
        for (const line of lines) if (line.trim()) spec.onLine ? spec.onLine(line, channel) : emit(project.id, "log", { channel, text: line });
      });
      stream.on("end", () => { if (buffer.trim()) spec.onLine ? spec.onLine(buffer, channel) : emit(project.id, "log", { channel, text: buffer }); });
    };
    consume(child.stdout, "stdout"); consume(child.stderr, "stderr");
    child.on("error", (error) => { emit(project.id, "error", { message: error.message }); finishTask(project, 1); });
    child.on("exit", (code, signal) => finishTask(project, code ?? 1, signal));
    return task;
  }
  function runAgent(project, provider, prompt, model) {
    if (!PROVIDERS.has(provider)) throw Object.assign(new Error("Unsupported agent provider."), { statusCode: 400 });
    const fullPrompt = buildAgentPrompt(project, prompt);
    if (provider === "manual") return { manual: true, prompt: fullPrompt };
    if (!statuses[provider]?.available) throw Object.assign(new Error(`${statuses[provider]?.label || provider} is not installed or not on PATH.`), { statusCode: 409 });
    if (provider === "claude") {
      const args = ["-p", "--output-format", "stream-json", "--verbose", "--max-turns", String(Number(process.env.AIGENT_STUDIO_MAX_TURNS || 24)), "--permission-mode", "acceptEdits", "--allowedTools", "Read,Write,Edit,Glob,Grep,Bash(node:*),Bash(npm:*),Bash(npx:*)"];
      if (model) args.push("--model", model);
      if (project.claudeSessionId) args.push("--resume", project.claudeSessionId);
      args.push(fullPrompt);
      return startProcess(project, {
        kind: "agent", provider, command: statuses.claude.command, args,
        onLine(line, channel) {
          if (channel === "stderr") return emit(project.id, "log", { channel, text: line });
          const parsed = readableClaudeLine(line);
          if (parsed.sessionId && parsed.sessionId !== project.claudeSessionId) {
            project.claudeSessionId = parsed.sessionId; writeJson(projectFile(projectsRoot, project.id), project);
          }
          if (parsed.text) emit(project.id, "log", { channel, text: parsed.text });
        },
      });
    }
    const args = ["--ask-for-approval", "never", "--sandbox", "workspace-write", "exec", "--ephemeral"];
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
    const previewUrl = `http://${host}:${server.address()?.port || requestedPort}${previewPath(project)}`;
    if (action === "resolve") {
      return startProcess(project, { kind: action, command: process.execPath, args: [path.join(packageRoot, "scripts", "resolve-design.mjs"), "--target", directory, "--url", previewUrl, "--out", path.join(directory, ".aigent", "resolve"), "--no-fail"] });
    }
    if (action === "vision") {
      return startProcess(project, { kind: action, command: process.execPath, args: [path.join(packageRoot, "scripts", "vision-review.mjs"), "prepare", "--target", directory, "--url", previewUrl, "--out", path.join(directory, ".aigent", "resolve")] });
    }
    if (action === "inspire") {
      const references = project.references.filter((item) => /^https?:\/\//i.test(item));
      if (!references.length) throw Object.assign(new Error("Add at least one public reference URL first."), { statusCode: 400 });
      const args = [path.join(packageRoot, "scripts", "inspire.mjs"), "add", references[0], "--root", path.join(directory, ".aigent", "inspiration"), "--label", new URL(references[0]).hostname.replace(/[^a-z0-9]+/gi, "-").toLowerCase()];
      return startProcess(project, { kind: action, command: process.execPath, args });
    }
    throw Object.assign(new Error("Unsupported action."), { statusCode: 400 });
  }

  async function body(request) {
    if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      throw Object.assign(new Error("Request content type must be application/json."), { statusCode: 415 });
    }
    const chunks = []; let size = 0;
    for await (const chunk of request) {
      size += chunk.length; if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
      chunks.push(chunk);
    }
    if (!chunks.length) return {};
    try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }); }
  }
  function respondJson(response, status, value) {
    const text = `${JSON.stringify(value)}\n`;
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(text), "cache-control": "no-store" }); response.end(text);
  }
  function sendFile(response, file, method = "GET") {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
    const stat = fs.statSync(file); const type = types.get(path.extname(file).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, { "content-type": type, "content-length": stat.size, "cache-control": "no-store", "x-content-type-options": "nosniff" });
    if (method === "HEAD") response.end(); else fs.createReadStream(file).pipe(response);
    return true;
  }
  function resolveStatic(root, pathname) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.some((segment) => segment.startsWith(".") || BLOCKED_PATH_SEGMENTS.has(segment))) return null;
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) return null;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    return file;
  }

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${host}:${requestedPort}`);
      const method = request.method || "GET";
      const origin = request.headers.origin;
      const expectedOrigin = `http://${request.headers.host}`;
      if (!["GET", "HEAD", "OPTIONS"].includes(method) && origin && origin !== expectedOrigin) {
        throw Object.assign(new Error("Cross-origin Studio writes are not allowed."), { statusCode: 403 });
      }
      if (url.pathname === "/") { response.writeHead(302, { location: "/studio/" }); response.end(); return; }
      if (url.pathname === "/api/status" && method === "GET") return respondJson(response, 200, { version: "0.6.0", projectsRoot, providers: statuses, starters: Object.entries(STARTERS).map(([id, value]) => ({ id, label: value.label, entry: value.entry })) });
      if (url.pathname === "/api/projects" && method === "GET") return respondJson(response, 200, { projects: listProjects(projectsRoot) });
      if (url.pathname === "/api/projects" && method === "POST") return respondJson(response, 201, { project: createProject(projectsRoot, await body(request)) });

      const projectMatch = /^\/api\/projects\/([^/]+)(?:\/(run|cancel|action|events))?$/.exec(url.pathname);
      if (projectMatch) {
        const id = safeId(projectMatch[1]); const endpoint = projectMatch[2] || "project";
        if (endpoint === "events" && method === "GET") {
          readProject(projectsRoot, id);
          response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
          response.write(`data: ${JSON.stringify({ at: now(), type: "connected" })}\n\n`);
          let task = tasks.get(id);
          if (!task) { task = { id: null, kind: null, provider: null, child: null, events: [], clients: new Set(), done: true }; tasks.set(id, task); }
          for (const event of task.events) response.write(`data: ${JSON.stringify(event)}\n\n`);
          task.clients.add(response);
          const heartbeat = setInterval(() => response.write(": ping\n\n"), 15000);
          request.on("close", () => { clearInterval(heartbeat); task.clients.delete(response); });
          return;
        }
        const project = readProject(projectsRoot, id);
        if (endpoint === "project" && method === "GET") return respondJson(response, 200, { project, preview: previewPath(project), task: tasks.get(id) ? { kind: tasks.get(id).kind, running: Boolean(tasks.get(id).child), runId: tasks.get(id).id } : null });
        if (endpoint === "project" && method === "PATCH") return respondJson(response, 200, { project: updateProject(projectsRoot, id, await body(request)) });
        if (endpoint === "project" && method === "DELETE") {
          if (tasks.get(id)?.child) throw Object.assign(new Error("Cancel the active task before deleting the project."), { statusCode: 409 });
          fs.rmSync(projectDirectory(projectsRoot, id), { recursive: true, force: true }); tasks.delete(id); return respondJson(response, 200, { deleted: id });
        }
        if (endpoint === "run" && method === "POST") {
          const input = await body(request); const provider = PROVIDERS.has(input.provider) ? input.provider : project.provider;
          const result = runAgent(project, provider, String(input.prompt || ""), input.model ? String(input.model) : null);
          return respondJson(response, result.manual ? 200 : 202, result.manual ? result : { runId: result.id, provider, preview: previewPath(project) });
        }
        if (endpoint === "cancel" && method === "POST") {
          const task = tasks.get(id); if (!task?.child) return respondJson(response, 200, { cancelled: false });
          task.child.kill("SIGTERM"); setTimeout(() => task.child?.kill("SIGKILL"), 2000).unref(); return respondJson(response, 200, { cancelled: true });
        }
        if (endpoint === "action" && method === "POST") {
          const input = await body(request); const result = await runAction(project, String(input.action || ""));
          return respondJson(response, 202, result?.id ? { runId: result.id, action: input.action } : result);
        }
      }

      const previewMatch = /^\/preview\/([^/]+)(\/.*)?$/.exec(url.pathname);
      if (previewMatch && (method === "GET" || method === "HEAD")) {
        const project = readProject(projectsRoot, safeId(previewMatch[1]));
        const directory = projectDirectory(projectsRoot, project.id);
        let pathname = previewMatch[2] || "/";
        if (pathname === "/") { response.writeHead(302, { location: previewPath(project) }); response.end(); return; }
        const file = resolveStatic(directory, pathname);
        if (file && sendFile(response, file, method)) return;
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); response.end("Project file not found"); return;
      }

      if (method === "GET" || method === "HEAD") {
        const file = resolveStatic(packageRoot, url.pathname);
        if (file && sendFile(response, file, method)) return;
      }
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); response.end("Not found");
    } catch (error) {
      const status = Number(error?.statusCode || 500);
      respondJson(response, status, { error: error instanceof Error ? error.message : String(error) });
    }
  });
  return {
    server, host, projectsRoot,
    async listen(port = requestedPort) {
      await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, host, resolve); });
      return server.address();
    },
    async close() {
      for (const task of tasks.values()) task.child?.kill("SIGTERM");
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

export async function runStudio(args = process.argv.slice(2)) {
  const port = Number(option(args, "--port", process.env.STUDIO_PORT || 4180));
  const root = option(args, "--root", process.env.AIGENT_STUDIO_ROOT || defaultProjectsRoot);
  const app = createStudioServer({ port, projectsRoot: root });
  const address = await app.listen(port);
  const url = `http://127.0.0.1:${address.port}/studio/`;
  console.log(`AIgent Studio running at ${url}`);
  console.log("Uses your authenticated local Claude Code or Codex CLI; no API key is sent to the browser.");
  if (hasFlag(args, "--open")) {
    const opener = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
    spawn(opener[0], opener[1], { stdio: "ignore", detached: true, windowsHide: true }).unref();
  }
  return app;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runStudio().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
