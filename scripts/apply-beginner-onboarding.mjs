#!/usr/bin/env node
import fs from "node:fs";

function read(file) { return fs.readFileSync(file, "utf8"); }
function write(file, value) { fs.writeFileSync(file, value); }
function replaceOnce(file, before, after) {
  const source = read(file);
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Missing onboarding marker in ${file}: ${before.slice(0, 120)}`);
  write(file, source.replace(before, after));
}
function appendOnce(file, marker, value) {
  const source = read(file);
  if (!source.includes(marker)) write(file, `${source.trimEnd()}\n${value}\n`);
}

// Finish the Ship implementation that was already present on this branch.
replaceOnce(
  "publish/lib.mjs",
  `const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".svg", ".xml", ".txt", ".webmanifest"]);\nconst PUBLIC_ROOT_FILES = ["robots.txt", "favicon.ico", "favicon.svg", "site.webmanifest", "manifest.webmanifest", "_headers", "_redirects"];`,
  `const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".jsonc", ".toml", ".svg", ".xml", ".txt", ".webmanifest"]);\nconst PUBLIC_ROOT_FILES = ["robots.txt", "favicon.ico", "favicon.svg", "site.webmanifest", "manifest.webmanifest", "404.html", "sitemap.xml", "browserconfig.xml", "vercel.json", "netlify.toml", "wrangler.toml", "wrangler.json", "wrangler.jsonc", "_headers", "_redirects"];`,
);
replaceOnce(
  "publish/lib.mjs",
  `  if ([".js", ".mjs", ".cjs"].includes(extension)) {`,
  `  if ([".js", ".mjs", ".cjs", ".html", ".htm", ".svg"].includes(extension)) {`,
);
replaceOnce(
  "publish/lib.mjs",
  `    for (const match of source.matchAll(/new\\s+URL\\(\\s*["']([^"']+)["']\\s*,\\s*import\\.meta\\.url\\s*\\)/g)) values.push(match[1]);`,
  `    for (const match of source.matchAll(/new\\s+URL\\(\\s*["']([^"']+)["']\\s*,\\s*import\\.meta\\.url\\s*\\)/g)) values.push(match[1]);\n    for (const match of source.matchAll(/(?:fetch|new\\s+(?:Worker|SharedWorker|Audio))\\(\\s*["']([^"']+)["']/g)) values.push(match[1]);`,
);
replaceOnce(
  "publish/lib.mjs",
  `    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;`,
  `    if (fs.existsSync(candidate) && !fs.lstatSync(candidate).isSymbolicLink() && fs.statSync(candidate).isFile()) return candidate;`,
);
replaceOnce(
  "publish/lib.mjs",
  `  if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) throw new Error(\`Publish entry does not exist: \${entryValue}\`);\n  if (blockedRelative(path.relative(projectDirectory, entryFile))) throw new Error("Publish entry is inside a private project directory.");`,
  `  if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) throw new Error(\`Publish entry does not exist: \${entryValue}\`);\n  if (fs.lstatSync(entryFile).isSymbolicLink()) throw new Error("Publish entry cannot be a symbolic link.");\n  if (blockedRelative(path.relative(projectDirectory, entryFile))) throw new Error("Publish entry is inside a private project directory.");`,
);
replaceOnce(
  "publish/lib.mjs",
  `    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;\n    visited.add(file);`,
  `    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) continue;\n    visited.add(file);`,
);
replaceOnce(
  "publish/lib.mjs",
  `{ label: \`Deploy \${mode} to Vercel\`, command: npx, args: ["--yes", "vercel@latest", "deploy", "--cwd", directory, "--yes", ...(mode === "production" ? ["--prod"] : [])] }`,
  `{ label: \`Deploy \${mode} to Vercel\`, command: npx, args: ["--yes", "vercel@latest", "deploy", "--cwd", directory, "--yes", ...(mode === "production" ? ["--prod"] : ["--target", "preview"])] }`,
);
replaceOnce(
  "scripts/publish-site.mjs",
  `      const result = await runCommand(step, { cwd: projectDirectory });`,
  `      const result = await runCommand(step, { cwd: outputDirectory });`,
);
replaceOnce(
  "scripts/publish-site.mjs",
  `      await runCommand(alias, { cwd: projectDirectory });`,
  `      await runCommand(alias, { cwd: outputDirectory });`,
);
appendOnce(".gitignore", ".netlify/", `.netlify/\n.vercel/\n.wrangler/`);

// Ensure the primary registry installs its publish reference.
{
  const file = "registry.json";
  const registry = JSON.parse(read(file));
  const item = registry.items.find((entry) => entry.name === "aigent-design-skill");
  if (!item) throw new Error("aigent-design-skill registry item is missing");
  if (!item.files.some((entry) => entry.path === "skills/aigent-design/reference/publish.md")) {
    const index = item.files.findIndex((entry) => entry.path === "skills/aigent-design/reference/canvas.md");
    item.files.splice(index >= 0 ? index + 1 : item.files.length, 0, {
      path: "skills/aigent-design/reference/publish.md",
      type: "registry:file",
      target: "~/.claude/skills/aigent-design/reference/publish.md"
    });
  }
  write(file, `${JSON.stringify(registry, null, 2)}\n`);
}

// Use current official agent installers rather than requiring npm for normal Desktop onboarding.
replaceOnce(
  "desktop/lib.mjs",
  `  codex: "https://github.com/openai/codex",\n  support: "https://github.com/wrg32786/aigent-design-system/issues",`,
  `  codex: "https://github.com/openai/codex",\n  vercel: "https://vercel.com/signup",\n  windowsGuide: "https://github.com/wrg32786/aigent-design-system/blob/master/docs/GETTING_STARTED_WINDOWS.md",\n  support: "https://github.com/wrg32786/aigent-design-system/issues",`,
);
replaceOnce("desktop/lib.mjs", `    preferredAgent: "manual",`, `    preferredAgent: "claude",`);
replaceOnce(
  "desktop/lib.mjs",
  `export function installCommand(provider, environment) {\n  if (!environment?.npm?.available) return null;\n  if (provider === "claude") return { command: environment.npm.command, args: ["install", "-g", "@anthropic-ai/claude-code"], label: "Install Claude Code" };\n  if (provider === "codex") return { command: environment.npm.command, args: ["install", "-g", "@openai/codex"], label: "Install Codex CLI" };\n  return null;\n}\n`,
  `export function systemInstallCommand(tool, environment = {}) {\n  if (tool !== "git") return null;\n  const env = desktopEnvironment();\n  if (process.platform === "win32") {\n    const winget = resolveCommand("winget.exe", "", env) || resolveCommand("winget", "", env);\n    return winget ? { command: winget, args: ["install", "--id", "Git.Git", "-e", "--accept-source-agreements", "--accept-package-agreements", "--silent"], label: "Install Git for Windows" } : null;\n  }\n  if (process.platform === "darwin") {\n    const brew = resolveCommand("brew", "", env);\n    return brew ? { command: brew, args: ["install", "git"], label: "Install Git" } : null;\n  }\n  return null;\n}\n\nexport function installCommand(provider, environment = {}) {\n  const env = desktopEnvironment();\n  if (provider === "claude") {\n    if (process.platform === "win32") {\n      const winget = resolveCommand("winget.exe", "", env) || resolveCommand("winget", "", env);\n      if (winget) return { command: winget, args: ["install", "--id", "Anthropic.ClaudeCode", "-e", "--accept-source-agreements", "--accept-package-agreements", "--silent"], label: "Install Claude Code" };\n      const powershell = resolveCommand("powershell.exe", "", env) || resolveCommand("powershell", "", env);\n      return powershell ? { command: powershell, args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "irm https://claude.ai/install.ps1 | iex"], label: "Install Claude Code" } : null;\n    }\n    if (process.platform === "darwin") {\n      const brew = resolveCommand("brew", "", env);\n      if (brew) return { command: brew, args: ["install", "--cask", "claude-code"], label: "Install Claude Code" };\n    }\n    const shell = resolveCommand("bash", "", env) || resolveCommand("sh", "", env);\n    return shell ? { command: shell, args: ["-lc", "curl -fsSL https://claude.ai/install.sh | bash"], label: "Install Claude Code" } : null;\n  }\n  if (provider === "codex") {\n    if (process.platform === "win32") {\n      const powershell = resolveCommand("powershell.exe", "", env) || resolveCommand("powershell", "", env);\n      return powershell ? { command: powershell, args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "irm https://chatgpt.com/codex/install.ps1 | iex"], label: "Install Codex" } : null;\n    }\n    if (process.platform === "darwin") {\n      const brew = resolveCommand("brew", "", env);\n      if (brew) return { command: brew, args: ["install", "--cask", "codex"], label: "Install Codex" };\n    }\n    const shell = resolveCommand("bash", "", env) || resolveCommand("sh", "", env);\n    return shell ? { command: shell, args: ["-lc", "curl -fsSL https://chatgpt.com/codex/install.sh | sh"], label: "Install Codex" } : null;\n  }\n  return null;\n}\n`,
);

// Main-process one-click system setup.
replaceOnce(
  "desktop/main.mjs",
  `  installCommand,\n  normalizeConfig,`,
  `  installCommand,\n  systemInstallCommand,\n  normalizeConfig,`,
);
replaceOnce(
  "desktop/main.mjs",
  `    const child = spawn(spec.command, spec.args, { env: desktopEnvironment(), windowsHide: true, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });`,
  `    const child = spawn(spec.command, spec.args, { env: desktopEnvironment(), windowsHide: true, shell: process.platform === "win32" && /\\.cmd$/i.test(spec.command), stdio: ["ignore", "pipe", "pipe"] });`,
);
replaceOnce(
  "desktop/main.mjs",
  `function setupUpdater() {`,
  `function streamSystemInstall(tool) {\n  if (activeInstaller) throw new Error("An installation is already running.");\n  environment = refreshEnvironment();\n  const spec = systemInstallCommand(tool, environment);\n  if (!spec) throw new Error("Automatic installation is not available on this computer. Use the Get Git link instead.");\n  safeSend("desktop:install", { provider: \`system-\${tool}\`, state: "start", message: spec.label });\n  log("System tool installation started", { tool, command: spec.command });\n  return new Promise((resolve, reject) => {\n    const child = spawn(spec.command, spec.args, { env: desktopEnvironment(), windowsHide: true, shell: process.platform === "win32" && /\\.cmd$/i.test(spec.command), stdio: ["ignore", "pipe", "pipe"] });\n    activeInstaller = child;\n    for (const [stream, channel] of [[child.stdout, "stdout"], [child.stderr, "stderr"]]) {\n      stream.setEncoding("utf8");\n      stream.on("data", (chunk) => safeSend("desktop:install", { provider: \`system-\${tool}\`, state: "log", channel, message: String(chunk).slice(-12000) }));\n    }\n    child.on("error", (error) => {\n      activeInstaller = null;\n      safeSend("desktop:install", { provider: \`system-\${tool}\`, state: "error", message: error.message });\n      reject(error);\n    });\n    child.on("exit", async (code) => {\n      activeInstaller = null;\n      environment = refreshEnvironment();\n      if (studio) await stopStudio();\n      const payload = { provider: \`system-\${tool}\`, state: code === 0 ? "done" : "error", code, message: code === 0 ? \`\${spec.label} complete.\` : \`\${spec.label} exited with code \${code}.\` };\n      safeSend("desktop:install", payload);\n      if (code === 0) resolve({ environment }); else reject(new Error(payload.message));\n    });\n  });\n}\n\nfunction setupUpdater() {`,
);
replaceOnce(
  "desktop/main.mjs",
  `    "desktop:install-agent": async (_event, provider) => streamInstall(provider),\n    "desktop:authenticate-agent":`,
  `    "desktop:install-agent": async (_event, provider) => streamInstall(provider),\n    "desktop:install-system-tool": async (_event, tool) => streamSystemInstall(tool),\n    "desktop:authenticate-agent":`,
);

replaceOnce(
  "desktop/preload.cjs",
  `  installAgent: (provider) => ipcRenderer.invoke("desktop:install-agent", provider),\n  authenticateAgent:`,
  `  installAgent: (provider) => ipcRenderer.invoke("desktop:install-agent", provider),\n  installSystemTool: (tool) => ipcRenderer.invoke("desktop:install-system-tool", tool),\n  authenticateAgent:`,
);

// Beginner-first setup copy and controls.
replaceOnce(
  "desktop/renderer/index.html",
  `<h1>From download to live canvas.</h1>\n        <p>Configure the workspace, connect a coding agent, and launch the complete AIgent design studio without touching the terminal.</p>`,
  `<h1>Install. Connect. Create.</h1>\n        <p>AIgent handles the technical setup. Choose a folder, connect your AI account, and start building without typing installation commands.</p>`,
);
replaceOnce("desktop/renderer/index.html", `<strong>System check</strong><small>Verify required tools</small>`, `<strong>Ready check</strong><small>Install anything missing</small>`);
replaceOnce("desktop/renderer/index.html", `<strong>Design agent</strong><small>Install and authenticate</small>`, `<strong>Connect AI</strong><small>Use your existing account</small>`);
replaceOnce("desktop/renderer/index.html", `<strong>Preferences</strong><small>Updates and startup</small>`, `<strong>How it works</strong><small>Local first, publish later</small>`);
replaceOnce("desktop/renderer/index.html", `<strong>Launch</strong><small>Open AIgent Studio</small>`, `<strong>Create</strong><small>Build your first project</small>`);
replaceOnce(
  "desktop/renderer/index.html",
  `<h2>Verify the production stack.</h2>\n        <p class="lede">The desktop app includes its own runtime. Git enables checkpoints; Node and npm are needed only to install coding-agent CLIs.</p>`,
  `<h2>Check what AIgent needs.</h2>\n        <p class="lede">AIgent itself is already included. Git adds safe project checkpoints and is required by Claude Code on native Windows. Install it here if it is missing.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<div class="inline-actions"><button class="secondary-button" id="refresh-environment" type="button">Run checks again</button><button class="text-button" id="get-node" type="button">Get Node.js</button><button class="text-button" id="get-git" type="button">Get Git</button></div>`,
  `<div class="inline-actions"><button class="primary-button" id="install-git" type="button">Install Git for me</button><button class="secondary-button" id="refresh-environment" type="button">Run checks again</button><button class="text-button" id="get-git" type="button">Open Git download</button></div>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<h2>Connect the agent that builds with you.</h2>\n        <p class="lede">Choose Claude Code, Codex, both, or manual prompt mode. Installation and sign-in happen through the official local tools.</p>`,
  `<h2>Connect the AI that builds with you.</h2>\n        <p class="lede">Choose Claude Code, Codex, or manual mode. Click Install for me, then Connect account. Follow the sign-in window—there are no install commands to type.</p>`,
);
replaceOnce("desktop/renderer/index.html", `type="button">Install</button><button class="secondary-button" data-auth-agent="claude" type="button">Sign in</button>`, `type="button">Install for me</button><button class="secondary-button" data-auth-agent="claude" type="button">Connect account</button>`);
replaceOnce("desktop/renderer/index.html", `type="button">Install</button><button class="secondary-button" data-auth-agent="codex" type="button">Sign in</button>`, `type="button">Install for me</button><button class="secondary-button" data-auth-agent="codex" type="button">Connect account</button>`);
replaceOnce(
  "desktop/renderer/index.html",
  `<h2>Set the desktop behavior.</h2>\n        <p class="lede">These settings can be changed later from Setup & Diagnostics.</p>`,
  `<h2>Build locally first. Publish when ready.</h2>\n        <p class="lede">You can create and preview complete sites on this computer without a hosting account. Later, Studio can connect a free Vercel, Netlify, or Cloudflare account from the Ship tab.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<div class="security-note"><strong>Security boundary</strong><p>The desktop shell uses context isolation, sandboxed rendering, constrained IPC, localhost-only Studio serving, and no generic shell endpoint.</p></div>`,
  `<div class="security-note"><strong>Free hosting is optional</strong><p>Start locally. When you need a public URL, create a free provider account and connect it through Ship.</p><button class="secondary-button" id="open-vercel" type="button">See Vercel free hosting</button></div>\n        <div class="security-note"><strong>Your accounts stay official</strong><p>AI and hosting sign-in use the provider's own browser or local tool. AIgent does not ask you to paste account tokens into the app.</p></div>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<h2>Your design studio is ready.</h2>\n        <p class="lede">Create a site from a proven starter, select real rendered elements, edit visually, direct the agent, and finish with Resolve and Vision.</p>`,
  `<h2>Create your first site.</h2>\n        <p class="lede">Click launch, choose New, pick a starter, describe what you want, and let the agent build in the live preview. Edit any visible element in Design mode, then use Ship when you want a public link.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<div class="ready-card"><div class="ready-orbit" aria-hidden="true"><span></span></div><div><small>Workspace</small><strong id="ready-workspace"></strong><small>Preferred agent</small><strong id="ready-agent"></strong></div></div>\n        <button class="launch-button" id="launch-studio" type="button"><span>Launch AIgent Studio</span><small>Open the real DOM-backed visual canvas</small></button>`,
  `<div class="ready-card"><div class="ready-orbit" aria-hidden="true"><span></span></div><div><small>Workspace</small><strong id="ready-workspace"></strong><small>Preferred agent</small><strong id="ready-agent"></strong></div></div>\n        <div class="assurance-grid"><article><span>01</span><strong>Create</strong><p>Choose New and describe the site or deck.</p></article><article><span>02</span><strong>Design</strong><p>Click the live page to edit text, layout, and mobile.</p></article><article><span>03</span><strong>Ship</strong><p>Export locally or publish a verified public URL.</p></article></div>\n        <button class="launch-button" id="launch-studio" type="button"><span>Launch Studio and create my first project</span><small>No terminal required</small></button>`,
);

replaceOnce(
  "desktop/renderer/app.js",
  `    statusCard("Git", environment.git, "Optional, enables local checkpoints"),\n    statusCard("Node.js", environment.node, "Needed to install agent CLIs"),\n    statusCard("npm", environment.npm, "Needed to install agent CLIs"),\n    statusCard("Git Bash", { available: environment.platform?.platform !== "win32" || Boolean(environment.gitBash), version: environment.gitBash || "Not required on this platform" }, "Required by Claude Code on native Windows"),`,
  `    statusCard("Git", environment.git, "Recommended for checkpoints; required by Claude Code on Windows"),\n    statusCard("Claude Code", environment.claude, "Install from the next step if you use Claude"),\n    statusCard("Codex", environment.codex, "Install from the next step if you use ChatGPT or Codex"),\n    statusCard("Local preview", { available: true, version: "No hosting account required" }, "Build locally first"),`,
);
replaceOnce("desktop/renderer/app.js", `    install.disabled = state.installing || !environment.npm?.available;`, `    install.disabled = state.installing;`);
replaceOnce("desktop/renderer/app.js", `    install.textContent = info?.available ? "Reinstall" : "Install";`, `    install.textContent = info?.available ? "Reinstall" : "Install for me";`);
replaceOnce(
  "desktop/renderer/app.js",
  `async function installAgent(provider) {\n  state.installing = true;`,
  `async function installAgent(provider) {\n  if (provider === "claude" && currentEnvironment().platform?.platform === "win32" && !currentEnvironment().git?.available) {\n    showError("Install Git first so Claude Code can run on Windows.");\n    state.step = 2;\n    render();\n    return;\n  }\n  state.installing = true;`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `async function authenticateAgent(provider) {\n  try {\n    await desktop.authenticateAgent(provider);\n    setStatus(\`${providerLabel(provider)} sign-in opened in your terminal.\`);\n  } catch (error) { showError(error.message); }\n}\n`,
  `async function authenticateAgent(provider) {\n  try {\n    await desktop.authenticateAgent(provider);\n    setStatus(\`${providerLabel(provider)} sign-in opened. Follow the prompts and browser login; no install commands are required.\`);\n  } catch (error) { showError(error.message); }\n}\n\nasync function installSystemTool(tool) {\n  state.installing = true;\n  $("#install-console").hidden = false;\n  renderAgents();\n  try {\n    await desktop.installSystemTool(tool);\n    await refreshEnvironment();\n  } catch (error) { showError(error.message); }\n  finally { state.installing = false; renderAgents(); }\n}\n`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `  $("#get-node").addEventListener("click", () => desktop.openLink("node"));\n  $("#get-git").addEventListener("click", () => desktop.openLink("git"));`,
  `  $("#install-git").addEventListener("click", () => installSystemTool("git"));\n  $("#get-git").addEventListener("click", () => desktop.openLink("git"));\n  $("#open-vercel").addEventListener("click", () => desktop.openLink("vercel"));`,
);

// Validation follows the user-facing contract.
replaceOnce(
  "scripts/check-desktop.mjs",
  `  installCommand,\n  normalizeConfig,`,
  `  installCommand,\n  systemInstallCommand,\n  normalizeConfig,`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `for (const contract of ["Choose where your sites live", "Verify the production stack", "Connect the agent", "Launch AIgent Studio", "Export diagnostics", "Repair installation"])`,
  `for (const contract of ["Choose where your sites live", "Check what AIgent needs", "Connect the AI", "Launch Studio and create my first project", "Install Git for me", "See Vercel free hosting", "Export diagnostics", "Repair installation"])`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `for (const contract of ["windows-latest", "macos-14", "macos-15-intel", "latest-arm64", "latest-x64", "desktop:smoke:packaged", "WIN_CSC_LINK", "MAC_CSC_LINK", "APPLE_API_KEY", "gh release upload"])`,
  `for (const contract of ["windows-latest", "macos-14", "macos-15-intel", "latest-arm64", "latest-x64", "desktop:smoke:packaged", "WIN_CSC_LINK", "MAC_CSC_LINK", "APPLE_API_KEY", "AIgent-Desktop-Setup-Windows-x64.exe", "AIgent-Desktop-macOS-Apple-Silicon.dmg", "gh release upload"])`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `  assert.equal(installCommand("manual", environment), null);\n  assert.deepEqual(authCommand("codex", { codex: { available: true, command: "codex" } }).args, ["login"]);`,
  `  assert.equal(installCommand("manual", environment), null);\n  assert.equal(systemInstallCommand("unknown", environment), null);\n  assert.deepEqual(authCommand("codex", { codex: { available: true, command: "codex" } }).args, ["login"]);`,
);

// Keep the repository contract aware of the beginner guide.
replaceOnce(
  "scripts/check.mjs",
  `"docs/project-context.md", "docs/product-brief.md", "docs/roadmap.md", "docs/publish-checklist.md",`,
  `"docs/project-context.md", "docs/product-brief.md", "docs/roadmap.md", "docs/publish-checklist.md", "docs/GETTING_STARTED_WINDOWS.md",`,
);

// Changelog and cleanup.
{
  const file = "CHANGELOG.md";
  const source = read(file);
  const marker = "### Changed\n\n- package and desktop version are now `1.2.0`";
  if (source.includes(marker) && !source.includes("beginner-first Windows installer links")) {
    write(file, source.replace(marker, `### Changed\n\n- beginner-first Windows installer links, setup copy, one-click Git installation, and clear first-project instructions\n- Claude Code and Codex installation use their current official native installers instead of requiring npm for normal Desktop onboarding\n- package and desktop version are now \`1.2.0\``));
  }
}

for (const file of [
  "scripts/apply-publish-routing.mjs",
  "scripts/apply-publish-security.mjs",
  "scripts/apply-publish-ux.mjs",
  "scripts/apply-publish-followups.mjs",
  "scripts/apply-beginner-onboarding.mjs",
  ".github/workflows/apply-beginner-onboarding.yml"
]) fs.rmSync(file, { force: true });

console.log("Applied beginner-first Desktop onboarding and completed Ship integration.");
