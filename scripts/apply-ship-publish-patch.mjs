#!/usr/bin/env node
import fs from "node:fs";

function read(file) { return fs.readFileSync(file, "utf8"); }
function write(file, value) { fs.writeFileSync(file, value); }
function replaceOnce(file, before, after) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`Patch marker not found in ${file}: ${before.slice(0, 120)}`);
  write(file, source.replace(before, after));
}
function appendOnce(file, marker, block) {
  const source = read(file);
  if (source.includes(marker)) return;
  write(file, `${source.trimEnd()}\n\n${block.trim()}\n`);
}
function addUnique(array, value, before = null) {
  if (array.includes(value)) return;
  const index = before ? array.findIndex((item) => item.endsWith(before) || item === before) : -1;
  if (index >= 0) array.splice(index, 0, value); else array.push(value);
}
function addFile(item, file) {
  item.files ||= [];
  const existing = item.files.find((entry) => entry.path === file.path);
  if (existing) Object.assign(existing, file); else item.files.push(file);
}

// package metadata
{
  const file = "package.json";
  const value = JSON.parse(read(file));
  value.version = "1.2.0";
  value.description = "An installable agent-native design studio with a native desktop installer, DOM-backed visual canvas, live coding agents, verified one-click publishing, HyperFrames, Resolve, and Vision.";
  value.scripts.publish = "node scripts/publish-site.mjs";
  value.scripts["publish:check"] = "node scripts/check-publish.mjs";
  value.scripts["studio:check"] = "node --check studio/app.js && node --check studio/publish.js && node --check studio/bridge.js && node scripts/check-studio.mjs";
  for (const keyword of ["deployment", "static-publishing", "netlify", "vercel", "cloudflare-pages", "custom-domain"]) if (!value.keywords.includes(keyword)) value.keywords.push(keyword);
  write(file, `${JSON.stringify(value, null, 2)}\n`);

  const lockFile = "package-lock.json";
  const lock = JSON.parse(read(lockFile));
  lock.version = "1.2.0";
  if (lock.packages?.[""]) lock.packages[""].version = "1.2.0";
  write(lockFile, `${JSON.stringify(lock, null, 2)}\n`);
}

replaceOnce("desktop/lib.mjs", 'export const DESKTOP_VERSION = "1.1.0";', 'export const DESKTOP_VERSION = "1.2.0";');

// Package the publish runtime in native builds.
for (const marker of ["  - studio/**\n  - tokens/**", "  - studio/**\n  - tokens/**"]) {
  const source = read("electron-builder.yml");
  if (source.includes(marker)) write("electron-builder.yml", source.replace(marker, "  - studio/**\n  - publish/**\n  - tokens/**"));
}

// CLI command.
replaceOnce(
  "scripts/cli.mjs",
  `async function studio(args) {\n  const { runStudio } = await import(pathToFileURL(path.join(packageRoot, "scripts/studio-server.mjs")));\n  await runStudio(args);\n}\n`,
  `async function studio(args) {\n  const { runStudio } = await import(pathToFileURL(path.join(packageRoot, "scripts/studio-server.mjs")));\n  await runStudio(args);\n}\n\nasync function publish(args) {\n  const { runPublish } = await import(pathToFileURL(path.join(packageRoot, "scripts/publish-site.mjs")));\n  await runPublish(args);\n}\n`,
);
replaceOnce(
  "scripts/cli.mjs",
  `  vision <prepare|check|finalize> ...\\n  studio [--port 4180] [--root dir] [--open]\\n  doctor`,
  `  vision <prepare|check|finalize> ...\\n  studio [--port 4180] [--root dir] [--open]\\n  publish <export|auth|deploy|rollback|status> ...\\n  doctor`,
);
replaceOnce(
  "scripts/cli.mjs",
  `  } else if (command === "studio") {\n    await studio(args);\n  } else {`,
  `  } else if (command === "studio") {\n    await studio(args);\n  } else if (command === "publish") {\n    await publish(args);\n  } else {`,
);

