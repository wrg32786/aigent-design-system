#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  APP_ID,
  APP_NAME,
  DESKTOP_VERSION,
  collectEnvironment,
  defaultConfig,
  diagnosticsReport,
  ensureWorkspace,
  authCommand,
  authenticationInfo,
  installCommand,
  normalizeConfig,
  writeConfig,
  readConfig,
} from "../desktop/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = (relative) => path.join(root, relative);
const required = [
  "desktop/main.mjs",
  "desktop/preload.cjs",
  "desktop/lib.mjs",
  "desktop/renderer/index.html",
  "desktop/renderer/app.js",
  "desktop/renderer/styles.css",
  "desktop/renderer/onboarding.css",
  "desktop/resources/icon.svg",
  "desktop/README.md",
  "electron-builder.yml",
  "scripts/generate-desktop-assets.mjs",
  "scripts/prepare-desktop-build.mjs",
  "scripts/smoke-packaged-desktop.mjs",
  "scripts/verify-desktop-release.mjs",
  "scripts/check-desktop.mjs",
  ".github/workflows/desktop-build-check.yml",
  ".github/workflows/desktop-release.yml",
];
for (const relative of required) assert.ok(fs.existsSync(file(relative)), `Missing desktop file: ${relative}`);

const packageJson = JSON.parse(fs.readFileSync(file("package.json"), "utf8"));
assert.equal(packageJson.version, DESKTOP_VERSION);
assert.equal(packageJson.main, "desktop/main.mjs");
assert.equal(packageJson.scripts["desktop:start"], "electron .");
for (const script of ["desktop:assets", "desktop:prepare", "desktop:start", "desktop:check", "desktop:smoke", "desktop:smoke:packaged", "desktop:pack", "desktop:dist", "desktop:dist:win", "desktop:dist:mac", "desktop:verify-release"]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing desktop package script: ${script}`);
}
for (const name of ["electron-updater", "playwright"]) assert.equal(typeof packageJson.dependencies?.[name], "string", `Missing runtime dependency: ${name}`);
for (const name of ["electron", "electron-builder"]) assert.equal(typeof packageJson.devDependencies?.[name], "string", `Missing desktop build dependency: ${name}`);

const builder = fs.readFileSync(file("electron-builder.yml"), "utf8");
for (const contract of [
  APP_ID,
  "oneClick: false",
  "allowToChangeInstallationDirectory: true",
  "createDesktopShortcut: true",
  "  - dmg",
  "provider: github",
  "asarUnpack:",
  "node_modules/playwright/**",
  "node_modules/playwright-core/**",
  "docs/**",
  "resolve/**",
  "vision/**",
  "CONTRIBUTING.md",
  "extraResources:",
  "to: playwright",
  "deleteAppDataOnUninstall: false",
]) {
  assert.ok(builder.includes(contract), `Desktop builder config missing: ${contract}`);
}
assert.ok(!builder.includes("verifyUpdateCodeSignature: false"), "Desktop updates must not disable signature verification.");
const workflow = fs.readFileSync(file(".github/workflows/desktop-release.yml"), "utf8");
for (const contract of ["windows-latest", "macos-14", "macos-15-intel", "latest-arm64", "latest-x64", "desktop:smoke:packaged", "WIN_CSC_LINK", "MAC_CSC_LINK", "APPLE_API_KEY", "gh release upload", "verify-desktop-release.mjs"]) {
  assert.ok(workflow.includes(contract), `Desktop release workflow missing: ${contract}`);
}
const html = fs.readFileSync(file("desktop/renderer/index.html"), "utf8");
for (const contract of ["Choose where your work is saved", "Make sure AIgent is ready", "Choose the agent that builds with you", "Install for me", "Connect account", "Launch AIgent Studio and create my first project", "Export diagnostics", "Repair installation"]) {
  assert.ok(html.includes(contract), `Setup wizard missing: ${contract}`);
}
const preload = fs.readFileSync(file("desktop/preload.cjs"), "utf8");
assert.ok(preload.includes("contextBridge.exposeInMainWorld"));
assert.ok(!preload.includes("ipcRenderer.send,"), "Preload must not expose raw IPC.");
const main = fs.readFileSync(file("desktop/main.mjs"), "utf8");
for (const contract of ["contextIsolation: true", "sandbox: true", "nodeIntegration: false", "setPermissionRequestHandler", "requestSingleInstanceLock", "autoUpdater", "latest-arm64", "latest-x64", "capturePage", "runtimeRoot", "createStudioServer"]) assert.ok(main.includes(contract), `Desktop main missing: ${contract}`);
const desktopLibrary = fs.readFileSync(file("desktop/lib.mjs"), "utf8");
for (const contract of [
  "https://chatgpt.com/codex/install.ps1",
  "https://chatgpt.com/codex/install.sh",
  "https://claude.ai/install.sh",
  "Git.Git",
  "OpenJS.NodeJS.LTS",
  "CLAUDE_CODE_GIT_BASH_PATH",
]) {
  assert.ok(desktopLibrary.includes(contract), `Desktop provider installation contract missing: ${contract}`);
}
const rendererApp = fs.readFileSync(file("desktop/renderer/app.js"), "utf8");
assert.ok(!rendererApp.includes("!environment.npm?.available"), "Agent installation must not be disabled only because npm is missing.");
assert.ok(rendererApp.includes("waitForAuthentication"), "Desktop onboarding must detect account connection after sign-in.");
assert.ok(rendererApp.includes("Reconnect account"), "Connected accounts must remain manageable from the wizard.");
assert.ok(workflow.includes("studio/**"), "Desktop packages must rebuild when Studio runtime files change.");
assert.ok(workflow.includes("github.ref"), "Desktop release concurrency must cancel superseded branch builds.");

for (const target of ["desktop/main.mjs", "desktop/lib.mjs", "desktop/renderer/app.js", "desktop/preload.cjs", "scripts/generate-desktop-assets.mjs", "scripts/prepare-desktop-build.mjs", "scripts/smoke-packaged-desktop.mjs", "scripts/verify-desktop-release.mjs"]) {
  const result = spawnSync(process.execPath, ["--check", file(target)], { encoding: "utf8" });
  assert.equal(result.status, 0, `${target} failed syntax check:\n${result.stderr}`);
}

const assetResult = spawnSync(process.execPath, [file("scripts/generate-desktop-assets.mjs")], { cwd: root, encoding: "utf8" });
assert.equal(assetResult.status, 0, assetResult.stderr || assetResult.stdout);
for (const asset of ["icon.png", "installer-sidebar.bmp", "installer-header.bmp", "dmg-background.png", "dmg-background@2x.png"]) {
  const assetPath = file(`desktop/resources/generated/${asset}`);
  assert.ok(fs.statSync(assetPath).size > 1000, `Generated asset is empty: ${asset}`);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-desktop-check-"));
try {
  const workspace = ensureWorkspace(path.join(temp, "workspace"));
  const configFile = path.join(temp, "desktop.json");
  const saved = writeConfig(configFile, { ...defaultConfig({ documents: temp }), workspace, preferredAgent: "manual", onboardingComplete: true }, { documents: temp });
  assert.equal(readConfig(configFile, { documents: temp }).workspace, workspace);
  assert.equal(saved.onboardingComplete, true);
  assert.equal(normalizeConfig({ preferredAgent: "invalid" }, { documents: temp }).preferredAgent, "manual");
  const environment = collectEnvironment(saved);
  assert.equal(environment.runtime.available, true);
  assert.equal(environment.workspace.available, true);
  assert.equal(authenticationInfo("claude", null).authState, "unavailable");
  assert.equal(installCommand("manual", environment), null);

  const noDeveloperTools = {
    ...environment,
    git: { available: false, command: null },
    npm: { available: false, command: null },
    node: { available: false, command: null },
    gitBash: null,
  };
  const codexInstall = installCommand("codex", noDeveloperTools);
  const claudeInstall = installCommand("claude", noDeveloperTools);
  assert.equal(typeof codexInstall?.command, "string", "Codex must have a provider-native install route without npm.");
  assert.equal(typeof claudeInstall?.command, "string", "Claude must have an automated install route without preinstalled npm.");
  assert.match(codexInstall.label, /Install Codex/);
  assert.match(claudeInstall.label, /Install Claude Code/);

  assert.deepEqual(authCommand("codex", { codex: { available: true, command: "codex" } }).args, ["login"]);
  const report = diagnosticsReport({ appVersion: DESKTOP_VERSION, config: saved, environment, log: "desktop proof" });
  assert.match(report, new RegExp(APP_NAME));
  assert.match(report, /desktop proof/);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log(`AIgent Desktop ${DESKTOP_VERSION} check passed: beginner wizard, provider-native installation, secure IPC, environment detection, repair/diagnostics contract, complete packaged registry, bundled browser, installer assets, public release verification, signing hooks, architecture-specific updates, and cross-platform packaging configuration.`);
