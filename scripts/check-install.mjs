#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-consumer-"));
const cli = path.resolve("scripts/cli.mjs");

function run(...args) {
  const result = spawnSync(process.execPath, [cli, ...args, "--target", root], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  return result;
}

try {
  fs.writeFileSync(path.join(root, "PRODUCT.md"), "# Customer Product\n");
  fs.writeFileSync(path.join(root, "DESIGN.md"), "# Customer Design\n");
  fs.writeFileSync(path.join(root, "package.json"), "{\"name\":\"customer-app\"}\n");

  run("install");
  assert.equal(fs.readFileSync(path.join(root, "PRODUCT.md"), "utf8"), "# Customer Product\n");
  assert.equal(fs.readFileSync(path.join(root, "DESIGN.md"), "utf8"), "# Customer Design\n");
  assert.equal(fs.existsSync(path.join(root, "tokens", "system.css")), false, "Default install polluted the project root with Aigent runtime files.");
  assert.equal(fs.existsSync(path.join(root, "scripts", "inspire.mjs")), false, "Default install copied Aigent runtime scripts into the project root.");
  assert.ok(fs.existsSync(path.join(root, ".claude", "skills", "aigent-design", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(root, ".claude", "skills", "aigent-design", "visual-exemplars", "index.json")));
  assert.ok(fs.existsSync(path.join(root, ".aigent", "install.json")));
  assert.match(fs.readFileSync(path.join(root, ".gitignore"), "utf8"), /aigent-runtime-start/);

  run("install");
  run("init");
  assert.ok(fs.existsSync(path.join(root, ".aigent", "project-context.md")));
  assert.equal(fs.readFileSync(path.join(root, "PRODUCT.md"), "utf8"), "# Customer Product\n");

  const skill = path.join(root, ".claude", "skills", "aigent-design", "SKILL.md");
  fs.appendFileSync(skill, "\ncustomer modification\n");
  const blocked = spawnSync(process.execPath, [cli, "install", "--target", root], { encoding: "utf8" });
  assert.notEqual(blocked.status, 0, "Update must refuse to overwrite a customer-modified installed file.");
  assert.match(`${blocked.stdout}\n${blocked.stderr}`, /project-modified files/i);

  run("uninstall");
  assert.ok(fs.existsSync(skill), "Uninstall must preserve a customer-modified installed file.");
  assert.equal(fs.existsSync(path.join(root, ".aigent", "install.json")), false);
  assert.equal(fs.readFileSync(path.join(root, "PRODUCT.md"), "utf8"), "# Customer Product\n");

  console.log("Aigent consumer install check passed: project authority preserved, vendor ownership tracked, updates fail closed, and uninstall preserves modifications.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
