import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = (name) => path.join(root, name);
const read = (name) => fs.readFileSync(file(name), "utf8");
const write = (name, value) => fs.writeFileSync(file(name), value.endsWith("\n") ? value : `${value}\n`);

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing patch marker: ${label}`);
  return source.replace(before, after);
}
function appendOnce(source, marker, addition) {
  return source.includes(marker) ? source : `${source.trimEnd()}\n\n${addition.trim()}\n`;
}

{
  const name = "package.json";
  const pkg = JSON.parse(read(name));
  pkg.version = "0.6.0";
  pkg.description = "An installable agent-native design studio with an interactive local builder, inspiration forensics, immersive production, ranked Resolve, structured visual critique, skills, provenance, evals, and browser QA.";
  pkg.scripts.studio = "node scripts/studio-server.mjs";
  pkg.scripts["studio:check"] = "node scripts/check-studio.mjs";
  pkg.keywords = [...new Set([...(pkg.keywords || []), "website-builder", "agent-ui", "interactive-studio"])];
  write(name, JSON.stringify(pkg, null, 2));

  const lockName = "package-lock.json";
  if (fs.existsSync(file(lockName))) {
    const lock = JSON.parse(read(lockName));
    lock.version = "0.6.0";
    if (lock.packages?.[""]) lock.packages[""].version = "0.6.0";
    write(lockName, JSON.stringify(lock, null, 2));
  }
}

{
  const name = "scripts/cli.mjs";
  let source = read(name);
  source = replaceRequired(source, 'const registryPath = path.join(packageRoot, "registry.json");', 'const registryPath = process.env.AIGENT_REGISTRY_PATH\n  ? path.resolve(process.env.AIGENT_REGISTRY_PATH)\n  : path.join(packageRoot, "registry.json");', "CLI registry path");
  source = replaceRequired(source, '  const base = path.relative(packageRoot, path.dirname(file)).split(path.sep).join("/");', '  const base = file === registryPath ? "" : path.relative(packageRoot, path.dirname(file)).split(path.sep).join("/");', "CLI registry base");
  source = replaceRequired(source, 'async function vision(args) {\n  const { runVision } = await import(pathToFileURL(path.join(packageRoot, "scripts/vision-review.mjs")));\n  await runVision(args);\n}\n', 'async function vision(args) {\n  const { runVision } = await import(pathToFileURL(path.join(packageRoot, "scripts/vision-review.mjs")));\n  await runVision(args);\n}\n\nasync function studio(args) {\n  const { runStudio } = await import(pathToFileURL(path.join(packageRoot, "scripts/studio-server.mjs")));\n  await runStudio(args);\n}\n', "CLI Studio function");
  source = replaceRequired(source, '  vision <prepare|check|finalize> ...\\n  doctor\\n`);', '  vision <prepare|check|finalize> ...\\n  studio [--port 4180] [--root dir] [--open]\\n  doctor\\n`);', "CLI help");
  source = replaceRequired(source, '  } else if (command === "vision") {\n    await vision(args);\n  } else {', '  } else if (command === "vision") {\n    await vision(args);\n  } else if (command === "studio") {\n    await studio(args);\n  } else {', "CLI Studio route");
  write(name, source);
}

{
  const name = "scripts/studio-server.mjs";
  let source = read(name);
  source = replaceRequired(source, 'const PROVIDERS = new Set(["claude", "codex", "manual"]);\n', 'const PROVIDERS = new Set(["claude", "codex", "manual"]);\nconst BLOCKED_PATH_SEGMENTS = new Set([".git", ".aigent", ".claude", ".codex", "node_modules"]);\n', "Studio blocked paths");
  source = replaceRequired(source, 'function now() { return new Date().toISOString(); }\n', 'function now() { return new Date().toISOString(); }\nfunction escapeHtml(value) {\n  return String(value).replace(/[&<>"\\\']/g, (character) => ({\n    "&": "&amp;", "<": "&lt;", ">": "&gt;", \'"\': "&quot;", "\\\'": "&#39;",\n  })[character]);\n}\nfunction text(value, fallback = "", maximum = 5000) {\n  const selected = String(value ?? fallback).trim();\n  return (selected || String(fallback)).slice(0, maximum);\n}\n', "Studio escaping helpers");
  source = replaceRequired(source, 'function blankFiles(directory, project) {\n  const html = `', 'function blankFiles(directory, project) {\n  const name = escapeHtml(project.name);\n  const description = escapeHtml(project.description);\n  const html = `', "blank escaping");
  source = source.replace('${project.description.replace(/"/g, "&quot;")}', '${description}')
    .replace('<title>${project.name}</title>', '<title>${name}</title>')
    .replace('<h1>${project.name}</h1>', '<h1>${name}</h1>')
    .replace('<p>${project.description}</p>', '<p>${description}</p>');
  source = replaceRequired(source, '  const result = spawnSync(process.execPath, [path.join(packageRoot, "scripts", "cli.mjs"), ...args], {\n    cwd: packageRoot, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024, ...options,\n  });', '  const studioRegistry = path.join(packageRoot, ".aigent", "studio", "registry.json");\n  const result = spawnSync(process.execPath, [path.join(packageRoot, "scripts", "cli.mjs"), ...args], {\n    cwd: packageRoot, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024,\n    env: { ...process.env, ...(fs.existsSync(studioRegistry) ? { AIGENT_REGISTRY_PATH: studioRegistry } : {}) },\n    ...options,\n  });', "Studio registry environment");
  source = replaceRequired(source, '      schemaVersion: 1, id, name: String(input.name || "Untitled site").trim(),\n      description: String(input.description || "A distinctive product-specific website built in AIgent Studio.").trim(),\n      audience: String(input.audience || "").trim(), goal: String(input.goal || "").trim(),\n      mechanism: String(input.mechanism || "").trim(), request: String(input.request || "").trim(),', '      schemaVersion: 1, id, name: text(input.name, "Untitled site", 120),\n      description: text(input.description, "A distinctive product-specific website built in AIgent Studio.", 5000),\n      audience: text(input.audience, "", 1000), goal: text(input.goal, "", 2000),\n      mechanism: text(input.mechanism, "", 3000), request: text(input.request, "", 6000),', "Studio input boundaries");
  source = replaceRequired(source, '    if (input[key] != null) project[key] = String(input[key]).trim();', '    if (input[key] != null) project[key] = text(input[key], "", key === "name" ? 120 : 6000);', "Studio update boundaries");
  source = replaceRequired(source, '  function finishTask(project, code, signal = null) {\n    const task = tasks.get(project.id);\n    if (!task) return;\n', '  function finishTask(project, code, signal = null) {\n    const task = tasks.get(project.id);\n    if (!task || task.done) return;\n    task.done = true;\n', "Studio task completion");
  source = source.replace('    task.child = null; task.done = true;\n', '    task.child = null;\n');
  source = replaceRequired(source, '    const task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind: spec.kind, provider: spec.provider || null, child: null, events: [], clients: new Set(), done: false };', '    const task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind: spec.kind, provider: spec.provider || null, child: null, events: existing?.events || [], clients: existing?.clients || new Set(), done: false };', "Studio event continuity");
  source = replaceRequired(source, '  async function body(request) {\n    const chunks = []; let size = 0;', '  async function body(request) {\n    if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {\n      throw Object.assign(new Error("Request content type must be application/json."), { statusCode: 415 });\n    }\n    const chunks = []; let size = 0;', "Studio JSON boundary");
  source = replaceRequired(source, '  function resolveStatic(root, pathname) {\n    let file = path.resolve(root, `.${pathname}`);', '  function resolveStatic(root, pathname) {\n    const segments = pathname.split("/").filter(Boolean);\n    if (segments.some((segment) => segment.startsWith(".") || BLOCKED_PATH_SEGMENTS.has(segment))) return null;\n    let file = path.resolve(root, `.${pathname}`);', "Studio private path boundary");
  source = replaceRequired(source, '      const method = request.method || "GET";\n', '      const method = request.method || "GET";\n      const origin = request.headers.origin;\n      const expectedOrigin = `http://${request.headers.host}`;\n      if (!["GET", "HEAD", "OPTIONS"].includes(method) && origin && origin !== expectedOrigin) {\n        throw Object.assign(new Error("Cross-origin Studio writes are not allowed."), { statusCode: 403 });\n      }\n', "Studio origin boundary");
  write(name, source);
}