// Studio backend publish controller.
replaceOnce(
  "scripts/studio-server.mjs",
  `import { fileURLToPath, pathToFileURL } from "node:url";\n`,
  `import { fileURLToPath, pathToFileURL } from "node:url";\nimport { createStudioPublishController } from "./studio-publish.mjs";\n`,
);
replaceOnce(
  "scripts/studio-server.mjs",
  `  const collaborationClients = new Map();\n  const presence = new Map();\n  let server;\n`,
  `  const collaborationClients = new Map();\n  const presence = new Map();\n  let server;\n  const publishController = createStudioPublishController({\n    projectsRoot, projectDirectory, readCanvas, activeOperations, checkpointProject, startProcess, studioNodeSpec,\n    sendJson, readBody, host, getPort: () => server.address().port, previewPath,\n  });\n`,
);
replaceOnce(
  "scripts/studio-server.mjs",
  `        const project = readProject(projectsRoot, id);\n        const task = tasks.get(id);\n        if (!suffix && method === "GET")`,
  `        const project = readProject(projectsRoot, id);\n        const task = tasks.get(id);\n        if (suffix === "/publish" || suffix.startsWith("/publish/")) {\n          const handled = await publishController.handle({ request, response, method, suffix, project });\n          if (handled) return;\n        }\n        if (!suffix && method === "GET")`,
);
replaceOnce("scripts/studio-server.mjs", `sendJson(response, 200, { version: "1.1.0",`, `sendJson(response, 200, { version: "1.2.0",`);

// Studio UI shell.
replaceOnce("studio/index.html", `  <link rel="stylesheet" href="./studio.css">`, `  <link rel="stylesheet" href="./studio.css">\n  <link rel="stylesheet" href="./publish.css">`);
replaceOnce("studio/index.html", `        <b>1.0</b>`, `        <b>1.2</b>`);
replaceOnce(
  "studio/index.html",
  `        <button type="button" data-right-tab="history" aria-selected="false">History</button>`,
  `        <button type="button" data-right-tab="history" aria-selected="false">History</button>\n        <button type="button" data-right-tab="publish" aria-selected="false">Ship</button>`,
);
const publishPanel = `
      <section class="dock-section publish-panel" data-right-panel="publish" hidden>
        <div class="panel-heading compact">
          <div><span class="kicker">Final stage</span><h2>Ship the site.</h2></div>
          <button class="icon-button" id="publish-refresh" type="button" aria-label="Refresh deployment status">↻</button>
        </div>
        <div class="publish-gate" id="publish-gate" data-state="idle"><strong>No project selected.</strong><span>Create or open a project before shipping.</span></div>
        <form id="publish-form" class="publish-form">
          <div class="publish-grid">
            <label><span>Provider</span><select id="publish-provider"><option value="netlify">Netlify</option><option value="vercel">Vercel</option><option value="cloudflare">Cloudflare Pages</option><option value="local">Local export</option></select></label>
            <label><span>Channel</span><select id="publish-mode"><option value="preview">Preview</option><option value="production">Production</option></select></label>
          </div>
          <small id="publish-provider-help">Choose a deployment target.</small>
          <label><span>Site / project name</span><input id="publish-site-name" autocomplete="off" placeholder="northstar-robotics" required></label>
          <label><span>Custom domain <em>optional</em></span><input id="publish-domain" autocomplete="off" placeholder="www.example.com"><small id="publish-domain-help">Provider ownership and DNS rules still apply.</small></label>
          <fieldset class="publish-options"><legend>Completion gates</legend><label><input id="publish-verify" type="checkbox" checked> Run Resolve before and after deployment</label><label><input id="publish-vision" type="checkbox"> Prepare live Vision review captures</label></fieldset>
          <div class="publish-actions"><button class="quiet-button" id="publish-auth" type="button">Connect provider</button><button class="quiet-button" id="publish-export" type="button">Export only</button><button class="primary-button" id="publish-submit" type="submit">Publish site</button></div>
        </form>
        <section class="publish-result" id="publish-result" hidden><header><strong>Latest result</strong><span id="publish-result-status"></span></header><a id="publish-result-url" target="_blank" rel="noopener"></a><footer><a id="publish-dashboard" target="_blank" rel="noopener">Provider dashboard</a></footer></section>
        <div class="publish-log" id="publish-log" role="log" aria-live="polite"><div class="publish-log-entry system">Ship publishes the exact checkpointed source—not a screenshot or disconnected export.</div></div>
        <div class="subsection-heading"><strong>Deployment history</strong><span>Local record</span></div>
        <div class="publish-history" id="publish-history"><small>No deployments yet.</small></div>
      </section>
`;
replaceOnce("studio/index.html", `      </section>\n    </aside>\n  </div>\n\n  <dialog id="project-dialog">`, `      </section>\n${publishPanel}    </aside>\n  </div>\n\n  <dialog id="project-dialog">`);

