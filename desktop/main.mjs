import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { app, BrowserWindow, dialog, ipcMain, Menu, Notification, session, shell } from "electron";
import electronUpdater from "electron-updater";
import { createStudioServer } from "../scripts/studio-server.mjs";
import {
  APP_ID,
  APP_NAME,
  LINKS,
  authCommand,
  collectEnvironment,
  defaultConfig,
  desktopEnvironment,
  diagnosticsReport,
  ensureWorkspace,
  installCommand,
  normalizeConfig,
  readConfig,
  shellQuote,
  windowsQuote,
  writeConfig,
} from "./lib.mjs";

const { autoUpdater } = electronUpdater;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rendererFile = path.join(root, "desktop", "renderer", "index.html");
const preloadFile = path.join(root, "desktop", "preload.cjs");
const isSmokeTest = process.argv.includes("--smoke-test");
const lock = app.requestSingleInstanceLock();

let mainWindow = null;
let studio = null;
let studioUrl = null;
let config = null;
let environment = null;
let activeInstaller = null;
let updateState = { state: "idle", version: null, percent: 0, message: "Updates not checked" };

function configFile() { return path.join(app.getPath("userData"), "desktop.json"); }
function logFile() { return path.join(app.getPath("logs"), "desktop.log"); }
function runtimeDirectory() { return path.join(app.getPath("userData"), "runtime"); }
function packagedFile(relativePath) {
  const packed = path.join(app.getAppPath(), relativePath);
  const marker = `${path.sep}app.asar${path.sep}`;
  const unpacked = packed.includes(marker) ? packed.replace(marker, `${path.sep}app.asar.unpacked${path.sep}`) : packed;
  return fs.existsSync(unpacked) ? unpacked : packed;
}
function documentsPath() { return app.getPath("documents"); }

function log(message, data = null) {
  const line = `[${new Date().toISOString()}] ${message}${data == null ? "" : ` ${typeof data === "string" ? data : JSON.stringify(data)}`}\n`;
  try {
    fs.mkdirSync(path.dirname(logFile()), { recursive: true });
    fs.appendFileSync(logFile(), line);
  } catch { /* diagnostics must never take down the app */ }
  if (!app.isPackaged || isSmokeTest) console.log(line.trim());
}

function readDesktopConfig() {
  config = readConfig(configFile(), { documents: documentsPath() });
  return config;
}

function saveDesktopConfig(patch = {}) {
  const allowed = Object.fromEntries(Object.entries(patch).filter(([key]) => [
    "onboardingComplete", "workspace", "preferredAgent", "claudePath", "codexPath", "gitPath", "nodePath", "npmPath", "launchAtLogin", "automaticUpdates",
  ].includes(key)));
  config = writeConfig(configFile(), normalizeConfig({ ...config, ...allowed }, { documents: documentsPath() }), { documents: documentsPath() });
  app.setLoginItemSettings({ openAtLogin: config.launchAtLogin, openAsHidden: false });
  environment = collectEnvironment(config);
  return config;
}

function refreshEnvironment() {
  environment = collectEnvironment(config || defaultConfig({ documents: documentsPath() }));
  return environment;
}

function windowPayload() {
  return {
    app: { name: APP_NAME, version: app.getVersion(), packaged: app.isPackaged, platform: process.platform, arch: process.arch },
    config,
    environment: environment || refreshEnvironment(),
    studio: { running: Boolean(studio), url: studioUrl },
    update: updateState,
    links: Object.keys(LINKS),
  };
}

function safeSend(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

function isTrustedNavigation(url) {
  try {
    const selected = new URL(url);
    if (selected.protocol === "file:") return path.resolve(fileURLToPath(selected)) === path.resolve(rendererFile);
    if (studioUrl && selected.origin === new URL(studioUrl).origin) return true;
  } catch { /* rejected below */ }
  return false;
}

function configureWebContents(contents) {
  contents.on("will-navigate", (event, url) => {
    if (!isTrustedNavigation(url)) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url).catch((error) => log("Open external failed", error.message));
    return { action: "deny" };
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 920,
    minHeight: 680,
    show: false,
    title: APP_NAME,
    backgroundColor: "#050806",
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      preload: preloadFile,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });
  configureWebContents(window.webContents);
  window.once("ready-to-show", () => window.show());
  window.on("closed", () => { if (mainWindow === window) mainWindow = null; });
  return window;
}

async function loadSetup(mode = "onboarding", error = "") {
  if (!mainWindow || mainWindow.isDestroyed()) mainWindow = createWindow();
  const url = pathToFileURL(rendererFile);
  url.searchParams.set("mode", mode);
  if (error) url.searchParams.set("error", error.slice(0, 500));
  await mainWindow.loadURL(url.href);
  mainWindow.show();
  mainWindow.focus();
}