{
  const name = "registry.json";
  const registry = JSON.parse(read(name));
  const studioItem = {
    name: "aigent-studio",
    type: "registry:block",
    title: "AIgent Studio",
    description: "Install the local interactive website builder with a live responsive preview, project brief, Design Intelligence, Inspiration Intelligence, Resolve, Vision, and authenticated Claude Code or Codex CLI agent integration.",
    registryDependencies: [
      "wrg32786/aigent-design-system/studio-core",
      "wrg32786/aigent-design-system/inspiration-intelligence",
      "wrg32786/aigent-design-system/cinematic-page",
      "wrg32786/aigent-design-system/immersive-sales-deck",
      "wrg32786/aigent-design-system/command-center-interface",
      "wrg32786/aigent-design-system/threejs-product-stage",
      "wrg32786/aigent-design-system/creative-production",
      "wrg32786/aigent-design-system/design-resolver"
    ],
    files: [
      { path: "studio/index.html", type: "registry:file", target: "~/studio/index.html" },
      { path: "studio/studio.css", type: "registry:file", target: "~/studio/studio.css" },
      { path: "studio/app.js", type: "registry:file", target: "~/studio/app.js" },
      { path: "studio/README.md", type: "registry:file", target: "~/studio/README.md" },
      { path: "scripts/studio-server.mjs", type: "registry:file", target: "~/scripts/studio-server.mjs" },
      { path: "scripts/check-studio.mjs", type: "registry:file", target: "~/scripts/check-studio.mjs" },
      { path: "scripts/cli.mjs", type: "registry:file", target: "~/scripts/cli.mjs" },
      { path: "registry.json", type: "registry:file", target: "~/.aigent/studio/registry.json" },
      { path: "skills/aigent-studio/SKILL.md", type: "registry:file", target: "~/.claude/skills/aigent-studio/SKILL.md" }
    ],
    devDependencies: ["playwright@^1.61.1"],
    docs: "Run `node scripts/studio-server.mjs --open` after installing. Studio binds to localhost, uses an authenticated local Claude Code or Codex CLI, and never requests an API key in the browser."
  };
  registry.items = registry.items.filter((item) => item.name !== "aigent-studio");
  const fullIndex = registry.items.findIndex((item) => item.name === "full-studio");
  if (fullIndex < 0) throw new Error("Missing full-studio registry item");
  registry.items.splice(fullIndex, 0, studioItem);
  const fullStudio = registry.items.find((item) => item.name === "full-studio");
  const studioDependency = "wrg32786/aigent-design-system/aigent-studio";
  if (!fullStudio.registryDependencies.includes(studioDependency)) fullStudio.registryDependencies.push(studioDependency);
  write(name, JSON.stringify(registry, null, 2));
}

