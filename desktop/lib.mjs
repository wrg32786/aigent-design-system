import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const DESKTOP_VERSION = "1.1.0";
export const APP_NAME = "AIgent Desktop";
export const APP_ID = "xyz.theaigent.desktop";

export const LINKS = Object.freeze({
  repository: "https://github.com/wrg32786/aigent-design-system",
  releases: "https://github.com/wrg32786/aigent-design-system/releases",
  node: "https://nodejs.org/en/download",
  git: "https://git-scm.com/downloads",
  claude: "https://docs.anthropic.com/en/docs/claude-code/getting-started",
  codex: "https://github.com/openai/codex",
  support: "https://github.com/wrg32786/aigent-design-system/issues",
});

const PROVIDERS = new Set(["claude", "codex", "manual"]);
const EXECUTABLE = /^[a-zA-Z0-9._+\-/:\\ ]{1,500}$/;

export function defaultWorkspace(documentsPath = path.join(os.homedir(), "Documents")) {
  return path.join(documentsPath, "AIgent Studio Projects");
}

export function defaultConfig(paths = {}) {
  return {
    schemaVersion: 1,
    onboardingComplete: false,
    workspace: defaultWorkspace(paths.documents),
    preferredAgent: "manual",
    claudePath: "",
    codexPath: "",
    gitPath: "",
    nodePath: "",
    npmPath: "",
    launchAtLogin: false,
    automaticUpdates: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeConfig(value = {}, paths = {}) {
  const defaults = defaultConfig(paths);
  const selectedAgent = PROVIDERS.has(value.preferredAgent) ? value.preferredAgent : defaults.preferredAgent;
  const workspace = path.resolve(String(value.workspace || defaults.workspace));
  return {
    ...defaults,
    ...value,
    schemaVersion: 1,
    onboardingComplete: Boolean(value.onboardingComplete),
    workspace,
    preferredAgent: selectedAgent,
    claudePath: safeExecutable(value.claudePath),
    codexPath: safeExecutable(value.codexPath),
    gitPath: safeExecutable(value.gitPath),
    nodePath: safeExecutable(value.nodePath),
    npmPath: safeExecutable(value.npmPath),
    launchAtLogin: Boolean(value.launchAtLogin),
    automaticUpdates: value.automaticUpdates !== false,
    updatedAt: new Date().toISOString(),
  };
}

function safeExecutable(value) {
  const selected = String(value || "").trim();
  if (!selected) return "";
  return EXECUTABLE.test(selected) ? selected : "";
}

export function readConfig(file, paths = {}) {
  try {
    return normalizeConfig(JSON.parse(fs.readFileSync(file, "utf8")), paths);
  } catch {
    return normalizeConfig({}, paths);
  }
}

export function writeConfig(file, config, paths = {}) {
  const normalized = normalizeConfig(config, paths);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(normalized, null, 2)}\n`, { mode: 0o600 });
  return normalized;
}

export function ensureWorkspace(workspace) {
  const directory = path.resolve(workspace);
  fs.mkdirSync(directory, { recursive: true });
  const probe = path.join(directory, `.aigent-write-check-${process.pid}-${Date.now()}`);
  fs.writeFileSync(probe, "ok\n");
  fs.rmSync(probe, { force: true });
  return directory;
}

export function commonExecutableDirectories(platform = process.platform, home = os.homedir()) {
  const directories = [];
  if (platform === "win32") {
    for (const variable of ["LOCALAPPDATA", "APPDATA", "ProgramFiles", "ProgramFiles(x86)"]) {
      const value = process.env[variable];
      if (value) directories.push(value);
    }
    const local = process.env.LOCALAPPDATA;
    const roaming = process.env.APPDATA;
    if (local) directories.push(path.join(local, "Programs"), path.join(local, "Microsoft", "WinGet", "Links"));
    if (roaming) directories.push(path.join(roaming, "npm"));
    directories.push("C:\\Program Files\\Git\\cmd", "C:\\Program Files\\Git\\bin", "C:\\Program Files\\nodejs");
  } else {
    directories.push(
      "/opt/homebrew/bin",
      "/usr/local/bin",
      "/usr/bin",
      "/bin",
      path.join(home, ".local", "bin"),
      path.join(home, ".npm-global", "bin"),
      path.join(home, ".volta", "bin"),
      path.join(home, ".cargo", "bin"),
    );
    const nvm = process.env.NVM_BIN;
    if (nvm) directories.push(nvm);
  }
  return [...new Set(directories.filter(Boolean))];
}

export function desktopEnvironment(extra = {}) {
  const delimiter = path.delimiter;
  const current = String(extra.PATH || process.env.PATH || "").split(delimiter).filter(Boolean);
  const combined = [...new Set([...commonExecutableDirectories(), ...current])];
  return { ...process.env, ...extra, PATH: combined.join(delimiter), FORCE_COLOR: "0" };
}

function commandProbe(command, env) {
  const tool = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(tool, [command], { encoding: "utf8", env, windowsHide: true, timeout: 4000 });
  if (result.status === 0) return String(result.stdout || "").split(/\r?\n/).map((item) => item.trim()).find(Boolean) || command;
  if (process.platform !== "win32") {
    const shell = process.env.SHELL || "/bin/sh";
    const shellResult = spawnSync(shell, ["-lc", `command -v ${shellQuote(command)}`], { encoding: "utf8", env, windowsHide: true, timeout: 5000 });
    if (shellResult.status === 0) return String(shellResult.stdout || "").trim().split(/\r?\n/)[0] || null;
  }
  return null;
}

export function resolveCommand(command, override = "", env = desktopEnvironment()) {
  const selected = safeExecutable(override);
  if (selected) {
    if (path.isAbsolute(selected) && fs.existsSync(selected)) return selected;
    const resolved = commandProbe(selected, env);
    if (resolved) return resolved;
  }
  return commandProbe(command, env);
}

export function commandInfo(command, args = ["--version"], options = {}) {
  if (!command) return { available: false, command: null, version: null, error: "Not found" };
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env: options.env || desktopEnvironment(),
    windowsHide: true,
    timeout: options.timeout || 8000,
    maxBuffer: 2 * 1024 * 1024,
  });
  const output = String(result.stdout || result.stderr || "").trim().split(/\r?\n/)[0] || null;
  return {
    available: result.status === 0,
    command,
    version: result.status === 0 ? output : null,
    error: result.status === 0 ? null : output || result.error?.message || `Exited ${result.status}`,
  };
}

export function collectEnvironment(config = {}, options = {}) {
  const env = desktopEnvironment(options.env || {});
  const git = resolveCommand("git", config.gitPath, env);
  const node = resolveCommand("node", config.nodePath, env);
  const npm = resolveCommand(process.platform === "win32" ? "npm.cmd" : "npm", config.npmPath, env)
    || resolveCommand("npm", config.npmPath, env);
  const claude = resolveCommand(process.platform === "win32" ? "claude.exe" : "claude", config.claudePath, env)
    || resolveCommand("claude", config.claudePath, env);
  const codex = resolveCommand(process.platform === "win32" ? "codex.exe" : "codex", config.codexPath, env)
    || resolveCommand("codex", config.codexPath, env);
  const gitInfo = commandInfo(git, ["--version"], { env });
  const nodeInfo = commandInfo(node, ["--version"], { env });
  const npmInfo = commandInfo(npm, ["--version"], { env });
  const claudeInfo = commandInfo(claude, ["--version"], { env, timeout: 12000 });
  const codexInfo = commandInfo(codex, ["--version"], { env, timeout: 12000 });
  const gitBash = process.platform === "win32"
    ? ["C:\\Program Files\\Git\\bin\\bash.exe", "C:\\Program Files\\Git\\usr\\bin\\bash.exe"].find((candidate) => fs.existsSync(candidate)) || null
    : null;
  return {
    runtime: { available: true, command: process.execPath, version: process.versions.electron ? `Electron ${process.versions.electron} · Node ${process.versions.node}` : `Node ${process.versions.node}` },
    git: gitInfo,
    node: nodeInfo,
    npm: npmInfo,
    claude: claudeInfo,
    codex: codexInfo,
    gitBash,
    workspace: workspaceStatus(config.workspace),
    platform: { platform: process.platform, arch: process.arch, release: os.release(), version: os.version?.() || "" },
  };
}

export function workspaceStatus(workspace) {
  try {
    const directory = ensureWorkspace(workspace || defaultWorkspace());
    return { available: true, path: directory, version: directory, error: null };
  } catch (error) {
    return { available: false, path: path.resolve(workspace || defaultWorkspace()), version: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export function installCommand(provider, environment) {
  if (!environment?.npm?.available) return null;
  if (provider === "claude") return { command: environment.npm.command, args: ["install", "-g", "@anthropic-ai/claude-code"], label: "Install Claude Code" };
  if (provider === "codex") return { command: environment.npm.command, args: ["install", "-g", "@openai/codex"], label: "Install Codex CLI" };
  return null;
}

export function authCommand(provider, environment) {
  if (provider === "claude" && environment?.claude?.available) return { command: environment.claude.command, args: [], label: "Claude Code sign-in" };
  if (provider === "codex" && environment?.codex?.available) return { command: environment.codex.command, args: ["login"], label: "Codex sign-in" };
  return null;
}

export function shellQuote(value) {
  const selected = String(value ?? "");
  return `'${selected.replace(/'/g, `'"'"'`)}'`;
}

export function windowsQuote(value) {
  const selected = String(value ?? "");
  return `"${selected.replace(/"/g, '\\"')}"`;
}

export function diagnosticsReport({ appVersion, config, environment, log = "", extra = {} }) {
  const redactedConfig = {
    ...config,
    workspace: config.workspace,
    claudePath: config.claudePath || "auto",
    codexPath: config.codexPath || "auto",
  };
  return [
    `${APP_NAME} diagnostics`,
    `Generated: ${new Date().toISOString()}`,
    `App version: ${appVersion || DESKTOP_VERSION}`,
    `Platform: ${process.platform} ${process.arch} ${os.release()}`,
    "",
    "Configuration",
    JSON.stringify(redactedConfig, null, 2),
    "",
    "Environment",
    JSON.stringify(environment, null, 2),
    "",
    "Extra",
    JSON.stringify(extra, null, 2),
    "",
    "Recent log",
    String(log || "").slice(-200000),
    "",
  ].join("\n");
}
