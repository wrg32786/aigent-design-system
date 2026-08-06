import path from "node:path";
import {
  normalizeMode,
  normalizeProvider,
  publishProviderStatus,
  publishStateFile,
  readPublishState,
  safeDomain,
  safeSiteName,
} from "../publish/lib.mjs";

export function createStudioPublishController(dependencies) {
  const {
    projectsRoot,
    projectDirectory,
    readCanvas,
    activeOperations,
    checkpointProject,
    startProcess,
    studioNodeSpec,
    sendJson,
    readBody,
    host,
    getPort,
    previewPath,
  } = dependencies;

  function stateFor(project) {
    const directory = projectDirectory(projectsRoot, project.id);
    const canvas = readCanvas(projectsRoot, project.id);
    return {
      providers: publishProviderStatus(),
      state: readPublishState(directory),
      blockedByCanvas: activeOperations(canvas).length > 0,
      activeCanvasOperations: activeOperations(canvas).length,
      suggestedSiteName: safeSiteName(project.id),
    };
  }

  function publishSpec(project, input, command = "deploy") {
    const directory = projectDirectory(projectsRoot, project.id);
    const provider = normalizeProvider(input.provider || "netlify");
    const mode = normalizeMode(input.mode || "preview");
    const siteName = safeSiteName(input.siteName || project.id);
    const domain = safeDomain(input.domain || "");
    const stateFile = publishStateFile(directory);
    const address = getPort();
    const previewUrl = `http://${host}:${address}/preview/${project.id}${previewPath(project)}`;
    const args = [command, "--project-dir", directory, "--state-file", stateFile];

    if (command === "deploy") {
      const canvas = readCanvas(projectsRoot, project.id);
      if (activeOperations(canvas).length) {
        throw Object.assign(new Error("Distill or clear the Canvas patch journal before publishing."), { statusCode: 409 });
      }
      const checkpoint = checkpointProject(projectsRoot, project.id, `Pre-publish ${provider} ${mode}`, input.author);
      const commit = checkpoint.checkpoints[0]?.id || "local";
      args.push("--provider", provider, "--mode", mode, "--site", siteName, "--entry", project.entry, "--commit", commit, "--preflight-url", previewUrl);
      if (domain) args.push("--domain", domain);
      if (input.verify !== false) args.push("--verify");
      if (input.vision === true) args.push("--vision");
    }

    if (command === "rollback") {
      const canvas = readCanvas(projectsRoot, project.id);
      if (activeOperations(canvas).length) {
        throw Object.assign(new Error("Distill or clear the Canvas patch journal before rolling back a deployment."), { statusCode: 409 });
      }
      const deploymentId = String(input.deploymentId || "").trim();
      if (!/^[A-Za-z0-9-]{8,80}$/.test(deploymentId)) throw Object.assign(new Error("A valid deployment id is required."), { statusCode: 400 });
      const checkpoint = checkpointProject(projectsRoot, project.id, `Pre-rollback ${deploymentId}`, input.author);
      args.push("--deployment", deploymentId, "--commit", checkpoint.checkpoints[0]?.id || "local", "--preflight-url", previewUrl);
      if (input.verify !== false) args.push("--verify");
      if (input.vision === true) args.push("--vision");
    }

    return { provider, mode, siteName, domain, directory, args };
  }

  return {
    async handle({ request, response, method, suffix, project }) {
      if (suffix === "/publish" && method === "GET") {
        sendJson(response, 200, stateFor(project));
        return true;
      }

      if (suffix === "/publish/auth" && method === "POST") {
        const input = await readBody(request);
        const provider = normalizeProvider(input.provider);
        if (provider === "local") {
          sendJson(response, 200, { complete: true, provider, message: "Local export does not require authentication." });
          return true;
        }
        const directory = projectDirectory(projectsRoot, project.id);
        const spec = studioNodeSpec(path.join("scripts", "publish-site.mjs"), ["auth", "--provider", provider, "--project-dir", directory]);
        const task = startProcess(project, { kind: "publish-auth", provider, ...spec });
        sendJson(response, 202, { started: true, provider, runId: task.id });
        return true;
      }

      if (suffix === "/publish/export" && method === "POST") {
        const input = await readBody(request);
        const canvas = readCanvas(projectsRoot, project.id);
        if (activeOperations(canvas).length) throw Object.assign(new Error("Distill or clear the Canvas patch journal before exporting."), { statusCode: 409 });
        const directory = projectDirectory(projectsRoot, project.id);
        const id = `${Date.now()}-export`;
        const output = path.join(directory, ".aigent", "publish", "exports", id);
        const spec = studioNodeSpec(path.join("scripts", "publish-site.mjs"), ["export", "--project-dir", directory, "--entry", project.entry, "--out", output, "--id", id]);
        const task = startProcess(project, { kind: "publish-export", provider: "local", ...spec });
        sendJson(response, 202, { started: true, provider: "local", runId: task.id });
        return true;
      }

      if (suffix === "/publish" && method === "POST") {
        const input = await readBody(request);
        const values = publishSpec(project, input, "deploy");
        const spec = studioNodeSpec(path.join("scripts", "publish-site.mjs"), values.args);
        const task = startProcess(project, { kind: "publish", provider: values.provider, ...spec });
        sendJson(response, 202, { started: true, provider: values.provider, mode: values.mode, runId: task.id });
        return true;
      }

      if (suffix === "/publish/rollback" && method === "POST") {
        const input = await readBody(request);
        const values = publishSpec(project, input, "rollback");
        const spec = studioNodeSpec(path.join("scripts", "publish-site.mjs"), values.args);
        const task = startProcess(project, { kind: "publish-rollback", provider: null, ...spec });
        sendJson(response, 202, { started: true, runId: task.id });
        return true;
      }

      return false;
    },
  };
}
