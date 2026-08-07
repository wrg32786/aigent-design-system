import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudioServer } from "./studio-server.mjs";

const browserMode = process.argv.includes("--browser");
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const relative of ["studio/experience.js", "studio/experience.css"]) {
  assert.ok(fs.existsSync(path.join(repositoryRoot, relative)), `Missing Studio experience file: ${relative}`);
}

const studioClient = fs.readFileSync(path.join(repositoryRoot, "studio", "app.js"), "utf8");
assert.ok(studioClient.includes("aigent-studio-first-project-prompted"), "A new local workspace should open the first-project flow automatically.");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-studio-v1-check-"));
const app = createStudioServer({ projectsRoot: root, port: 0 });

try {
  const address = await app.listen(0);
  const base = `http://127.0.0.1:${address.port}`;
  const status = await fetch(`${base}/api/status`).then((response) => response.json());
  assert.equal(status.version, "1.2.0");
  assert.ok(status.starters.some((item) => item.id === "blank"));

  const createdResponse = await fetch(`${base}/api/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Canvas self check",
      starter: "blank",
      description: "A project used to verify AIgent Canvas, comments, components, history, and preview injection.",
      audience: "Maintainers",
      goal: "Verify the v1 workflow",
      request: "Keep the page intentionally small.",
      provider: "manual",
    }),
  });
  assert.equal(createdResponse.status, 201);
  const { project } = await createdResponse.json();
  assert.equal(project.entry, "/index.html");
  const directory = path.join(root, project.id);
  for (const file of ["studio.project.json", "design-brief.json", "BRIEF.md", "AGENTS.md", "CLAUDE.md", "index.html", "styles.css", "app.js", "PRODUCT.md", "DESIGN.md", ".aigent/studio/canvas.json"]) {
    assert.ok(fs.existsSync(path.join(directory, file)), `Missing Studio project file: ${file}`);
  }

  const preview = await fetch(`${base}/preview/${project.id}/index.html`);
  assert.equal(preview.status, 200);
  const previewHtml = await preview.text();
  assert.match(previewHtml, /Canvas self check/);
  assert.match(previewHtml, /studio\/bridge\.js/);
  assert.match(previewHtml, /__AIGENT_STUDIO_BOOTSTRAP__/);

  let canvas = await fetch(`${base}/api/projects/${project.id}/canvas`).then((response) => response.json());
  assert.equal(canvas.activeOperations.length, 0);
  assert.ok(canvas.tokens.some((token) => token.name === "--ds-color-accent"));

  const operation = await fetch(`${base}/api/projects/${project.id}/canvas/operations`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operation: { kind: "style", nodeIds: ["id-main"], property: "gap", value: "32px", breakpoint: "mobile" }, author: { id: "maintainer", name: "Maintainer", color: "#65f4df" } }),
  }).then((response) => response.json());
  assert.equal(operation.canvas.activeOperations.length, 1);
  assert.equal(operation.canvas.canUndo, true);
  const publishState = await fetch(`${base}/api/projects/${project.id}/publish`).then((response) => response.json());
  assert.equal(publishState.blockedByCanvas, true);
  assert.ok(publishState.providers.some((provider) => provider.id === "local" && provider.available));
  const blockedExport = await fetch(`${base}/api/projects/${project.id}/publish/export`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
  assert.equal(blockedExport.status, 409);

  canvas = await fetch(`${base}/api/projects/${project.id}/canvas/undo`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ author: { id: "maintainer" } }),
  }).then((response) => response.json()).then((value) => value.canvas);
  assert.equal(canvas.activeOperations.length, 0);
  assert.equal(canvas.canRedo, true);
  canvas = await fetch(`${base}/api/projects/${project.id}/canvas/redo`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ author: { id: "maintainer" } }),
  }).then((response) => response.json()).then((value) => value.canvas);
  assert.equal(canvas.activeOperations.length, 1);

  const comment = await fetch(`${base}/api/projects/${project.id}/canvas/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nodeId: "id-main", nodeLabel: "Main content", body: "Increase the hierarchy on mobile.", viewport: "mobile", author: { id: "maintainer", name: "Maintainer", color: "#65f4df" } }),
  }).then((response) => response.json());
  assert.equal(comment.canvas.annotations.length, 1);

  const component = await fetch(`${base}/api/projects/${project.id}/canvas/components`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Proof block", html: '<section class="proof"><h2>Proof</h2></section>', sourceNodeId: "id-main", sourceLabel: "Main content", author: { id: "maintainer", name: "Maintainer", color: "#65f4df" } }),
  }).then((response) => response.json());
  assert.equal(component.canvas.components.length, 1);
  const inserted = await fetch(`${base}/api/projects/${project.id}/canvas/components/${component.component.id}/insert`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetId: "id-main", position: "after", author: { id: "maintainer", name: "Maintainer", color: "#65f4df" } }),
  }).then((response) => response.json());
  assert.equal(inserted.canvas.activeOperations.at(-1).kind, "insert");

  const presence = await fetch(`${base}/api/projects/${project.id}/presence`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ clientId: "maintainer", name: "Maintainer", color: "#65f4df", selectedIds: ["id-main"], viewport: "desktop", mode: "select" }),
  }).then((response) => response.json());
  assert.equal(presence.participants.length, 1);

  const manual = await fetch(`${base}/api/projects/${project.id}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "manual", prompt: "Refine the first viewport.", selection: [{ id: "id-main", tag: "main", label: "Main content" }], commentIds: [comment.comment.id] }),
  }).then((response) => response.json());
  assert.equal(manual.manual, true);
  assert.match(manual.prompt, /Canvas operations currently express approved operator intent/);
  assert.match(manual.prompt, /Increase the hierarchy on mobile/);
  assert.match(manual.prompt, /Refine the first viewport/);

  const checkpoint = await fetch(`${base}/api/projects/${project.id}/canvas/checkpoints`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ label: "Canvas proof", author: { id: "maintainer", name: "Maintainer", color: "#65f4df" } }),
  }).then((response) => response.json());
  assert.equal(checkpoint.canvas.checkpoints.length, 1);
  const diff = await fetch(`${base}/api/projects/${project.id}/diff`).then((response) => response.json());
  assert.equal(typeof diff.diff, "string");

  const traversal = await fetch(`${base}/preview/${project.id}/%2e%2e%2fpackage.json`);
  assert.equal(traversal.status, 404);
  const privateFile = await fetch(`${base}/preview/${project.id}/.aigent/studio/canvas.json`);
  assert.equal(privateFile.status, 404);

  if (browserMode) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        const page = await browser.newPage({ viewport });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.querySelector("#runtime-status")?.dataset.state === "ready");
        await page.waitForFunction(() => document.querySelector("#project-select")?.value === "canvas-self-check");
        await page.waitForFunction(() => document.querySelector(".studio-shell")?.dataset.experience === "simple");
        assert.equal(await page.locator('[data-right-tab="comments"]').isVisible(), false);
        assert.equal(await page.locator('#experience-toggle').textContent(), "Advanced");

        const frame = page.frameLocator("#preview-frame");
        await frame.locator("h1").waitFor();
        assert.match((await frame.locator("h1").textContent()) || "", /Canvas self check/);
        if (viewport.width > 760) await page.locator('[data-mode="select"]').click();
        await frame.locator("h1").click({ force: true });
        await page.waitForFunction(() => document.querySelector("#selection-label")?.textContent?.includes("Canvas self check"));
        await page.waitForFunction(() => document.querySelector("#inspector-fields")?.hidden === false);
        assert.ok((await page.locator("#layers-tree .layer-row").count()) >= 3);

        await page.locator("#experience-toggle").click();
        await page.waitForFunction(() => document.querySelector(".studio-shell")?.dataset.experience === "advanced");
        assert.equal(await page.locator('[data-right-tab="comments"]').isVisible(), true);
        assert.equal(await page.locator('#experience-toggle').textContent(), "Simple");

        await page.locator('[data-right-tab="publish"]').click();
        await page.waitForFunction(() => document.querySelector('[data-right-panel="publish"]')?.hidden === false);
        assert.match((await page.locator("#publish-gate").textContent()) || "", /Publish blocked|Ready to ship/);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
        assert.equal(overflow, false);
        const proofDirectory = path.resolve("artifacts", "studio");
        fs.mkdirSync(proofDirectory, { recursive: true });
        await page.screenshot({ path: path.join(proofDirectory, viewport.width > 760 ? "studio-v1-desktop.png" : "studio-v1-mobile.png"), fullPage: true });
        assert.deepEqual(errors, []);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log(`AIgent Studio v1.2 check passed: project, progressive simple/advanced experience, DOM bridge, Canvas operations, undo/redo, comments, components, presence, checkpoints, agent context, Ship gate, path boundaries${browserMode ? ", and responsive direct selection" : ""}.`);
} finally {
  await app.close();
  fs.rmSync(root, { recursive: true, force: true });
}
