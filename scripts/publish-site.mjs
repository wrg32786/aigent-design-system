#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  PUBLISH_PROVIDERS,
  authSpec,
  buildStaticExport,
  createDeploymentRecord,
  defaultPublishState,
  deploySteps,
  domainStep,
  normalizeMode,
  normalizeProvider,
  parseDeploymentResult,
  publishRoot,
  publishStateFile,
  readPublishState,
  safeDomain,
  safeSiteName,
  upsertDeployment,
  writePublishState,
} from "../publish/lib.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}
function hasFlag(args, name) { return args.includes(name); }
function required(args, name) {
  const value = option(args, name);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function executableScript(relativePath) {
  const packed = path.join(packageRoot, relativePath);
  const marker = `${path.sep}app.asar${path.sep}`;
  const unpacked = packed.includes(marker) ? packed.replace(marker, `${path.sep}app.asar.unpacked${path.sep}`) : packed;
  return fs.existsSync(unpacked) ? unpacked : packed;
}
function nodeSpec(relativePath, args = []) {
  const env = { ...process.env };
  if (process.env.AIGENT_STUDIO_ELECTRON_NODE === "1" || process.versions.electron) env.ELECTRON_RUN_AS_NODE = "1";
  return { command: process.execPath, args: [executableScript(relativePath), ...args], env };
}

function runCommand(spec, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n[ship] ${spec.label || path.basename(spec.command)}`);
    const child = spawn(spec.command, spec.args || [], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(spec.env || {}), FORCE_COLOR: "0" },
      shell: false,
      windowsHide: true,
      stdio: ["inherit", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; process.stdout.write(chunk); });
    child.stderr.on("data", (chunk) => { stderr += chunk; process.stderr.write(chunk); });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      const result = { code: code ?? 1, signal, stdout, stderr };
      if (result.code !== 0 && !spec.allowFailure) reject(Object.assign(new Error(`${spec.label || spec.command} failed with code ${result.code}.`), { result }));
      else resolve(result);
    });
  });
}

async function waitForUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  let lastError = null;
  for (let attempt = 1; attempt <= 18; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (response.ok || response.status < 500) return { status: response.status, url: response.url };
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, Math.min(1000 + attempt * 500, 5000)));
  }
  throw new Error(`Live URL did not become ready: ${lastError?.message || url}`);
}

async function runResolve(projectDirectory, url, outputDirectory, label) {
  const spec = nodeSpec(path.join("scripts", "resolve-design.mjs"), [
    "--target", projectDirectory,
    "--url", url,
    "--out", outputDirectory,
    "--no-fail",
  ]);
  const result = await runCommand({ ...spec, label }, { cwd: packageRoot });
  const reportFile = path.join(outputDirectory, "latest.json");
  if (!fs.existsSync(reportFile)) throw new Error(`${label} did not create a Resolve report.`);
  const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  return { pass: Boolean(report.gate?.pass), score: report.score ?? null, reportFile, runId: report.runId || null, processCode: result.code };
}

async function prepareVision(projectDirectory, url, outputDirectory) {
  const spec = nodeSpec(path.join("scripts", "vision-review.mjs"), [
    "prepare",
    "--target", projectDirectory,
    "--url", url,
    "--out", outputDirectory,
  ]);
  await runCommand({ ...spec, label: "Prepare live AIgent Vision review" }, { cwd: packageRoot });
  return {
    prepared: true,
    taskFile: path.join(outputDirectory, "latest.visual-review-task.json"),
    promptFile: path.join(outputDirectory, "latest.visual-review.prompt.md"),
  };
}

async function deployDirectory({ projectDirectory, stateFile, deployment, outputDirectory, preflightUrl, verify, vision }) {
  let state = readPublishState(projectDirectory, stateFile);
  deployment.outputDirectory = outputDirectory;
  deployment.status = "exported";
  state = upsertDeployment(state, deployment);
  writePublishState(projectDirectory, state, stateFile);

  if (verify && preflightUrl) {
    deployment.status = "preflight";
    state = upsertDeployment(state, deployment);
    writePublishState(projectDirectory, state, stateFile);
    deployment.preflight = await runResolve(projectDirectory, preflightUrl, path.join(publishRoot(projectDirectory), "preflight", deployment.id), "Run pre-deploy Resolve");
    if (!deployment.preflight.pass) throw new Error("Pre-deploy Resolve failed. Repair the local site before publishing.");
  }

  deployment.status = "deploying";
  state = upsertDeployment(state, deployment);
  writePublishState(projectDirectory, state, stateFile);

  if (deployment.provider === "local") {
    deployment.url = pathToFileURL(path.join(outputDirectory, "index.html")).href;
  } else {
    let stdout = "";
    let stderr = "";
    for (const step of deploySteps({
      provider: deployment.provider,
      mode: deployment.mode,
      directory: outputDirectory,
      siteName: deployment.siteName,
      commit: deployment.commit,
    })) {
      const result = await runCommand(step, { cwd: projectDirectory });
      stdout += `\n${result.stdout}`;
      stderr += `\n${result.stderr}`;
    }
    const parsed = parseDeploymentResult(deployment.provider, stdout, stderr);
    deployment.url = parsed.url;
    deployment.dashboardUrl = parsed.dashboardUrl;
    deployment.providerDeploymentId = parsed.deploymentId || null;
    if (!deployment.url) throw new Error(`${PUBLISH_PROVIDERS[deployment.provider].label} did not return a deployment URL.`);
    const alias = domainStep({ provider: deployment.provider, domain: deployment.domain, url: deployment.url });
    if (alias) {
      await runCommand(alias, { cwd: projectDirectory });
      deployment.url = `https://${deployment.domain}`;
    } else if (deployment.domain) {
      deployment.domainAction = `Connect ${deployment.domain} in the ${PUBLISH_PROVIDERS[deployment.provider].label} dashboard.`;
    }
  }

  if (deployment.url && /^https?:\/\//i.test(deployment.url)) {
    deployment.live = await waitForUrl(deployment.url);
    if (verify) {
      deployment.qa = await runResolve(projectDirectory, deployment.url, path.join(publishRoot(projectDirectory), "live-resolve", deployment.id), "Verify live deployment with Resolve");
      if (!deployment.qa.pass) deployment.status = "deployed-with-findings";
    }
    if (vision) deployment.vision = await prepareVision(projectDirectory, deployment.url, path.join(publishRoot(projectDirectory), "live-vision", deployment.id));
  }

  if (deployment.status !== "deployed-with-findings") deployment.status = deployment.provider === "local" ? "exported" : "deployed";
  deployment.completedAt = new Date().toISOString();
  state = upsertDeployment(state, deployment);
  writePublishState(projectDirectory, state, stateFile);
  return deployment;
}

