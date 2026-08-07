import assert from "node:assert/strict";
import { auditSources, isTasteFinding } from "./design-audit.mjs";

const bad = `
  <html lang="en"><head><meta name="viewport" content="width=device-width"></head><body>
    <section class="card"><div class="card">Nested</div></section>
    <h1 class="bg-clip-text">Gradient</h1>
    <style>
      h1 { font-family: Inter, system-ui; background: linear-gradient(90deg, purple, blue); background-clip: text; }
      .a{border-radius:9999px}.b{border-radius:9999px}.c{border-radius:9999px}.d{border-radius:9999px}.e{border-radius:9999px}.f{border-radius:9999px}
    </style>
  </body></html>`;
const good = `.hero{font-family:"Archivo Narrow",sans-serif;color:#f3ede2;background:#07100f}`;

const findings = auditSources([
  { file: "bad.html", source: bad },
  { file: "good.css", source: good },
]).filter(isTasteFinding);
const rules = new Set(findings.map((finding) => finding.rule));

for (const rule of ["taste/gradient-text", "taste/ai-gradient", "taste/overused-display-font", "taste/pill-overuse", "taste/nested-cards"]) {
  assert.ok(rules.has(rule), `expected ${rule}`);
}
assert.ok(!findings.some((finding) => finding.file === "good.css"), "clean fixture should not produce taste findings");
console.log("AIgent Taste self-check passed.");