function studioEnvironment() {
  const env = desktopEnvironment({
    AIGENT_STUDIO_ROOT: config.workspace,
    AIGENT_STUDIO_NODE_BIN: process.execPath,
    AIGENT_STUDIO_ELECTRON_NODE: "1",
    AIGENT_STUDIO_CLAUDE_BIN: environment?.claude?.command || config.claudePath || "",
    AIGENT_STUDIO_CODEX_BIN: environment?.codex?.command || config.codexPath || "",
  });
  if (environment?.gitBash) env.CLAUDE_CODE_GIT_BASH_PATH = environment.gitBash;
  return env;
}

async function startStudio() {
  ensureWorkspace(config.workspace);
  if (studio) return studioUrl;
  environment = refreshEnvironment();
  const next = studioEnvironment();
  for (const [key, value] of Object.entries(next)) process.env[key] = value;
  try {
    studio = createStudioServer({ projectsRoot: config.workspace, port: 0, host: "127.0.0.1" });
    const address = await studio.listen(0);
    studioUrl = `http://127.0.0.1:${address.port}/studio/`;
    log("Studio started", { url: studioUrl, workspace: config.workspace });
    return studioUrl;
  } catch (error) {
    studio = null;
    studioUrl = null;
    throw error;
  } finally {
    Object.assign(process.env, next);
  }
}

async function stopStudio() {
  const current = studio;
  studio = null;
  studioUrl = null;
  if (current) await current.close();
  log("Studio stopped");
}

async function launchStudio() {
  const url = await startStudio();
  if (!mainWindow || mainWindow.isDestroyed()) mainWindow = createWindow();
  await mainWindow.loadURL(url);
  mainWindow.show();
  mainWindow.focus();
  return { url };
}

function internalNodeRun(args, options = {}) {
  const env = studioEnvironment();
  env.ELECTRON_RUN_AS_NODE = "1";
  return spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    env,
    timeout: options.timeout || 120000,
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
  });
}

