#!/usr/bin/env node
import fs from "node:fs";

function replaceOnce(file, before, after, label) {
  let source = fs.readFileSync(file, "utf8");
  if (!source.includes(before)) throw new Error(`Missing patch marker: ${label}`);
  source = source.replace(before, after);
  fs.writeFileSync(file, source);
}

function replacePattern(file, pattern, replacement, label) {
  let source = fs.readFileSync(file, "utf8");
  if (!pattern.test(source)) throw new Error(`Missing patch pattern: ${label}`);
  source = source.replace(pattern, replacement);
  fs.writeFileSync(file, source);
}

replaceOnce(
  "desktop/lib.mjs",
  `  };\n}\n\nexport function collectEnvironment(config = {}, options = {}) {`,
  `  };\n}\n\nexport function authenticationInfo(provider, command, env = desktopEnvironment()) {\n  if (!command) return { authenticated: false, authState: "unavailable", authMessage: "Not installed" };\n  const args = provider === "claude" ? ["auth", "status"] : provider === "codex" ? ["login", "status"] : [];\n  if (!args.length) return { authenticated: false, authState: "unknown", authMessage: "Authentication status unavailable" };\n  const result = spawnSync(command, args, {\n    encoding: "utf8",\n    env,\n    windowsHide: true,\n    timeout: 6000,\n    maxBuffer: 512 * 1024,\n  });\n  const output = String(result.stdout || result.stderr || "").trim().replace(/\\s+/g, " ").slice(0, 500);\n  const negative = /not logged|not authenticated|not signed in|login required|missing api key|invalid api key/i.test(output);\n  const unsupported = result.status !== 0 && /unknown command|unrecognized|unexpected argument|usage:/i.test(output);\n  const authenticated = result.status === 0 && !negative;\n  return {\n    authenticated,\n    authState: authenticated ? "connected" : unsupported ? "unknown" : "disconnected",\n    authMessage: output || (authenticated ? "Connected" : unsupported ? "Status check is not supported by this CLI version" : "Account connection not confirmed"),\n  };\n}\n\nexport function collectEnvironment(config = {}, options = {}) {`,
  "authentication status helper",
);

replaceOnce(
  "desktop/lib.mjs",
  `    claude: claudeInfo,\n    codex: codexInfo,`,
  `    claude: { ...claudeInfo, ...authenticationInfo("claude", claude, env) },\n    codex: { ...codexInfo, ...authenticationInfo("codex", codex, env) },`,
  "authentication status in environment",
);

replaceOnce(
  "desktop/renderer/app.js",
  `const state = { step: params.get("mode") === "settings" ? 5 : 1, payload: null, installing: false };`,
  `const state = { step: params.get("mode") === "settings" ? 5 : 1, payload: null, installing: false, authPolling: null };`,
  "renderer auth polling state",
);

replacePattern(
  "desktop/renderer/app.js",
  /function renderAgents\(\) \{[\s\S]*?\n\}\n\nfunction renderPreferences/,
  `function renderAgents() {\n  const environment = currentEnvironment();\n  const selected = currentConfig().preferredAgent || "manual";\n  $$('[name="preferred-agent"]').forEach((radio) => { radio.checked = radio.value === selected; });\n  $$('[data-agent-card]').forEach((card) => { card.dataset.selected = String(card.dataset.agentCard === selected); });\n  for (const provider of ["claude", "codex"]) {\n    const info = environment[provider];\n    const connected = Boolean(info?.authenticated);\n    const status = \`[data-agent-status="\${provider}"]\`;\n    const statusNode = $(status);\n    statusNode.textContent = connected ? "Account connected" : info?.available ? "Installed · account connection not confirmed" : "Not installed yet";\n    statusNode.classList.toggle("ready", Boolean(info?.available));\n    statusNode.classList.toggle("connected", connected);\n    statusNode.title = info?.authMessage || info?.error || "";\n    const install = \`[data-install-agent="\${provider}"]\`;\n    const auth = \`[data-auth-agent="\${provider}"]\`;\n    const installButton = $(install);\n    const authButton = $(auth);\n    installButton.disabled = state.installing;\n    installButton.textContent = info?.available ? "Repair / reinstall" : "Install for me";\n    authButton.disabled = !info?.available || state.installing;\n    authButton.textContent = connected ? "Reconnect account" : "Connect account";\n  }\n}\n\nfunction renderPreferences`,
  "renderer agent status",
);

replaceOnce(
  "desktop/renderer/app.js",
  `  const available = ["claude", "codex"].filter((provider) => currentEnvironment()[provider]?.available).map(providerLabel);\n  setStatus(available.length ? \`${"${available.join(\" + \")} available"}\` : "Choose an AI agent or continue in manual mode");`,
  `  const connected = ["claude", "codex"].filter((provider) => currentEnvironment()[provider]?.authenticated).map(providerLabel);\n  const available = ["claude", "codex"].filter((provider) => currentEnvironment()[provider]?.available).map(providerLabel);\n  setStatus(connected.length ? \`${"${connected.join(\" + \")} connected"}\` : available.length ? \`${"${available.join(\" + \")} installed · connect an account or continue manually"}\` : "Choose an AI agent or continue in manual mode");`,
  "renderer footer connection state",
);

replaceOnce(
  "desktop/renderer/app.js",
  `async function installAgent(provider) {\n  state.installing = true;`,
  `async function installAgent(provider) {\n  state.authPolling = null;\n  state.installing = true;`,
  "stop auth polling during install",
);

