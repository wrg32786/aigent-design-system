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
const sloppy = `<html lang="en"><body><h1>Unlock seamless workflows</h1><p>In today's fast-paced world, our cutting-edge platform is built for the modern team.</p><p>Scroll to explore</p><p>A powerful 2,000 W motor in a robust steel frame.</p><script>const seamless = true;</script></body></html>`;
const literal = `<html lang="en"><body><h1>Cedar benches, built to order</h1><p>A powerful 2,000 W motor in a robust steel frame. Unlock the door with your phone.</p></body></html>`;
const good = `.hero{font-family:"Archivo Narrow",sans-serif;color:#f3ede2;background:#07100f}`;

const findings = auditSources([
  { file: "bad.html", source: bad },
  { file: "good.css", source: good },
  { file: "sloppy.html", source: sloppy },
  { file: "literal.html", source: literal },
]).filter(isTasteFinding);
const rules = new Set(findings.map((finding) => finding.rule));

for (const rule of ["taste/gradient-text", "taste/ai-gradient", "taste/overused-display-font", "taste/pill-overuse", "taste/nested-cards"]) {
  assert.ok(rules.has(rule), `expected ${rule}`);
}
assert.ok(!findings.some((finding) => finding.file === "good.css"), "clean fixture should not produce taste findings");
const sloppyRules = new Set(findings.filter((finding) => finding.file === "sloppy.html").map((finding) => finding.rule));
for (const rule of ["taste/copy-slop-word", "taste/copy-stock-phrase", "taste/scroll-cue"]) assert.ok(sloppyRules.has(rule), `expected ${rule} on sloppy copy`);
const slopFinding = findings.find((finding) => finding.file === "sloppy.html" && finding.rule === "taste/copy-slop-word");
assert.match(slopFinding.message, /Found 3\./, "copy linter should ignore script text and literal trade uses");
assert.ok(!findings.some((finding) => finding.file === "literal.html" && finding.rule.startsWith("taste/copy-")), "literal trade uses should not be flagged as slop");
console.log("AIgent Taste self-check passed.");