// Studio browser controller.
replaceOnce("studio/app.js", `const $ = (selector, root = document) => root.querySelector(selector);`, `import { initPublishPanel, publishTaskEvent, refreshPublishPanel, syncPublishGate } from "./publish.js";\n\nconst $ = (selector, root = document) => root.querySelector(selector);`);
replaceOnce(
  "studio/app.js",
  `  if (tab === "history") refreshDiff().catch(() => {});\n}`,
  `  if (tab === "history") refreshDiff().catch(() => {});\n  if (tab === "publish") refreshPublishPanel().catch(() => {});\n}`,
);
replaceOnce(
  "studio/app.js",
  `  state.canvas = await api(\`/api/projects/\${state.project.id}/canvas\`);\n  renderCanvasState();\n}`,
  `  state.canvas = await api(\`/api/projects/\${state.project.id}/canvas\`);\n  renderCanvasState();\n  syncPublishGate();\n}`,
);
replaceOnce(
  "studio/app.js",
  `  connectTaskEvents();\n  connectCollaboration();\n  setRunning(Boolean(task?.running), task?.running ? task.kind : providerSummary(state.status));`,
  `  connectTaskEvents();\n  connectCollaboration();\n  await refreshPublishPanel();\n  setRunning(Boolean(task?.running), task?.running ? task.kind : providerSummary(state.status));`,
);
replaceOnce(
  "studio/app.js",
  `    const message = JSON.parse(event.data);\n    if (message.type === "connected") return;`,
  `    const message = JSON.parse(event.data);\n    publishTaskEvent(message);\n    if (message.type === "connected") return;`,
);
replaceOnce(
  "studio/app.js",
  `  renderCheckpoints();\n}`,
  `  renderCheckpoints();\n  syncPublishGate();\n}`,
);
replaceOnce(
  "studio/app.js",
  `async function initialize() {\n  try {`,
  `async function initialize() {\n  initPublishPanel({\n    api, toast, setRightTab, setRunning,\n    getProject: () => state.project,\n    getCanvas: () => state.canvas,\n    getAuthor: () => state.client,\n  });\n  try {`,
);