replacePattern(
  "desktop/renderer/app.js",
  /async function authenticateAgent\(provider\) \{[\s\S]*?\n\}\n\nasync function savePreference/,
  `function delay(duration) { return new Promise((resolve) => setTimeout(resolve, duration)); }\n\nasync function waitForAuthentication(provider) {\n  const token = Symbol(provider);\n  state.authPolling = token;\n  for (let attempt = 0; attempt < 40; attempt += 1) {\n    await delay(3000);\n    if (state.authPolling !== token) return;\n    try {\n      state.payload = await desktop.refreshEnvironment();\n      render();\n      if (currentEnvironment()[provider]?.authenticated) {\n        state.authPolling = null;\n        setStatus(\`${"${providerLabel(provider)} connected. Continue when ready."}\`);\n        return;\n      }\n      setStatus(\`Waiting for \${providerLabel(provider)} sign-in…\`);\n    } catch { /* continue polling while the provider owns the sign-in flow */ }\n  }\n  if (state.authPolling === token) {\n    state.authPolling = null;\n    setStatus(\`Finish \${providerLabel(provider)} sign-in, then choose Run checks again.\`);\n  }\n}\n\nasync function authenticateAgent(provider) {\n  try {\n    showError("");\n    await desktop.authenticateAgent(provider);\n    setStatus(\`Complete the \${providerLabel(provider)} sign-in in the window that opened. AIgent will detect the connection automatically.\`);\n    waitForAuthentication(provider).catch(() => {});\n  } catch (error) { showError(error.message); }\n}\n\nasync function savePreference`,
  "renderer authentication polling",
);

replaceOnce(
  "studio/app.js",
  `const CHANNEL = "aigent-studio";`,
  `const CHANNEL = "aigent-studio";\nconst FIRST_PROJECT_PROMPT_KEY = "aigent-studio-first-project-prompted";`,
  "first project key",
);

replaceOnce(
  "studio/app.js",
  `    else { fillProjectSelect(); projectForm(null); loadPreview(); setRunning(false, providerSummary(state.status)); renderCanvasState(); }`,
  `    else {\n      fillProjectSelect();\n      projectForm(null);\n      loadPreview();\n      setRunning(false, providerSummary(state.status));\n      renderCanvasState();\n      if (!localStorage.getItem(FIRST_PROJECT_PROMPT_KEY)) {\n        localStorage.setItem(FIRST_PROJECT_PROMPT_KEY, "true");\n        setTimeout(showProjectDialog, 250);\n      }\n    }`,
  "automatic first project dialog",
);

replaceOnce(
  ".github/workflows/desktop-release.yml",
  `  group: desktop-release-${"${{ inputs.ref || github.sha }}"}`,
  `  group: desktop-release-${"${{ inputs.ref || github.ref }}"}`,
  "Desktop release concurrency",
);

replaceOnce(
  ".github/workflows/desktop-release.yml",
  `      - package-lock.json\n      - desktop/**`,
  `      - package-lock.json\n      - studio/**\n      - publish/**\n      - registry.json\n      - scripts/studio-server.mjs\n      - scripts/studio-publish.mjs\n      - scripts/publish-site.mjs\n      - scripts/cli.mjs\n      - desktop/**`,
  "Desktop release runtime paths",
);

replaceOnce(
  "scripts/check-desktop.mjs",
  `  authCommand,\n  installCommand,`,
  `  authCommand,\n  authenticationInfo,\n  installCommand,`,
  "Desktop check authentication import",
);

replaceOnce(
  "scripts/check-desktop.mjs",
  `const rendererApp = fs.readFileSync(file("desktop/renderer/app.js"), "utf8");\nassert.ok(!rendererApp.includes("!environment.npm?.available"), "Agent installation must not be disabled only because npm is missing.");`,
  `const rendererApp = fs.readFileSync(file("desktop/renderer/app.js"), "utf8");\nassert.ok(!rendererApp.includes("!environment.npm?.available"), "Agent installation must not be disabled only because npm is missing.");\nassert.ok(rendererApp.includes("waitForAuthentication"), "Desktop onboarding must detect account connection after sign-in.");\nassert.ok(rendererApp.includes("Reconnect account"), "Connected accounts must remain manageable from the wizard.");\nassert.ok(workflow.includes("studio/**"), "Desktop packages must rebuild when Studio runtime files change.");\nassert.ok(workflow.includes("github.ref"), "Desktop release concurrency must cancel superseded branch builds.");`,
  "Desktop connected onboarding checks",
);

replaceOnce(
  "scripts/check-desktop.mjs",
  `  assert.equal(environment.workspace.available, true);\n  assert.equal(installCommand("manual", environment), null);`,
  `  assert.equal(environment.workspace.available, true);\n  assert.equal(authenticationInfo("claude", null).authState, "unavailable");\n  assert.equal(installCommand("manual", environment), null);`,
  "Desktop authentication unit check",
);

replaceOnce(
  "scripts/check-studio.mjs",
  `const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-studio-v1-check-"));`,
  `const studioClient = fs.readFileSync(path.join(repositoryRoot, "studio", "app.js"), "utf8");\nassert.ok(studioClient.includes("aigent-studio-first-project-prompted"), "A new local workspace should open the first-project flow automatically.");\n\nconst root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-studio-v1-check-"));`,
  "Studio first project check",
);

fs.rmSync("scripts/apply-connected-first-run.mjs", { force: true });
fs.rmSync(".github/workflows/apply-connected-first-run.yml", { force: true });
console.log("Connected account detection and first-project onboarding applied.");