{
  const name = "scripts/check.mjs";
  let source = read(name);
  source = replaceRequired(source, '  "vault/index.html", "vault/app.js",\n', '  "vault/index.html", "vault/app.js", "studio/index.html", "studio/studio.css", "studio/app.js", "studio/README.md",\n', "Studio required UI files");
  source = replaceRequired(source, '  "scripts/resolve-design.mjs", "scripts/check-resolve.mjs", "scripts/vision-review.mjs", "scripts/check-vision.mjs",\n', '  "scripts/resolve-design.mjs", "scripts/check-resolve.mjs", "scripts/vision-review.mjs", "scripts/check-vision.mjs",\n  "scripts/studio-server.mjs", "scripts/check-studio.mjs", "skills/aigent-studio/SKILL.md",\n', "Studio required runtime files");
  source = source.replace('assert.ok(skillFiles.length >= 23,', 'assert.ok(skillFiles.length >= 24,');
  source = replaceRequired(source, '["aigent-design", "design-forensics", "reference-synthesis", "inspiration-originality-audit", "design-resolver", "visual-design-critic"]', '["aigent-design", "aigent-studio", "design-forensics", "reference-synthesis", "inspiration-originality-audit", "design-resolver", "visual-design-critic"]', "Studio required skill");
  source = source.replace('assert.ok(registry.items.length >= 15,', 'assert.ok(registry.items.length >= 16,');
  source = replaceRequired(source, 'for (const name of ["inspiration-intelligence", "design-resolver", "vision-critic"]) {', 'for (const name of ["inspiration-intelligence", "design-resolver", "vision-critic", "aigent-studio"]) {', "Studio registry assertion");
  source = replaceRequired(source, 'for (const name of ["inspiration-intelligence", "design-resolver"]) {', 'for (const name of ["inspiration-intelligence", "design-resolver", "aigent-studio"]) {', "Full Studio dependency assertion");
  source = replaceRequired(source, 'assert.ok(resolver.registryDependencies.some((dependency) => dependency.endsWith("/vision-critic")), "Design Resolver must install Vision Critic.");', 'assert.ok(resolver.registryDependencies.some((dependency) => dependency.endsWith("/vision-critic")), "Design Resolver must install Vision Critic.");\nconst studio = registry.items.find((item) => item.name === "aigent-studio");\nassert.ok(studio.files.some((entry) => entry.path === "scripts/studio-server.mjs"), "AIgent Studio must install its local server.");\nassert.ok(studio.files.some((entry) => entry.path === "skills/aigent-studio/SKILL.md"), "AIgent Studio must install its operating skill.");', "Studio registry shape");
  source = source.replace('assert.equal(packageJson.version, "0.5.0"', 'assert.equal(packageJson.version, "0.6.0"');
  source = replaceRequired(source, '"smoke", "inspiration:smoke", "capture"]', '"smoke", "inspiration:smoke", "capture", "studio", "studio:check"]', "Studio package scripts");
  source = replaceRequired(source, '  "AIgent Vision", "vision-critic", "vision prepare", "latest.visual-review.json", "Design DNA", "influence ledger",', '  "AIgent Studio", "npm run studio", "aigent-studio",\n  "AIgent Vision", "vision-critic", "vision prepare", "latest.visual-review.json", "Design DNA", "influence ledger",', "Studio README contract");
  source = replaceRequired(source, 'const pages = ["index.html", "templates/modular-scroll-starter/index.html",', 'const pages = ["index.html", "studio/index.html", "templates/modular-scroll-starter/index.html",', "Studio audit page");
  source = source.replace(/AIgent Vision v0\.5\.0\./g, "AIgent Vision and interactive Studio v0.6.0.");
  write(name, source);
}

