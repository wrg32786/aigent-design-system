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

function flag(name) {
  return process.argv.includes(name);
}

const repository = option("--repository", process.env.GITHUB_REPOSITORY || "wrg32786/aigent-design-system");
const requestedTag = option("--tag", `v${packageJson.version}`);
const useLatest = flag("--latest");
const checkDownloads = flag("--download-check");
const jsonOutput = flag("--json");
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

const endpoint = useLatest
  ? `https://api.github.com/repos/${repository}/releases/latest`
  : `https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(requestedTag)}`;
const response = await fetch(endpoint, { headers });
if (!response.ok) {
  throw new Error(`GitHub release ${useLatest ? "latest" : requestedTag} is unavailable for ${repository}: ${response.status} ${await response.text()}`);
}

const release = await response.json();
const tag = release.tag_name || requestedTag;
const assets = new Map((release.assets || []).map((asset) => [asset.name, asset]));
const missing = required.filter((name) => !assets.has(name));
if (missing.length) throw new Error(`Release ${tag} is missing installer assets:\n- ${missing.join("\n- ")}`);

async function verifyDownload(asset) {
  let result = await fetch(asset.browser_download_url, { method: "HEAD", redirect: "follow" });
  if (!result.ok) {
    result = await fetch(asset.browser_download_url, {
      headers: { Range: "bytes=0-0" },
      redirect: "follow",
    });
  }
  const status = result.status;
  const type = result.headers.get("content-type") || "";
  const finalUrl = result.url || asset.browser_download_url;
  await result.body?.cancel().catch(() => {});
  if (!(status >= 200 && status < 400)) {
    throw new Error(`${asset.name} cannot be downloaded publicly: HTTP ${status}`);
  }
  if (/text\/html/i.test(type)) {
    throw new Error(`${asset.name} resolved to HTML instead of an installer (${finalUrl}).`);
  }
  return { status, contentType: type, finalUrl };
}

const verified = [];
for (const name of required) {
  const asset = assets.get(name);
  if (asset.state !== "uploaded") throw new Error(`${name} is not fully uploaded: ${asset.state}`);
  if (!Number.isFinite(asset.size) || asset.size < 1_000_000) throw new Error(`${name} is unexpectedly small: ${asset.size || 0} bytes`);
  if (!asset.browser_download_url) throw new Error(`${name} has no public download URL.`);
  const download = checkDownloads ? await verifyDownload(asset) : null;
  verified.push({
    name,
    size: asset.size,
    url: asset.browser_download_url,
    download,
  });
}

const summary = {
  repository,
  tag,
  releaseUrl: release.html_url,
  publishedAt: release.published_at,
  assets: verified,
};

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} else {
  console.log(`AIgent Desktop release verified: ${tag}`);
  for (const asset of verified) {
    const download = asset.download ? ` · HTTP ${asset.download.status}` : "";
    console.log(`- ${asset.name} · ${(asset.size / 1024 / 1024).toFixed(1)} MB${download} · ${asset.url}`);
  }
}
