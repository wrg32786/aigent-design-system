#!/usr/bin/env node
import fs from "node:fs";

function read(file) { return fs.readFileSync(file, "utf8"); }
function write(file, value) { fs.writeFileSync(file, value); }
function replaceOnce(file, before, after) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`Missing onboarding marker in ${file}: ${before.slice(0, 120)}`);
  write(file, source.replace(before, after));
}
function replaceSection(file, startMarker, endMarker, replacement) {
  const source = read(file);
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Missing onboarding section in ${file}: ${startMarker}`);
  write(file, `${source.slice(0, start)}${replacement}${source.slice(end)}`);
}

// Stable asset names make releases/latest/download links work without knowing a version.
replaceOnce(
  "electron-builder.yml",
  "artifactName: AIgent-Desktop-${version}-${os}-${arch}.${ext}",
  "artifactName: AIgent-Desktop-${os}-${arch}.${ext}",
);

// Friendly docs and hosting links available to the setup wizard.
replaceOnce(
  "desktop/lib.mjs",
  `  repository: "https://github.com/wrg32786/aigent-design-system",\n  releases: "https://github.com/wrg32786/aigent-design-system/releases",\n  node: "https://nodejs.org/en/download",\n  git: "https://git-scm.com/downloads",`,
  `  repository: "https://github.com/wrg32786/aigent-design-system",\n  releases: "https://github.com/wrg32786/aigent-design-system/releases",\n  gettingStarted: "https://github.com/wrg32786/aigent-design-system/blob/master/docs/GETTING_STARTED.md",\n  vercel: "https://vercel.com/signup",\n  netlify: "https://app.netlify.com/signup",\n  node: "https://nodejs.org/en/download",\n  git: "https://git-scm.com/downloads",`,
);

replaceOnce(
  "desktop/lib.mjs",
  `export function collectEnvironment(config = {}, options = {}) {\n  const env = desktopEnvironment(options.env || {});\n  const git = resolveCommand("git", config.gitPath, env);`,
  `export function collectEnvironment(config = {}, options = {}) {\n  const env = desktopEnvironment(options.env || {});\n  const winget = process.platform === "win32" ? resolveCommand("winget", "", env) : null;\n  const git = resolveCommand("git", config.gitPath, env);`,
);
replaceOnce(
  "desktop/lib.mjs",
  `  const gitInfo = commandInfo(git, ["--version"], { env });`,
  `  const wingetInfo = process.platform === "win32"\n    ? commandInfo(winget, ["--version"], { env })\n    : { available: false, command: null, version: null, error: "Windows only" };\n  const gitInfo = commandInfo(git, ["--version"], { env });`,
);
replaceOnce(
  "desktop/lib.mjs",
  `    runtime: { available: true, command: process.execPath, version: process.versions.electron ? \`Electron \${process.versions.electron} · Node \${process.versions.node}\` : \`Node \${process.versions.node}\` },\n    git: gitInfo,`,
  `    runtime: { available: true, command: process.execPath, version: process.versions.electron ? \`Electron \${process.versions.electron} · Node \${process.versions.node}\` : \`Node \${process.versions.node}\` },\n    winget: wingetInfo,\n    git: gitInfo,`,
);
replaceOnce(
  "desktop/lib.mjs",
  `export function installCommand(provider, environment) {`,
  `export function prerequisiteInstallCommands(environment = {}, platform = process.platform) {\n  if (platform !== "win32" || !environment?.winget?.available) return [];\n  const command = environment.winget.command || "winget";\n  const common = ["--exact", "--accept-source-agreements", "--accept-package-agreements", "--silent"];\n  const steps = [];\n  if (!environment.git?.available || !environment.gitBash) {\n    steps.push({ command, args: ["install", "--id", "Git.Git", ...common], label: "Install Git for Windows" });\n  }\n  if (!environment.node?.available || !environment.npm?.available) {\n    steps.push({ command, args: ["install", "--id", "OpenJS.NodeJS.LTS", ...common], label: "Install Node.js LTS" });\n  }\n  return steps;\n}\n\nexport function installCommand(provider, environment) {`,
);
replaceOnce(
  "desktop/lib.mjs",
  `  if (provider === "claude" && environment?.claude?.available) return { command: environment.claude.command, args: [], label: "Claude Code sign-in" };\n  if (provider === "codex" && environment?.codex?.available) return { command: environment.codex.command, args: ["login"], label: "Codex sign-in" };`,
  `  if (provider === "claude" && environment?.claude?.available) return { command: environment.claude.command, args: [], label: "Connect your Claude account" };\n  if (provider === "codex" && environment?.codex?.available) return { command: environment.codex.command, args: ["login"], label: "Connect your ChatGPT account" };`,
);

// One-click prerequisite installation on Windows through the operating system package manager.
replaceOnce(
  "desktop/main.mjs",
  `  installCommand,\n  normalizeConfig,`,
  `  installCommand,\n  prerequisiteInstallCommands,\n  normalizeConfig,`,
);
replaceSection(
  "desktop/main.mjs",
  "function streamInstall(provider) {",
  "\n\nfunction setupUpdater()",
  `function runInstallerSpec(spec, provider) {\n  safeSend("desktop:install", { provider, state: "start", message: spec.label });\n  log("Installation started", { provider, command: spec.command, label: spec.label });\n  return new Promise((resolve, reject) => {\n    const child = spawn(spec.command, spec.args, { env: desktopEnvironment(), windowsHide: true, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });\n    activeInstaller = child;\n    const forward = (stream, channel) => {\n      stream.setEncoding("utf8");\n      stream.on("data", (chunk) => safeSend("desktop:install", { provider, state: "log", channel, message: String(chunk).slice(-12000) }));\n    };\n    forward(child.stdout, "stdout");\n    forward(child.stderr, "stderr");\n    child.on("error", (error) => {\n      activeInstaller = null;\n      safeSend("desktop:install", { provider, state: "error", message: error.message });\n      log("Installation error", error.message);\n      reject(error);\n    });\n    child.on("exit", (code) => {\n      activeInstaller = null;\n      const payload = { provider, state: code === 0 ? "done" : "error", code, message: code === 0 ? \`\${spec.label} complete.\` : \`\${spec.label} exited with code \${code}.\` };\n      safeSend("desktop:install", payload);\n      log("Installation finished", payload);\n      if (code === 0) resolve(payload); else reject(new Error(payload.message));\n    });\n  });\n}\n\nfunction streamInstall(provider) {\n  if (activeInstaller) throw new Error("An installation is already running.");\n  environment = refreshEnvironment();\n  const spec = installCommand(provider, environment);\n  if (!spec) throw new Error("Install the missing Windows tools first, then try again.");\n  return runInstallerSpec(spec, provider).then(async () => {\n    environment = refreshEnvironment();\n    if (studio) await stopStudio();\n    return { environment };\n  });\n}\n\nasync function streamPrerequisites() {\n  if (activeInstaller) throw new Error("An installation is already running.");\n  environment = refreshEnvironment();\n  const steps = prerequisiteInstallCommands(environment);\n  if (!steps.length) return { environment };\n  for (const spec of steps) await runInstallerSpec(spec, "prerequisites");\n  environment = refreshEnvironment();\n  if (studio) await stopStudio();\n  return { environment };\n}`,
);
replaceOnce(
  "desktop/main.mjs",
  `    "desktop:refresh-environment": async () => { refreshEnvironment(); return windowPayload(); },\n    "desktop:install-agent": async (_event, provider) => streamInstall(provider),`,
  `    "desktop:refresh-environment": async () => { refreshEnvironment(); return windowPayload(); },\n    "desktop:install-prerequisites": async () => { await streamPrerequisites(); return windowPayload(); },\n    "desktop:install-agent": async (_event, provider) => streamInstall(provider),`,
);
replaceOnce(
  "desktop/main.mjs",
  `  if (process.platform === "win32") {\n    const escaped = line.replace(/'/g, "''");\n    const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", \`Start-Process powershell.exe -ArgumentList '-NoExit','-Command','\${escaped}'\`], { detached: true, stdio: "ignore", windowsHide: true });`,
  `  if (process.platform === "win32") {\n    const escaped = line.replace(/'/g, "''");\n    const guided = \`Write-Host 'AIgent Desktop account connection' -ForegroundColor Cyan; Write-Host 'Follow the sign-in steps below. When sign-in finishes, return to the setup wizard.'; Write-Host ''; \${escaped}\`;\n    const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", \`Start-Process powershell.exe -ArgumentList '-NoExit','-Command','\${guided.replace(/'/g, "''")}'\`], { detached: true, stdio: "ignore", windowsHide: true });`,
);

replaceOnce(
  "desktop/preload.cjs",
  `  refreshEnvironment: () => ipcRenderer.invoke("desktop:refresh-environment"),\n  installAgent: (provider) => ipcRenderer.invoke("desktop:install-agent", provider),`,
  `  refreshEnvironment: () => ipcRenderer.invoke("desktop:refresh-environment"),\n  installPrerequisites: () => ipcRenderer.invoke("desktop:install-prerequisites"),\n  installAgent: (provider) => ipcRenderer.invoke("desktop:install-agent", provider),`,
);

// Rewrite setup language around outcomes instead of engineering concepts.
replaceOnce(
  "desktop/renderer/index.html",
  `<p>Configure the workspace, connect a coding agent, and launch the complete AIgent design studio without touching the terminal.</p>`,
  `<p>Download, double-click, connect your Claude or ChatGPT account, and create your first site without knowing what a terminal is.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<span class="eyebrow">02 / System check</span>\n        <h2>Verify the production stack.</h2>\n        <p class="lede">The desktop app includes its own runtime. Git enables checkpoints; Node and npm are needed only to install coding-agent CLIs.</p>`,
  `<span class="eyebrow">02 / Automatic setup</span>\n        <h2>Let AIgent prepare this computer.</h2>\n        <p class="lede">AIgent includes its own runtime. On Windows, click one button to install any missing free helper tools. You do not need to type commands.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<div class="inline-actions"><button class="secondary-button" id="refresh-environment" type="button">Run checks again</button><button class="text-button" id="get-node" type="button">Get Node.js</button><button class="text-button" id="get-git" type="button">Get Git</button></div>`,
  `<div class="inline-actions"><button class="primary-button" id="install-prerequisites" type="button">Install missing tools automatically</button><button class="secondary-button" id="refresh-environment" type="button">Check again</button><button class="text-button" id="get-node" type="button">Download Node.js manually</button><button class="text-button" id="get-git" type="button">Download Git manually</button></div>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<span class="eyebrow">03 / Design agent</span>\n        <h2>Connect the agent that builds with you.</h2>\n        <p class="lede">Choose Claude Code, Codex, both, or manual prompt mode. Installation and sign-in happen through the official local tools.</p>`,
  `<span class="eyebrow">03 / Your AI account</span>\n        <h2>Connect Claude or ChatGPT.</h2>\n        <p class="lede">Use an account you already own. AIgent installs the official helper, opens its secure sign-in, and never asks you to paste an API key.</p>`,
);
replaceOnce("desktop/renderer/index.html", `>Sign in</button>`, `>Connect account</button>`);
replaceOnce("desktop/renderer/index.html", `>Sign in</button>`, `>Connect account</button>`);
replaceOnce(
  "desktop/renderer/index.html",
  `<h2>Your design studio is ready.</h2>\n        <p class="lede">Create a site from a proven starter, select real rendered elements, edit visually, direct the agent, and finish with Resolve and Vision.</p>`,
  `<h2>Create your first site.</h2>\n        <p class="lede">Everything can be built and previewed privately on this computer first. Hosting is optional until you are ready to publish.</p>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<button class="launch-button" id="launch-studio" type="button"><span>Launch AIgent Studio</span><small>Open the real DOM-backed visual canvas</small></button>`,
  `<div class="assurance-grid">\n          <article><span>01</span><strong>Create a project</strong><p>Choose Website, Sales Deck, Dashboard, 3D Site, or Blank.</p></article>\n          <article><span>02</span><strong>Describe it normally</strong><p>Tell the agent what you sell, who it is for, and what the site should do.</p></article>\n          <article><span>03</span><strong>Build and edit live</strong><p>Watch the real site appear, click anything to change it, and keep revising.</p></article>\n        </div>\n        <div class="security-note"><strong>Publish when ready</strong><p>Use the Ship tab to create a free preview or connect Vercel, Netlify, or Cloudflare. Local creation never requires a hosting account.</p><div class="inline-actions"><button class="secondary-button" id="open-vercel" type="button">Create free Vercel account</button><button class="text-button" id="open-netlify" type="button">Netlify</button></div></div>\n        <button class="launch-button" id="launch-studio" type="button"><span>Launch Studio and create my first project</span><small>No terminal required</small></button>`,
);
replaceOnce(
  "desktop/renderer/index.html",
  `<div class="ready-actions"><button class="secondary-button" id="open-workspace" type="button">Open workspace</button>`,
  `<div class="ready-actions"><button class="secondary-button" id="open-getting-started" type="button">Beginner guide</button><button class="secondary-button" id="open-workspace" type="button">Open workspace</button>`,
);

replaceOnce(
  "desktop/renderer/app.js",
  `  $("#environment-grid").innerHTML = [\n    statusCard("AIgent runtime", environment.runtime, "Bundled with the desktop app"),`,
  `  $("#environment-grid").innerHTML = [\n    statusCard("AIgent runtime", environment.runtime, "Bundled with the desktop app"),`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `    statusCard("Git Bash", { available: environment.platform?.platform !== "win32" || Boolean(environment.gitBash), version: environment.gitBash || "Not required on this platform" }, "Required by Claude Code on native Windows"),\n  ].join("");\n}`,
  `    statusCard("Git Bash", { available: environment.platform?.platform !== "win32" || Boolean(environment.gitBash), version: environment.gitBash || "Not required on this platform" }, "Required by Claude Code on native Windows"),\n  ].join("");\n  const missing = environment.platform?.platform === "win32" && (!environment.git?.available || !environment.gitBash || !environment.node?.available || !environment.npm?.available);\n  const automatic = $("#install-prerequisites");\n  automatic.hidden = !missing;\n  automatic.disabled = state.installing || !environment.winget?.available;\n  automatic.title = environment.winget?.available ? "Install missing tools with Windows App Installer" : "Windows App Installer is unavailable; use the manual download links.";\n}`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `async function installAgent(provider) {`,
  `async function installPrerequisites() {\n  state.installing = true;\n  $("#install-console").hidden = false;\n  $("#install-log").textContent = "Preparing this computer…\\n";\n  renderEnvironment();\n  renderAgents();\n  try {\n    state.payload = await desktop.installPrerequisites();\n    await refreshEnvironment();\n    setStatus("Required tools are ready.");\n  } catch (error) { showError(error.message); }\n  finally { state.installing = false; render(); }\n}\n\nasync function installAgent(provider) {`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `    setStatus(\`${providerLabel(provider)} sign-in opened in your terminal.\`);`,
  `    setStatus(\`${providerLabel(provider)} secure sign-in opened. Complete it, then return here.\`);`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `  $("#refresh-environment").addEventListener("click", refreshEnvironment);`,
  `  $("#install-prerequisites").addEventListener("click", installPrerequisites);\n  $("#refresh-environment").addEventListener("click", refreshEnvironment);`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `  $("#open-docs").addEventListener("click", () => desktop.openLink("repository"));`,
  `  $("#open-docs").addEventListener("click", () => desktop.openLink("gettingStarted"));`,
);
replaceOnce(
  "desktop/renderer/app.js",
  `  $("#open-workspace").addEventListener("click", () => desktop.openWorkspace());`,
  `  $("#open-getting-started").addEventListener("click", () => desktop.openLink("gettingStarted"));\n  $("#open-vercel").addEventListener("click", () => desktop.openLink("vercel"));\n  $("#open-netlify").addEventListener("click", () => desktop.openLink("netlify"));\n  $("#open-workspace").addEventListener("click", () => desktop.openWorkspace());`,
);

// The Studio empty state should teach the first workflow instead of assuming developer knowledge.
replaceOnce(
  "studio/index.html",
  `<div class="empty-preview" id="empty-preview">\n            <span class="kicker">No project yet</span>\n            <strong>Create a project to start building live.</strong>\n            <button class="primary-button" id="empty-new-project" type="button">Create project</button>\n          </div>`,
  `<div class="empty-preview" id="empty-preview">\n            <span class="kicker">Your first project</span>\n            <strong>Describe what you need. The agent builds the real site here.</strong>\n            <small>Start locally, revise visually, then use Ship when you want a public link.</small>\n            <button class="primary-button" id="empty-new-project" type="button">Create my first project</button>\n          </div>`,
);
replaceOnce(
  "studio/index.html",
  `<header><span class="kicker">New project</span><h2>Choose a proven starting point.</h2><button class="icon-button" value="cancel" aria-label="Close dialog">×</button></header>`,
  `<header><span class="kicker">New project</span><h2>What do you want to make?</h2><button class="icon-button" value="cancel" aria-label="Close dialog">×</button></header>`,
);
replaceOnce(
  "studio/index.html",
  `<label><span>Starter</span><select id="new-starter" name="starter"></select></label>`,
  `<label><span>Project type</span><select id="new-starter" name="starter"></select><small>This only chooses a starting structure. The agent will redesign it for your project.</small></label>`,
);
replaceOnce(
  "studio/index.html",
  `<label><span>What are we building?</span><textarea id="new-description" name="description" rows="3" required placeholder="A cinematic launch site for an industrial robotics platform."></textarea></label>`,
  `<label><span>Describe it in plain English</span><textarea id="new-description" name="description" rows="3" required placeholder="A website for my landscaping company that shows our work and gets quote requests."></textarea></label>`,
);
replaceOnce("studio/index.html", `>Create project</button>`, `>Create and open</button>`);

// Protect users who choose the optional terminal path from installing into Windows system folders.
replaceOnce(
  "scripts/cli.mjs",
  `function flags(args) {\n  return {\n    force: args.includes("--force"),\n    dryRun: args.includes("--dry-run"),\n    target: path.resolve(option(args, "--target", process.cwd())),\n  };\n}`,
  `function assertSafeTarget(target) {\n  if (process.platform !== "win32") return target;\n  const windowsRoot = path.resolve(process.env.WINDIR || "C:\\\\Windows").toLowerCase();\n  const selected = path.resolve(target).toLowerCase();\n  if (selected === windowsRoot || selected.startsWith(\`${windowsRoot}\${path.sep}\`)) {\n    throw new Error(\`Do not install AIgent inside Windows system folders. Open PowerShell in Documents or create a folder such as \"$HOME\\\\AIgent Projects\\\\my-site\", then run the command there. Selected target: \${target}\`);\n  }\n  return target;\n}\n\nfunction flags(args) {\n  const target = assertSafeTarget(path.resolve(option(args, "--target", process.cwd())));\n  return {\n    force: args.includes("--force"),\n    dryRun: args.includes("--dry-run"),\n    target,\n  };\n}`,
);
replaceOnce(
  "scripts/cli.mjs",
  `  console.log(\`AIgent Design\\n\\nCommands:`,
  `  console.log(\`AIgent Design\\n\\nFor the no-terminal Windows app, download AIgent Desktop from the latest GitHub release.\\nThese commands are the optional developer path and must be run inside a normal project folder, never C:\\\\Windows\\\\System32.\\n\\nCommands:`,
);

// Desktop contract checks cover the new no-terminal path.
replaceOnce(
  "scripts/check-desktop.mjs",
  `  installCommand,\n  normalizeConfig,`,
  `  installCommand,\n  prerequisiteInstallCommands,\n  normalizeConfig,`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `  "deleteAppDataOnUninstall: false",`,
  `  "deleteAppDataOnUninstall: false",\n  "artifactName: AIgent-Desktop-${os}-${arch}.${ext}",`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `for (const contract of ["Choose where your sites live", "Verify the production stack", "Connect the agent", "Launch AIgent Studio", "Export diagnostics", "Repair installation"]) {`,
  `for (const contract of ["Choose where your sites live", "Let AIgent prepare this computer", "Connect Claude or ChatGPT", "Create your first site", "No terminal required", "Export diagnostics", "Repair installation"]) {`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `assert.ok(preload.includes("contextBridge.exposeInMainWorld"));`,
  `assert.ok(preload.includes("contextBridge.exposeInMainWorld"));\nassert.ok(preload.includes("installPrerequisites"));`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `for (const contract of ["contextIsolation: true", "sandbox: true", "nodeIntegration: false", "setPermissionRequestHandler", "requestSingleInstanceLock", "autoUpdater", "latest-arm64", "latest-x64", "capturePage", "runtimeRoot", "createStudioServer"])`,
  `for (const contract of ["contextIsolation: true", "sandbox: true", "nodeIntegration: false", "setPermissionRequestHandler", "requestSingleInstanceLock", "autoUpdater", "latest-arm64", "latest-x64", "capturePage", "runtimeRoot", "createStudioServer", "desktop:install-prerequisites"])`,
);
replaceOnce(
  "scripts/check-desktop.mjs",
  `  assert.equal(installCommand("manual", environment), null);`,
  `  assert.equal(installCommand("manual", environment), null);\n  const prerequisites = prerequisiteInstallCommands({ winget: { available: true, command: "winget" }, git: { available: false }, gitBash: null, node: { available: false }, npm: { available: false } }, "win32");\n  assert.equal(prerequisites.length, 2);\n  assert.ok(prerequisites.some((step) => step.args.includes("Git.Git")));\n  assert.ok(prerequisites.some((step) => step.args.includes("OpenJS.NodeJS.LTS")));`,
);

fs.rmSync("scripts/apply-desktop-onboarding.mjs");
console.log("Applied layman-first desktop onboarding and stable installer links.");
