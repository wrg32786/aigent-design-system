import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkTaste } from "./aigent-taste.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-taste-"));
try {
  fs.writeFileSync(path.join(root, "bad.html"), `
    <section class="card"><div class="card">Nested</div></section>
    <h1 class="bg-clip-text">Gradient</h1>
    <style>
      h1 { font-family: Inter, system-ui; background: linear-gradient(90deg, purple, blue); background-clip: text; }
      .a{border-radius:9999px}.b{border-radius:9999px}.c{border-radius:9999px}.d{border-radius:9999px}.e{border-radius:9999px}.f{border-radius:9999px}
    </style>
  `);
  fs.writeFileSync(path.join(root, "good.css"), `.hero{font-family:"Archivo Narrow",sans-serif;color:#f3ede2;background:#07100f}`);

  const result = checkTaste(["."], { root });
  const ids = new Set(result.findings.map((finding) => finding.id));
  for (const id of ["gradient-text", "ai-gradient", "overused-font", "pill-overuse", "nested-cards"]) {
    assert.ok(ids.has(id), `expected ${id}`);
  }
  assert.ok(!result.findings.some((finding) => finding.file === "good.css"), "clean fixture should not produce findings");
  console.log("AIgent Taste self-check passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