// Registry item and Studio dependency.
{
  const file = "registry.json";
  const registry = JSON.parse(read(file));
  if (!registry.items.some((item) => item.name === "publish-site")) {
    const studioIndex = registry.items.findIndex((item) => item.name === "aigent-studio");
    const item = {
      name: "publish-site",
      type: "registry:item",
      title: "AIgent Ship and Publish",
      description: "Install constrained static export, Netlify/Vercel/Cloudflare adapters, deployment history, live Resolve verification, domain guidance, and the publish-site skill.",
      files: [
        { path: "publish/README.md", type: "registry:file", target: "~/publish/README.md" },
        { path: "publish/providers.json", type: "registry:file", target: "~/publish/providers.json" },
        { path: "publish/lib.mjs", type: "registry:file", target: "~/publish/lib.mjs" },
        { path: "scripts/publish-site.mjs", type: "registry:file", target: "~/scripts/publish-site.mjs" },
        { path: "scripts/check-publish.mjs", type: "registry:file", target: "~/scripts/check-publish.mjs" },
        { path: "skills/publish-site/SKILL.md", type: "registry:file", target: "~/.claude/skills/publish-site/SKILL.md" },
      ],
    };
    registry.items.splice(studioIndex >= 0 ? studioIndex : registry.items.length, 0, item);
  }
  const studio = registry.items.find((item) => item.name === "aigent-studio");
  addUnique(studio.registryDependencies, "wrg32786/aigent-design-system/publish-site", "design-resolver");
  addFile(studio, { path: "studio/publish.js", type: "registry:file", target: "~/studio/publish.js" });
  addFile(studio, { path: "studio/publish.css", type: "registry:file", target: "~/studio/publish.css" });
  addFile(studio, { path: "scripts/studio-publish.mjs", type: "registry:file", target: "~/scripts/studio-publish.mjs" });
  studio.description = "Install the DOM-backed visual website canvas with direct responsive editing, collaboration, live coding agents, checkpoints, and verified one-click publishing.";
  const full = registry.items.find((item) => item.name === "full-studio");
  addUnique(full.registryDependencies, "wrg32786/aigent-design-system/publish-site", "aigent-studio");
  full.description = "Install the complete flagship system: DOM-backed Studio, inspiration intelligence, immersive production, collaboration, Ship and Publish, Resolve, Vision, QA, Design Vault, and case studies.";
  write(file, `${JSON.stringify(registry, null, 2)}\n`);
}

// Repository contract.
replaceOnce(
  "scripts/check.mjs",
  `  "integrations/README.md", "integrations/catalog.json", "recipes/README.md",`,
  `  "integrations/README.md", "integrations/catalog.json", "recipes/README.md",\n  "publish/README.md", "publish/providers.json", "publish/lib.mjs",`,
);
replaceOnce(
  "scripts/check.mjs",
  `  "scripts/studio-server.mjs", "scripts/check-studio.mjs", "skills/aigent-studio/SKILL.md",`,
  `  "scripts/studio-server.mjs", "scripts/studio-publish.mjs", "scripts/check-studio.mjs", "skills/aigent-studio/SKILL.md",\n  "scripts/publish-site.mjs", "scripts/check-publish.mjs", "skills/publish-site/SKILL.md",`,
);
replaceOnce("scripts/check.mjs", `assert.ok(skillFiles.length >= 24, \`Expected at least 23 installable skills; found \${skillFiles.length}.\`);`, `assert.ok(skillFiles.length >= 26, \`Expected at least 26 installable skills; found \${skillFiles.length}.\`);`);
replaceOnce(
  "scripts/check.mjs",
  `"design-resolver", "visual-design-critic"]`,
  `"design-resolver", "visual-design-critic", "publish-site"]`,
);
replaceOnce("scripts/check.mjs", `assert.ok(registry.items.length >= 16, "Installable registry is unexpectedly small.");`, `assert.ok(registry.items.length >= 17, "Installable registry is unexpectedly small.");`);
replaceOnce(
  "scripts/check.mjs",
  `for (const name of ["inspiration-intelligence", "design-resolver", "vision-critic", "aigent-studio"])`,
  `for (const name of ["inspiration-intelligence", "design-resolver", "vision-critic", "publish-site", "aigent-studio"])`,
);
replaceOnce(
  "scripts/check.mjs",
  `for (const name of ["inspiration-intelligence", "design-resolver", "aigent-studio"])`,
  `for (const name of ["inspiration-intelligence", "design-resolver", "publish-site", "aigent-studio"])`,
);
replaceOnce("scripts/check.mjs", `assert.ok(integrationCatalog.integrations.length >= 8,`, `assert.ok(integrationCatalog.integrations.length >= 9,`);
replaceOnce("scripts/check.mjs", `assert.equal(packageJson.version, "1.1.0", "Expected package version 1.1.0.");`, `assert.equal(packageJson.version, "1.2.0", "Expected package version 1.2.0.");`);
replaceOnce(
  "scripts/check.mjs",
  `"capture", "studio", "studio:check", "desktop:start", "desktop:check"]`,
  `"capture", "studio", "studio:check", "publish", "publish:check", "desktop:start", "desktop:check"]`,
);
replaceOnce(
  "scripts/check.mjs",
  `"AIgent Studio", "AIgent Desktop", "Windows installer", "macOS", "npm run studio", "aigent-studio", "DOM-backed visual website canvas", "Canvas patch journal",`,
  `"AIgent Studio", "AIgent Desktop", "Windows installer", "macOS", "npm run studio", "aigent-studio", "DOM-backed visual website canvas", "Canvas patch journal", "Ship the site", "publish-site",`,
);
replaceOnce(
  "scripts/check.mjs",
  `DOM-backed collaborative Studio v1.1.0 and AIgent Desktop.`,
  `DOM-backed collaborative Studio v1.2.0, AIgent Ship, and AIgent Desktop.`,
);

