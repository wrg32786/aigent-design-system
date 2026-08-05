#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { initResolveConfig, resolveDesign } from "./resolve-design.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-resolve-"));
const target = path.join(temporary, "site");
const out = path.join(temporary, "proof");
fs.mkdirSync(target, { recursive: true });

fs.writeFileSync(path.join(target, "index.html"), `<!doctype html>
<html>
<head><style>body{background:#000}a{transition:all .2s}div{animation:pulse 1s infinite}@keyframes pulse{to{opacity:.5}}</style></head>
<body><h1>One</h1><h1>Two</h1><div onclick="void 0">Open</div></body>
</html>`);

const config = initResolveConfig(target);
const first = await resolveDesign({ target, config, out, override: { checks: { browser: false } } });
assert.equal(first.gate.pass, false);
assert.ok(first.totals.errors >= 3);
assert.ok(first.repairContract.topActions.length > 0);
assert.ok(fs.existsSync(path.join(out, "latest.md")));

fs.writeFileSync(path.join(target, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#101714;color:#f3efe4}
a:focus-visible{outline:3px solid #65f4df;outline-offset:3px}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important}}
</style>
</head>
<body><main><h1>Example product</h1><a href="/">Open product</a></main></body>
</html>`);

const second = await resolveDesign({ target, config, out, override: { checks: { browser: false } } });
assert.equal(second.gate.pass, true);
assert.equal(second.totals.errors, 0);
assert.ok(second.comparison.resolved.length > 0);
assert.equal(second.repairContract.topActions.length, 0);

console.log("Resolve loop check passed: failing evidence, ranked repair contract, passing gate, and run comparison.");
