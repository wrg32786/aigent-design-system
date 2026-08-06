#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "desktop-dist");

function find(directory, predicate) {
  if (!fs.existsSync(directory)) return null;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const selected = path.join(directory, entry.name);
    if (entry.isFile() && predicate(selected)) return selected;
    if (entry.isDirectory()) {
      const nested = find(selected, predicate);
      if (nested) return nested;
    }
  }
  return null;
}

const executable = process.platform === "win32"
  ? find(output, (candidate) => candidate.endsWith(`${path.sep}AIgent Desktop.exe`) && candidate.includes("win-unpacked"))
  : process.platform === "darwin"
    ? find(output, (candidate) => candidate.endsWith(`${path.sep}AIgent Desktop.app${path.sep}Contents${path.sep}MacOS${path.sep}AIgent Desktop`))
    : find(output, (candidate) => candidate.endsWith(`${path.sep}aigent-design-system`) || candidate.endsWith(`${path.sep}AIgent Desktop`));

if (!executable) {
  console.error(`Could not find the packaged AIgent Desktop executable under ${output}.`);
  process.exit(1);
}

const result = spawnSync(executable, ["--smoke-test", ...(process.platform === "linux" ? ["--no-sandbox"] : [])], {
  cwd: path.dirname(executable),
  encoding: "utf8",
  windowsHide: true,
  timeout: 120000,
  maxBuffer: 10 * 1024 * 1024,
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: "1" },
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

console.log(`Packaged AIgent Desktop smoke check passed: ${path.relative(root, executable)}.`);