async function auth(args) {
  const provider = normalizeProvider(required(args, "--provider"));
  const spec = authSpec(provider);
  if (!spec) {
    console.log("Local export does not require authentication.");
    return { provider, authenticated: true };
  }
  await runCommand(spec, { cwd: path.resolve(option(args, "--project-dir", process.cwd())) });
  return { provider, authenticationStarted: true };
}

async function exportSite(args) {
  const projectDirectory = path.resolve(option(args, "--project-dir", process.cwd()));
  const entry = option(args, "--entry", "/index.html");
  const id = option(args, "--id", `${Date.now()}-export`);
  const outputDirectory = path.resolve(option(args, "--out", path.join(publishRoot(projectDirectory), "exports", id)));
  const manifest = buildStaticExport({ projectDirectory, entry, outputDirectory });
  console.log(`[ship] Exported ${manifest.files.length} source files (${manifest.bytes} bytes) to ${outputDirectory}`);
  for (const warning of manifest.warnings) console.warn(`[ship] warning: ${warning}`);
  return { id, outputDirectory, manifest };
}

async function deploy(args) {
  const projectDirectory = path.resolve(option(args, "--project-dir", process.cwd()));
  const stateFile = option(args, "--state-file", publishStateFile(projectDirectory));
  const provider = normalizeProvider(required(args, "--provider"));
  const mode = normalizeMode(option(args, "--mode", "preview"));
  const siteName = safeSiteName(option(args, "--site", path.basename(projectDirectory)));
  const domain = safeDomain(option(args, "--domain", ""));
  const commit = option(args, "--commit", "local");
  const entry = option(args, "--entry", "/index.html");
  const verify = hasFlag(args, "--verify");
  const vision = hasFlag(args, "--vision");
  const preflightUrl = option(args, "--preflight-url", null);
  const deployment = createDeploymentRecord({ provider, mode, siteName, domain, commit });
  const outputDirectory = path.join(publishRoot(projectDirectory), "exports", deployment.id);
  let state = readPublishState(projectDirectory, stateFile);
  state = upsertDeployment(state, deployment);
  writePublishState(projectDirectory, state, stateFile);

  try {
    const result = await exportSite(["--project-dir", projectDirectory, "--entry", entry, "--out", outputDirectory, "--id", deployment.id]);
    deployment.manifest = { files: result.manifest.files.length, bytes: result.manifest.bytes, warnings: result.manifest.warnings };
    return await deployDirectory({ projectDirectory, stateFile, deployment, outputDirectory, preflightUrl, verify, vision });
  } catch (error) {
    deployment.status = "failed";
    deployment.error = error instanceof Error ? error.message : String(error);
    deployment.completedAt = new Date().toISOString();
    state = upsertDeployment(readPublishState(projectDirectory, stateFile), deployment);
    writePublishState(projectDirectory, state, stateFile);
    throw error;
  }
}