{
  const name = "scripts/smoke.mjs";
  let source = read(name);
  source = replaceRequired(source, '  "/vault/",\n', '  "/vault/",\n  "/studio/",\n', "Studio smoke page");
  write(name, source);

  const workflowName = ".github/workflows/validate.yml";
  let workflow = read(workflowName);
  workflow = replaceRequired(workflow, '      - run: npm run vision:check\n', '      - run: npm run vision:check\n      - run: npm run studio:check\n', "Studio CI check");
  workflow = replaceRequired(workflow, '          test -f /tmp/aigent-design-install/scripts/vision-review.mjs\n', '          test -f /tmp/aigent-design-install/scripts/vision-review.mjs\n          test -f /tmp/aigent-design-install/studio/index.html\n          test -f /tmp/aigent-design-install/scripts/studio-server.mjs\n          test -f /tmp/aigent-design-install/.claude/skills/aigent-studio/SKILL.md\n', "Studio clean install proof");
  workflow = replaceRequired(workflow, '      - run: npx playwright install chromium\n', '      - run: npx playwright install chromium\n      - run: npm run studio:check -- --browser\n', "Studio browser proof");
  write(workflowName, workflow);
}

{
  const name = "README.md";
  let source = read(name);
  source = source.replaceAll("v0.5.0", "v0.6.0");
  const marker = 'AIgent studies references, synthesizes an original direction, sources or produces the media, builds the surface, measures the browser, sees the rendered result, and repairs the highest shared cause.\n';
  const studioSection = `## AIgent Studio\n\nAIgent Studio is the interactive local UI for building and revising a real site with the repository's design intelligence, references, production systems, Resolve, Vision, and a locally authenticated Claude Code or Codex CLI agent.\n\n\`\`\`bash\nnpm install\nnpm run studio -- --open\n\`\`\`\n\nStudio creates isolated projects, installs a proven starter, writes the durable brief and design contracts, streams agent activity, and previews the actual project at desktop, tablet, and mobile sizes. Credentials stay in the local CLI; the browser never asks for an API key.\n\nInstall Studio into another project:\n\n\`\`\`bash\npnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-studio\nnode scripts/studio-server.mjs --open\n\`\`\`\n\n`;
  source = replaceRequired(source, marker, `${studioSection}${marker}`, "README Studio section");
  write(name, source);

  const changelogName = "CHANGELOG.md";
  let changelog = read(changelogName);
  changelog = replaceRequired(changelog, "# Changelog\n", `# Changelog\n\n## 0.6.0 — AIgent Studio\n\n### Added\n\n- local interactive website builder with live desktop, tablet, and mobile preview\n- project brief, reference, starter, and agent controls in one UI\n- authenticated Claude Code and Codex CLI integration with streamed activity and cancellation\n- persistent Claude Code session per Studio project\n- direct Design Intelligence planning, Inspiration forensics, Resolve, and Vision preparation\n- isolated local project workspaces with bounded paths, request sizes, hidden-file protection, and localhost-only serving\n- installable \`aigent-studio\` registry item and specialist operating skill\n\n### Changed\n\n- package version is now \`0.6.0\`\n- \`full-studio\` now includes the interactive Studio UI\n\n`, "Studio changelog");
  write(changelogName, changelog);

  for (const [docName, heading, body] of [
    ["PRODUCT.md", "## Interactive Studio", "AIgent Studio is the human operating surface for the repository. It joins the brief, references, proven starters, live responsive preview, local design agent, Design Intelligence, Inspiration Intelligence, Resolve, and Vision in one localhost-only UI. It is successful when a user can create a project, direct a real agent, inspect the actual files being edited, and complete the same production and verification contracts available from the terminal."],
    ["DESIGN.md", "## Studio interface", "Studio is an Operate surface. The live preview is the dominant region; the brief and agent room are supporting rails. Controls stay dense, explicit, and keyboard reachable. The UI must not impersonate a canvas editor: it exposes real project state, real agent output, and real browser preview. Mobile stacks the brief, preview, and agent room rather than shrinking three desktop columns."],
    ["SECURITY.md", "## AIgent Studio", "Studio binds to `127.0.0.1` and must not be exposed directly to a public network. It uses the operator's authenticated local Claude Code or Codex CLI; credentials are never requested by or returned to the browser. Project IDs, filesystem boundaries, hidden files, request sizes, JSON content types, and cross-origin writes are constrained. The selected agent can edit project files and run the explicitly configured local tools, so use Studio only in a trusted workspace."],
    ["skills/README.md", "## AIgent Studio", "Use `aigent-studio` when operating the interactive local builder. It routes project creation, brief updates, live preview, Claude Code or Codex execution, Design Intelligence, Inspiration Intelligence, Resolve, and Vision without replacing the specialist skills that own each stage."]
  ]) {
    write(docName, appendOnce(read(docName), heading, `${heading}\n\n${body}`));
  }

  const studioReadme = "studio/README.md";
  let studioDocs = read(studioReadme);
  studioDocs = replaceRequired(studioDocs, '```bash\nnpm run studio\n```\n', 'From this repository:\n\n```bash\nnpm run studio -- --open\n```\n\nAfter installing the `aigent-studio` registry item into another project:\n\n```bash\nnode scripts/studio-server.mjs --open\n```\n', "Studio installed usage");
  write(studioReadme, studioDocs);
}

{
  const name = "index.html";
  let source = read(name);
  source = replaceRequired(source, '<a class="ds-button" data-variant="solid" href="vault/">Open the Design Vault</a>\n          <a class="ds-button" data-variant="quiet" href="README.md">Read the system</a>', '<a class="ds-button" data-variant="solid" href="studio/">Open AIgent Studio</a>\n          <a class="ds-button" data-variant="quiet" href="vault/">Browse the Design Vault</a>', "Root Studio action");
  write(name, source);

  const ignoreName = ".gitignore";
  const ignore = fs.existsSync(file(ignoreName)) ? read(ignoreName) : "";
  write(ignoreName, ignore.split(/\r?\n/).includes(".aigent/studio/projects/") ? ignore : `${ignore.trimEnd()}\n.aigent/studio/projects/\n`);
}

console.log("AIgent Studio release integration complete.");
