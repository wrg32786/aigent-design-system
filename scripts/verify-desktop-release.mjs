#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

function option(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

const repository = option("--repository", process.env.GITHUB_REPOSITORY || "wrg32786/aigent-design-system");
const tag = option("--tag", `v${packageJson.version}`);
const required = [
  "AIgent-Desktop-Setup-Windows-x64.exe",
  "AIgent-Desktop-macOS-Apple-Silicon.dmg",
  "AIgent-Desktop-macOS-Intel.dmg",
];

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "aigent-desktop-release-verifier",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`;
}

const response = await fetch(`https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`, { headers });
if (!response.ok) {
  throw new Error(`GitHub release ${tag} is unavailable for ${repository}: ${response.status} ${await response.text()}`);
}

const release = await response.json();
const assets = new Map((release.assets || []).map((asset) => [asset.name, asset]));
const missing = required.filter((name) => !assets.has(name));
if (missing.length) throw new Error(`Release ${tag} is missing installer assets:\n- ${missing.join("\n- ")}`);

for (const name of required) {
  const asset = assets.get(name);
  if (asset.state !== "uploaded") throw new Error(`${name} is not fully uploaded: ${asset.state}`);
  if (!Number.isFinite(asset.size) || asset.size < 1_000_000) throw new Error(`${name} is unexpectedly small: ${asset.size || 0} bytes`);
  if (!asset.browser_download_url) throw new Error(`${name} has no public download URL.`);
}

console.log(`AIgent Desktop release verified: ${tag}`);
for (const name of required) {
  const asset = assets.get(name);
  console.log(`- ${name} · ${(asset.size / 1024 / 1024).toFixed(1)} MB · ${asset.browser_download_url}`);
}