// Studio check includes the publish gate and endpoint.
replaceOnce("scripts/check-studio.mjs", `assert.equal(status.version, "1.1.0");`, `assert.equal(status.version, "1.2.0");`);
replaceOnce(
  "scripts/check-studio.mjs",
  `  assert.equal(operation.canvas.canUndo, true);\n`,
  `  assert.equal(operation.canvas.canUndo, true);\n  const publishState = await fetch(\`${base}/api/projects/\${project.id}/publish\`).then((response) => response.json());\n  assert.equal(publishState.blockedByCanvas, true);\n  assert.ok(publishState.providers.some((provider) => provider.id === "local" && provider.available));\n  const blockedExport = await fetch(\`${base}/api/projects/\${project.id}/publish/export\`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });\n  assert.equal(blockedExport.status, 409);\n`,
);
replaceOnce(
  "scripts/check-studio.mjs",
  `        assert.ok((await page.locator("#layers-tree .layer-row").count()) >= 3);\n`,
  `        assert.ok((await page.locator("#layers-tree .layer-row").count()) >= 3);\n        await page.locator('[data-right-tab="publish"]').click();\n        await page.waitForFunction(() => document.querySelector('[data-right-panel="publish"]')?.hidden === false);\n        assert.match((await page.locator("#publish-gate").textContent()) || "", /Publish blocked|Ready to ship/);\n`,
);
replaceOnce(
  "scripts/check-studio.mjs",
  `AIgent Studio v1 check passed: project, DOM bridge, Canvas operations, undo/redo, comments, components, presence, checkpoints, agent context, path boundaries`,
  `AIgent Studio v1.2 check passed: project, DOM bridge, Canvas operations, undo/redo, comments, components, presence, checkpoints, agent context, Ship gate, path boundaries`,
);

// README and release notes.
replaceOnce("README.md", `releases/tag/v1.1.0`, `releases/tag/v1.2.0`);
const shipReadme = `
## Ship the site

AIgent Studio now closes the final gap from approved Canvas to a live URL. Open the **Ship** tab to:

```text
DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

The built-in publisher creates a constrained public bundle, blocks unresolved Canvas patches, checkpoints the source, and deploys through **Netlify, Vercel, Cloudflare Pages, or a local export**. Production mode can run Resolve before and after deployment, prepare live Vision captures, record custom-domain follow-up, and redeploy an earlier exact artifact.

```bash
node scripts/publish-site.mjs deploy \\
  --provider netlify \\
  --mode preview \\
  --project-dir . \\
  --entry /index.html \\
  --site my-site
```

Install the standalone production contract with:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/publish-site
```

Provider authentication stays in the official CLI/browser flow; Studio never asks for hosting tokens or secret environment-variable values. See [`publish/README.md`](publish/README.md).
`;
replaceOnce("README.md", `## AIgent Studio 1.0`, `${shipReadme}\n## AIgent Studio 1.0`);
replaceOnce("README.md", `| Installable registry items | **16** |`, `| Installable registry items | **17** |`);
replaceOnce("README.md", `| Agent skills | **25** |`, `| Agent skills | **26** |`);
replaceOnce("README.md", `npm run desktop:check`, `npm run desktop:check\nnpm run publish:check`);

