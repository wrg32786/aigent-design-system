#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  authSpec,
  buildStaticExport,
  createDeploymentRecord,
  deploySteps,
  parseDeploymentResult,
  publishProviderStatus,
  readPublishState,
  safeDomain,
  safeSiteName,
  upsertDeployment,
  writePublishState,
} from "../publish/lib.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-publish-check-"));
try {
  fs.mkdirSync(path.join(root, "templates", "demo"), { recursive: true });
  fs.mkdirSync(path.join(root, "tokens"), { recursive: true });
  fs.mkdirSync(path.join(root, "assets"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".aigent"), { recursive: true });
  fs.writeFileSync(path.join(root, "templates", "demo", "index.html"), `<!doctype html><html><head><link rel="stylesheet" href="../../tokens/system.css"></head><body><img src="../../assets/hero.svg" alt=""><script type="module" src="./app.js"></script></body></html>`);
  fs.writeFileSync(path.join(root, "templates", "demo", "app.js"), `import "./module.js"; document.documentElement.dataset.ready = "true";`);
  fs.writeFileSync(path.join(root, "templates", "demo", "module.js"), `export const ready = true;`);
  fs.writeFileSync(path.join(root, "tokens", "system.css"), `body{background:url("../assets/noise.svg")}`);
  fs.writeFileSync(path.join(root, "assets", "hero.svg"), `<svg xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20"/></svg>`);
  fs.writeFileSync(path.join(root, "assets", "noise.svg"), `<svg xmlns="http://www.w3.org/2000/svg"><filter id="n"/></svg>`);
  fs.writeFileSync(path.join(root, "docs", "private.md"), "must not ship");
  fs.writeFileSync(path.join(root, ".aigent", "secret.json"), "must not ship");
  fs.writeFileSync(path.join(root, "BRIEF.md"), "must not ship");
  fs.writeFileSync(path.join(root, "robots.txt"), "User-agent: *\nAllow: /\n");

  const out = path.join(root, "out");
  const manifest = buildStaticExport({ projectDirectory: root, entry: "/templates/demo/", outputDirectory: out });
  for (const relative of ["index.html", "templates/demo/index.html", "templates/demo/app.js", "templates/demo/module.js", "tokens/system.css", "assets/hero.svg", "assets/noise.svg", "robots.txt", ".nojekyll"]) {
    assert.ok(fs.existsSync(path.join(out, relative)), `Missing exported file: ${relative}`);
  }
  for (const relative of ["docs/private.md", ".aigent/secret.json", "BRIEF.md"]) assert.equal(fs.existsSync(path.join(out, relative)), false, `Private file was exported: ${relative}`);
  assert.match(fs.readFileSync(path.join(out, "index.html"), "utf8"), /<base href="\.\/templates\/demo\/">/);
  assert.ok(manifest.files.includes("templates/demo/index.html"));
  assert.ok(manifest.bytes > 0);

  assert.equal(safeSiteName(" My Great Site "), "my-great-site");
  assert.equal(safeDomain("https://www.example.com/"), "www.example.com");
  assert.throws(() => safeDomain("localhost"));

  const netlify = deploySteps({ provider: "netlify", mode: "preview", directory: out, siteName: "demo", commit: "abc" });
  assert.equal(netlify.length, 1);
  assert.ok(netlify[0].args.includes("--allow-anonymous"));
  const vercel = deploySteps({ provider: "vercel", mode: "production", directory: out, siteName: "demo", commit: "abc" });
  assert.equal(vercel.length, 2);
  assert.ok(vercel[1].args.includes("--prod"));
  const cloudflare = deploySteps({ provider: "cloudflare", mode: "preview", directory: out, siteName: "demo", commit: "abcdef012345" });
  assert.equal(cloudflare.length, 2);
  assert.equal(cloudflare[0].allowFailure, true);
  assert.ok(authSpec("vercel").args.includes("login"));
  assert.ok(publishProviderStatus().some((provider) => provider.id === "local" && provider.available));

  assert.equal(parseDeploymentResult("netlify", JSON.stringify({ deploy_url: "https://demo.netlify.app", admin_url: "https://app.netlify.com/sites/demo" })).url, "https://demo.netlify.app");
  assert.equal(parseDeploymentResult("vercel", "Inspect: https://vercel.com/x\nProduction: https://demo.vercel.app").url, "https://demo.vercel.app");
  assert.equal(parseDeploymentResult("cloudflare", "Deployment complete! https://abc.demo.pages.dev").url, "https://abc.demo.pages.dev");

  let state = readPublishState(root);
  const record = createDeploymentRecord({ provider: "local", mode: "preview", siteName: "demo", commit: "abc" });
  record.status = "exported";
  record.outputDirectory = out;
  state = upsertDeployment(state, record);
  writePublishState(root, state);
  const restored = readPublishState(root);
  assert.equal(restored.deployments[0].id, record.id);
  assert.equal(restored.lastDeploymentId, record.id);

  const dangerousRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-publish-secret-"));
  try {
    fs.writeFileSync(path.join(dangerousRoot, "index.html"), `<script>const apiKey = "sk-abcdefghijklmnopqrstuvwxyz";</script>`);
    assert.throws(() => buildStaticExport({ projectDirectory: dangerousRoot, entry: "/index.html", outputDirectory: path.join(dangerousRoot, "out") }), /credential/i);
  } finally {
    fs.rmSync(dangerousRoot, { recursive: true, force: true });
  }

  console.log(`AIgent Ship check passed: constrained export, dependency traversal, secret guard, ${publishProviderStatus().length} provider adapters, deployment parsing, and local history.`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
