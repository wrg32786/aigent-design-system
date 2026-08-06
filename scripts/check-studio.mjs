import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createStudioServer } from "./studio-server.mjs";

const browserMode = process.argv.includes("--browser");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-studio-check-"));
const app = createStudioServer({ projectsRoot: root, port: 0 });

try {
  const address = await app.listen(0);
  const base = `http://127.0.0.1:${address.port}`;
  const status = await fetch(`${base}/api/status`).then((response) => response.json());
  assert.equal(status.version, "0.6.0");
  assert.ok(status.starters.some((item) => item.id === "blank"));

  const createdResponse = await fetch(`${base}/api/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Studio self check",
      starter: "blank",
      description: "A local Studio project used to verify project creation and preview routing.",
      audience: "Maintainers",
      goal: "Verify the Studio workflow",
      request: "Keep this simple.",
      provider: "manual",
    }),
  });
  assert.equal(createdResponse.status, 201);
  const { project } = await createdResponse.json();
  assert.match(project.id, /^[a-z0-9-]+$/);
  assert.equal(project.entry, "/index.html");

  const directory = path.join(root, project.id);
  for (const file of ["studio.project.json", "design-brief.json", "BRIEF.md", "AGENTS.md", "CLAUDE.md", "index.html", "styles.css", "app.js", "PRODUCT.md", "DESIGN.md"]) {
    assert.ok(fs.existsSync(path.join(directory, file)), `Missing Studio project file: ${file}`);
  }

  const preview = await fetch(`${base}/preview/${project.id}/index.html`);
  assert.equal(preview.status, 200);
  assert.match(await preview.text(), /Studio self check/);

  const patched = await fetch(`${base}/api/projects/${project.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ references: "https://example.com\nhttps://example.org", request: "Revise the hero." }),
  }).then((response) => response.json());
  assert.equal(patched.project.references.length, 2);
  assert.equal(patched.project.request, "Revise the hero.");

  const plan = await fetch(`${base}/api/projects/${project.id}/action`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "plan" }),
  }).then((response) => response.json());
  assert.equal(plan.complete, true);
  assert.ok(fs.existsSync(path.join(directory, ".aigent", "design-plan.json")));

  const manual = await fetch(`${base}/api/projects/${project.id}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "manual", prompt: "Improve the first viewport." }),
  }).then((response) => response.json());
  assert.equal(manual.manual, true);
  assert.match(manual.prompt, /BRIEF\.md/);
  assert.match(manual.prompt, /Improve the first viewport/);

  const traversal = await fetch(`${base}/preview/${project.id}/%2e%2e%2fpackage.json`);
  assert.equal(traversal.status, 404);
  const privateFile = await fetch(`${base}/preview/${project.id}/.aigent/design-plan.json`);
  assert.equal(privateFile.status, 404);

  if (browserMode) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const artifacts = path.join(process.cwd(), "artifacts", "studio");
    fs.mkdirSync(artifacts, { recursive: true });
    try {
      for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
        const page = await browser.newPage({ viewport });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.querySelector("#runtime-status")?.dataset.state === "ready");
        await page.waitForFunction(() => document.querySelector("#project-select")?.value === "studio-self-check");
        const frame = page.frameLocator("#preview-frame");
        await frame.locator("h1").waitFor();
        assert.match((await frame.locator("h1").textContent()) || "", /Studio self check/);
        if (viewport.width > 820) {
          await page.locator('[data-viewport="mobile"]').click();
          assert.equal(await page.locator(".preview-stage").getAttribute("data-viewport"), "mobile");
        } else {
          assert.equal(await page.locator(".viewport-switcher").isVisible(), false);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
        assert.equal(overflow, false, `${viewport.name} Studio UI has horizontal overflow.`);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(artifacts, `studio-${viewport.name}.png`), fullPage: true });
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log(`AIgent Studio check passed: project, preview, plan, prompt, path boundaries${browserMode ? ", and responsive UI" : ""}.`);
} finally {
  await app.close();
  fs.rmSync(root, { recursive: true, force: true });
}
