#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createStudioServer } from "./studio-server.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-agent-context-"));
const studio = createStudioServer({ projectsRoot: root, port: 0 });

try {
  const address = await studio.listen(0);
  const base = `http://127.0.0.1:${address.port}`;
  const created = await fetch(`${base}/api/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Agent context proof",
      starter: "blank",
      description: "A small page used to prove that Studio sends rendered selection context to the agent.",
      request: "Keep the page simple.",
      provider: "manual",
    }),
  }).then((response) => response.json());
  assert.equal(created.project.id, "agent-context-proof");

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#runtime-status")?.dataset.state === "ready");
    await page.waitForFunction(() => document.querySelector("#project-select")?.value === "agent-context-proof");

    await page.locator('button[data-right-tab="agent"]').click();
    await page.locator("#provider-select").selectOption("manual");
    await page.locator('button[data-right-tab="inspector"]').click();

    const frame = page.frameLocator("#preview-frame");
    await frame.locator("h1").waitFor();
    await page.locator('[data-mode="select"]').click();
    await frame.locator("h1").click({ force: true });
    await page.waitForFunction(() => document.querySelector("#selection-label")?.textContent?.includes("Agent context proof"));

    const localPrompt = page.locator("#selection-agent-form");
    await localPrompt.waitFor({ state: "visible" });
    await page.locator("#selection-agent-prompt").fill("Improve the selected heading without changing the rest of the page.");

    const requestPromise = page.waitForRequest((request) => request.url().endsWith("/api/projects/agent-context-proof/run") && request.method() === "POST");
    await localPrompt.locator('button[type="submit"]').click();
    const request = await requestPromise;
    const body = JSON.parse(request.postData() || "{}");

    assert.match(body.prompt, /^Studio rendered scene for the elements the operator clicked:/);
    assert.match(body.prompt, /"mode": "desktop"/);
    assert.match(body.prompt, /"nearbyLayers":/);
    assert.match(body.prompt, /Operator instruction:/);
    assert.match(body.prompt, /Improve the selected heading/);
    assert.ok(Array.isArray(body.selection) && body.selection.length === 1);
    assert.equal(body.selection[0].tag, "h1");
    assert.equal(body.selection[0].role, "heading");
    assert.ok(body.selection[0].bounds?.width > 0);
    assert.ok(body.selection[0].bounds?.height > 0);
    assert.ok(Array.isArray(body.selection[0].classes));
    assert.equal(await page.locator("#include-selection").isChecked(), true);
    assert.deepEqual(errors, []);
    await context.close();
  } finally {
    await browser.close();
  }

  console.log("AIgent Studio agent-context check passed: element-local prompt, clicked DOM node, viewport, bounds, computed properties, nearby layers, and operator instruction were attached to the agent turn.");
} finally {
  await studio.close();
  fs.rmSync(root, { recursive: true, force: true });
}