function openTerminal(command, args = []) {
  const line = [command, ...args].map((value) => process.platform === "win32" ? windowsQuote(value) : shellQuote(value)).join(" ");
  if (process.platform === "darwin") {
    const script = `tell application "Terminal" to do script ${JSON.stringify(line)}`;
    const child = spawn("osascript", ["-e", script], { detached: true, stdio: "ignore" });
    child.unref();
    return true;
  }
  if (process.platform === "win32") {
    const escaped = line.replace(/'/g, "''");
    const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", `Start-Process powershell.exe -ArgumentList '-NoExit','-Command','${escaped}'`], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
    return true;
  }
  const candidates = [
    ["x-terminal-emulator", ["-e", "bash", "-lc", `${line}; exec bash`]],
    ["gnome-terminal", ["--", "bash", "-lc", `${line}; exec bash`]],
    ["konsole", ["-e", "bash", "-lc", `${line}; exec bash`]],
    ["xterm", ["-e", "bash", "-lc", `${line}; exec bash`]],
  ];
  for (const [terminal, terminalArgs] of candidates) {
    const probe = spawnSync("which", [terminal], { stdio: "ignore" });
    if (probe.status === 0) {
      const child = spawn(terminal, terminalArgs, { detached: true, stdio: "ignore" });
      child.unref();
      return true;
    }
  }
  return false;
}

function streamInstall(provider) {
  if (activeInstaller) throw new Error("An installation is already running.");
  environment = refreshEnvironment();
  const spec = installCommand(provider, environment);
  if (!spec) throw new Error("Install Node.js and npm first, then refresh this screen.");
  safeSend("desktop:install", { provider, state: "start", message: spec.label });
  log("Agent installation started", { provider, command: spec.command });
  return new Promise((resolve, reject) => {
    const child = spawn(spec.command, spec.args, { env: desktopEnvironment(), windowsHide: true, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
    activeInstaller = child;
    const forward = (stream, channel) => {
      stream.setEncoding("utf8");
      stream.on("data", (chunk) => safeSend("desktop:install", { provider, state: "log", channel, message: String(chunk).slice(-12000) }));
    };
    forward(child.stdout, "stdout");
    forward(child.stderr, "stderr");
    child.on("error", (error) => {
      activeInstaller = null;
      safeSend("desktop:install", { provider, state: "error", message: error.message });
      log("Agent installation error", error.message);
      reject(error);
    });
    child.on("exit", async (code) => {
      activeInstaller = null;
      environment = refreshEnvironment();
      if (studio) await stopStudio();
      const payload = { provider, state: code === 0 ? "done" : "error", code, message: code === 0 ? `${spec.label} complete.` : `${spec.label} exited with code ${code}.` };
      safeSend("desktop:install", payload);
      log("Agent installation finished", payload);
      if (code === 0) resolve({ environment }); else reject(new Error(payload.message));
    });
  });
}

function setupUpdater() {
  if (!app.isPackaged || isSmokeTest) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  const update = (patch) => {
    updateState = { ...updateState, ...patch };
    safeSend("desktop:update", updateState);
    log("Updater", updateState);
  };
  autoUpdater.on("checking-for-update", () => update({ state: "checking", message: "Checking for updates" }));
  autoUpdater.on("update-available", (info) => update({ state: "available", version: info.version, message: `Downloading ${info.version}` }));
  autoUpdater.on("update-not-available", () => update({ state: "current", version: app.getVersion(), percent: 0, message: "AIgent Desktop is current" }));
  autoUpdater.on("download-progress", (progress) => update({ state: "downloading", percent: Math.round(progress.percent || 0), message: `Downloading update · ${Math.round(progress.percent || 0)}%` }));
  autoUpdater.on("update-downloaded", async (info) => {
    update({ state: "ready", version: info.version, percent: 100, message: `${info.version} is ready to install` });
    if (Notification.isSupported()) new Notification({ title: "AIgent Desktop update ready", body: `Version ${info.version} will install after restart.` }).show();
    const result = await dialog.showMessageBox(mainWindow, { type: "info", buttons: ["Restart and install", "Later"], defaultId: 0, cancelId: 1, title: "Update ready", message: `AIgent Desktop ${info.version} is ready.`, detail: "Your Studio projects are stored outside the application and will not be removed." });
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.on("error", (error) => update({ state: "error", message: error.message }));
}

function buildMenu() {
  const template = [
    ...(process.platform === "darwin" ? [{ label: APP_NAME, submenu: [{ role: "about" }, { type: "separator" }, { label: "Setup & Diagnostics…", click: () => loadSetup("settings") }, { label: "Check for Updates…", click: () => autoUpdater.checkForUpdates().catch((error) => log("Update check failed", error.message)) }, { type: "separator" }, { role: "quit" }] }] : []),
    { label: "File", submenu: [{ label: "Open Studio", accelerator: "CmdOrCtrl+O", click: () => launchStudio().catch((error) => loadSetup("settings", error.message)) }, { label: "Setup & Diagnostics…", accelerator: "CmdOrCtrl+,", click: () => loadSetup("settings") }, { label: "Open workspace", click: () => shell.openPath(config.workspace) }, { type: "separator" }, ...(process.platform === "darwin" ? [{ role: "close" }] : [{ role: "quit" }])] },
    { label: "Edit", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
    { label: "View", submenu: [{ role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools", visible: !app.isPackaged }, { type: "separator" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { role: "togglefullscreen" }] },
    { label: "Help", submenu: [{ label: "Documentation", click: () => shell.openExternal(LINKS.repository) }, { label: "Report a problem", click: () => shell.openExternal(LINKS.support) }, { label: "Open logs", click: () => shell.openPath(path.dirname(logFile())) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function registerIpc() {
  const handlers = {
    "desktop:get-state": async () => windowPayload(),
    "desktop:choose-workspace": async () => {
      const result = await dialog.showOpenDialog(mainWindow, { title: "Choose AIgent Studio workspace", defaultPath: config.workspace, properties: ["openDirectory", "createDirectory", "promptToCreate"] });
      if (result.canceled || !result.filePaths[0]) return null;
      const workspace = ensureWorkspace(result.filePaths[0]);
      saveDesktopConfig({ workspace });
      if (studio) await stopStudio();
      return windowPayload();
    },
    "desktop:save-config": async (_event, patch) => {
      saveDesktopConfig(patch || {});
      return windowPayload();
    },
    "desktop:refresh-environment": async () => { refreshEnvironment(); return windowPayload(); },
    "desktop:install-agent": async (_event, provider) => streamInstall(provider),
    "desktop:authenticate-agent": async (_event, provider) => {
      environment = refreshEnvironment();
      const spec = authCommand(provider, environment);
      if (!spec) throw new Error(`${provider} is not installed yet.`);
      if (!openTerminal(spec.command, spec.args)) throw new Error("No supported terminal application was found.");
      return { launched: true, label: spec.label };
    },
    "desktop:launch-studio": async () => launchStudio(),
    "desktop:stop-studio": async () => { await stopStudio(); return windowPayload(); },
    "desktop:show-setup": async (_event, mode = "settings") => { await loadSetup(mode); return true; },
    "desktop:open-workspace": async () => shell.openPath(config.workspace),
    "desktop:open-logs": async () => { fs.mkdirSync(path.dirname(logFile()), { recursive: true }); return shell.openPath(path.dirname(logFile())); },
    "desktop:open-link": async (_event, key) => {
      const url = LINKS[String(key)];
      if (!url) throw new Error("Unknown documentation link.");
      await shell.openExternal(url);
      return true;
    },
    "desktop:export-diagnostics": async () => {
      environment = refreshEnvironment();
      let recentLog = "";
      try { recentLog = fs.readFileSync(logFile(), "utf8"); } catch { /* empty */ }
      const report = diagnosticsReport({ appVersion: app.getVersion(), config, environment, log: recentLog, extra: { studioUrl, packaged: app.isPackaged, appPath: app.getAppPath() } });
      const result = await dialog.showSaveDialog(mainWindow, { title: "Export AIgent Desktop diagnostics", defaultPath: path.join(app.getPath("downloads"), `AIgent-Desktop-Diagnostics-${new Date().toISOString().slice(0, 10)}.txt`), filters: [{ name: "Text report", extensions: ["txt"] }] });
      if (result.canceled || !result.filePath) return null;
      fs.writeFileSync(result.filePath, report);
      return result.filePath;
    },
    "desktop:repair": async () => {
      log("Repair started");
      ensureWorkspace(config.workspace);
      fs.rmSync(runtimeDirectory(), { recursive: true, force: true });
      const result = internalNodeRun([packagedFile(path.join("scripts", "cli.mjs")), "doctor"], { timeout: 180000 });
      if (result.status !== 0) throw new Error((result.stderr || result.stdout || "AIgent doctor failed").trim());
      environment = refreshEnvironment();
      if (studio) { await stopStudio(); await startStudio(); }
      log("Repair completed", result.stdout.trim());
      return { output: result.stdout.trim(), state: windowPayload() };
    },
    "desktop:check-updates": async () => {
      if (!app.isPackaged) return { ...updateState, state: "development", message: "Updates are available in packaged builds." };
      await autoUpdater.checkForUpdates();
      return updateState;
    },
    "desktop:restart-update": async () => { if (updateState.state === "ready") autoUpdater.quitAndInstall(); return true; },
    "desktop:remove-app-data": async () => {
      const result = await dialog.showMessageBox(mainWindow, { type: "warning", buttons: ["Cancel", "Remove settings and logs"], defaultId: 0, cancelId: 0, title: "Remove AIgent Desktop app data", message: "Remove application settings and logs?", detail: "Your Studio workspace and projects will not be deleted." });
      if (result.response !== 1) return false;
      await stopStudio();
      const workspace = config.workspace;
      fs.rmSync(configFile(), { force: true });
      fs.rmSync(runtimeDirectory(), { recursive: true, force: true });
      fs.rmSync(logFile(), { force: true });
      config = normalizeConfig({ ...defaultConfig({ documents: documentsPath() }), workspace }, { documents: documentsPath() });
      writeConfig(configFile(), config, { documents: documentsPath() });
      environment = refreshEnvironment();
      return true;
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) ipcMain.handle(channel, handler);
}

async function boot() {
  app.setName(APP_NAME);
  app.setAppUserModelId(APP_ID);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  readDesktopConfig();
  refreshEnvironment();
  registerIpc();
  buildMenu();
  setupUpdater();
  mainWindow = createWindow();
  if (isSmokeTest) {
    await loadSetup("smoke");
    const state = windowPayload();
    if (!state.environment.runtime.available || !state.config.workspace) throw new Error("Desktop smoke check failed.");
    setTimeout(() => app.quit(), 400);
    return;
  }
  if (config.onboardingComplete) {
    try { await launchStudio(); }
    catch (error) { log("Automatic Studio launch failed", error.message); await loadSetup("settings", error.message); }
  } else {
    await loadSetup("onboarding");
  }
  if (config.automaticUpdates && app.isPackaged) setTimeout(() => autoUpdater.checkForUpdatesAndNotify().catch((error) => log("Automatic update check failed", error.message)), 6000);
}

if (!lock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) mainWindow = createWindow();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });
  app.whenReady().then(boot).catch((error) => {
    log("Desktop boot failed", error instanceof Error ? error.stack || error.message : String(error));
    dialog.showErrorBox("AIgent Desktop could not start", error instanceof Error ? error.message : String(error));
    app.quit();
  });
  app.on("activate", () => { if (!mainWindow) loadSetup(config?.onboardingComplete ? "settings" : "onboarding"); });
  app.on("before-quit", () => { if (activeInstaller) activeInstaller.kill("SIGTERM"); });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
  app.on("quit", () => { if (studio) studio.close().catch(() => {}); });
}