const changelog = `## 1.2.0 — AIgent Ship\n\n### Added\n\n- Studio Ship panel for local export, Netlify, Vercel, and Cloudflare Pages\n- constrained dependency-traversing static exporter with private-file and credential guards\n- pre-publish Git checkpoint and Canvas-journal gate\n- optional preflight and live AIgent Resolve verification\n- optional live AIgent Vision capture preparation\n- local deployment history and exact-artifact redeploy\n- Vercel domain aliasing plus Netlify and Cloudflare domain follow-up\n- publish-site skill, provider catalog, CLI, self-check, and registry item\n\n### Changed\n\n- package and desktop version are now \`1.2.0\`\n- complete Studio installs now include the Ship and Publish system\n\n`;
replaceOnce("CHANGELOG.md", `# Changelog\n\n`, `# Changelog\n\n${changelog}`);
appendOnce("PRODUCT.md", "## Ship and Publish product contract", `## Ship and Publish product contract\n\nAIgent Ship is the final operator surface from approved Studio project to a live URL. It publishes the actual checkpointed source, never a screenshot or disconnected mockup. Canvas operations must be distilled or cleared before shipping. The exporter follows referenced public dependencies and excludes project-control, agent, QA, credential, and private working files.\n\nPreview and production deployments use allowlisted official CLIs for Netlify, Vercel, and Cloudflare Pages, with a local-export fallback. Production can require pre-deploy and live Resolve, prepare Vision captures, record domain follow-up, and redeploy an earlier immutable artifact. Provider credentials remain in the official CLI credential store.`);
appendOnce("DESIGN.md", "## Ship panel design contract", `## Ship panel design contract\n\nShip is a calm final-stage Operate surface. It shows one gate, one provider decision, one channel decision, one optional domain, and explicit completion checks. Deployment history must expose the real URL, provider, commit, QA result, and exact-artifact redeploy without presenting hosting complexity as visual decoration. A blocked Canvas journal is visible before the publish button, not after an avoidable failure.`);
appendOnce("SECURITY.md", "## Deployment and hosting credentials", `## Deployment and hosting credentials\n\nAIgent Studio never accepts provider tokens or secret environment-variable values in the browser. Netlify, Vercel, and Cloudflare authentication run through their official CLI/browser flows. Publish routes accept only allowlisted providers and validated site, mode, domain, and deployment identifiers. The static exporter blocks project-control directories, credential files, private keys, and credential-shaped public content. Local deployment records contain URLs, IDs, commits, output paths, and QA status—not provider credentials.`);
appendOnce("studio/README.md", "## Ship and Publish", `## Ship and Publish\n\nThe Ship tab turns the selected project into a constrained public export, creates a Git checkpoint, runs optional preflight Resolve, deploys through Netlify, Vercel, Cloudflare Pages, or local export, verifies the live URL, and records deployment history. Active Canvas patches block publish until they are distilled or deliberately cleared. See \`publish/README.md\`.`);
replaceOnce(
  "skills/README.md",
  `| \`aigent-studio\` | DOM-backed Canvas, comments, components, checkpoints, agent handoff, and live project operation |`,
  `| \`aigent-studio\` | DOM-backed Canvas, comments, components, checkpoints, agent handoff, and live project operation |\n| \`publish-site\` | constrained export, provider deploys, domains, live QA, and exact-artifact redeploy |`,
);
appendOnce("docs/roadmap.md", "## Shipped: one-click publishing", `## Shipped: one-click publishing\n\nAIgent Studio now includes a final Ship stage with constrained static export, Netlify/Vercel/Cloudflare Pages adapters, local export, pre-publish checkpointing, Resolve verification, Vision preparation, deployment history, domain follow-up, and exact-artifact redeploy.`);

// Ignore local deployment state.
appendOnce(".gitignore", ".aigent/publish/", `.aigent/publish/`);

fs.rmSync("scripts/apply-ship-publish-patch.mjs");
console.log("Applied AIgent Ship and Publish integration patch.");