async function rollback(args) {
  const projectDirectory = path.resolve(option(args, "--project-dir", process.cwd()));
  const stateFile = option(args, "--state-file", publishStateFile(projectDirectory));
  const targetId = required(args, "--deployment");
  const state = readPublishState(projectDirectory, stateFile);
  const target = state.deployments.find((item) => item.id === targetId);
  if (!target) throw new Error(`Deployment not found: ${targetId}`);
  if (!target.outputDirectory || !fs.existsSync(target.outputDirectory)) throw new Error("The recorded deployment artifact is no longer available.");
  const deployment = createDeploymentRecord({
    provider: target.provider,
    mode: target.mode,
    siteName: target.siteName,
    domain: target.domain,
    commit: option(args, "--commit", target.commit),
  });
  deployment.rollbackOf = target.id;
  try {
    return await deployDirectory({
      projectDirectory,
      stateFile,
      deployment,
      outputDirectory: target.outputDirectory,
      preflightUrl: option(args, "--preflight-url", null),
      verify: hasFlag(args, "--verify"),
      vision: hasFlag(args, "--vision"),
    });
  } catch (error) {
    deployment.status = "failed";
    deployment.error = error instanceof Error ? error.message : String(error);
    writePublishState(projectDirectory, upsertDeployment(readPublishState(projectDirectory, stateFile), deployment), stateFile);
    throw error;
  }
}

function help() {
  console.log(`AIgent Ship\n\nCommands:\n  export --project-dir . --entry /index.html [--out dir]\n  auth --provider <netlify|vercel|cloudflare>\n  deploy --provider <local|netlify|vercel|cloudflare> --site name [--mode preview|production] [--domain host] [--verify] [--vision]\n  rollback --project-dir . --deployment id [--verify] [--vision]\n  status --project-dir .\n`);
}

export async function runPublish(args = process.argv.slice(2)) {
  const [command = "help", ...rest] = args;
  let result = null;
  if (command === "auth") result = await auth(rest);
  else if (command === "export") result = await exportSite(rest);
  else if (command === "deploy") result = await deploy(rest);
  else if (command === "rollback") result = await rollback(rest);
  else if (command === "status") {
    const projectDirectory = path.resolve(option(rest, "--project-dir", process.cwd()));
    result = readPublishState(projectDirectory, option(rest, "--state-file", null));
  } else { help(); return null; }
  process.stdout.write(`\n${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  runPublish().catch((error) => {
    console.error(`[ship] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
