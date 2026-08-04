import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPaths, auditSources } from "./design-audit.mjs";

const required = [
  "README.md",
  "PRODUCT.md",
  "DESIGN.md",
  "LICENSE",
  "THIRD_PARTY.md",
  "tokens/system.css",
  "tokens/aigent-tokens.css",
  "modules/motion.js",
  "templates/modular-scroll-starter/index.html",
  "templates/free-design-stack/index.html",
  "templates/spline-scroll-landing/index.html",
  "templates/asset-scroll-gallery/index.html",
  "docs/project-context.md",
  "docs/product-brief.md",
  "docs/roadmap.md",
  "docs/publish-checklist.md",
  "docs/design-principles.md",
  "docs/source-stack-intake.md",
  "docs/cinematic-scroll-deck-playbook.md",
  "docs/awwwards-animation-menu.md",
  "docs/awwwards-animation-menu.html",
  "skills/cinematic-web-director/SKILL.md",
  "skills/aigent-3d-scroll-system/SKILL.md",
  "skills/aigent-landing-page-polish/SKILL.md",
  "skills/aigent-asset-gallery-system/SKILL.md",
  ".github/workflows/validate.yml"
];

const file = (relativePath) => path.join(process.cwd(), relativePath);
const missing = required.filter((relativePath) => !fs.existsSync(file(relativePath)));

if (missing.length) {
  console.error("Missing required files:");
  for (const relativePath of missing) console.error(`- ${relativePath}`);
  process.exit(1);
}

for (const skill of required.filter((relativePath) => relativePath.endsWith("SKILL.md"))) {
  const body = fs.readFileSync(file(skill), "utf8");
  if (!/^---\r?\nname:/.test(body)) {
    console.error(`Invalid skill frontmatter: ${skill}`);
    process.exit(1);
  }
}

const tokenBody = fs.readFileSync(file("tokens/system.css"), "utf8");
for (const token of [
  "--ds-color-bg",
  "--ds-color-text",
  "--ds-color-accent",
  "--ds-scene-progress",
  "--ds-scene-scale",
  '[data-theme="aigent"]',
  '[data-theme="ember"]',
  '[data-theme="cobalt"]',
  '[data-theme="paper"]'
]) {
  assert.ok(tokenBody.includes(token), `Missing system token or theme: ${token}`);
}

const starterBody = fs.readFileSync(file("templates/modular-scroll-starter/index.html"), "utf8");
for (const contract of [
  "../../tokens/system.css",
  "../../modules/motion.js",
  "data-set-theme",
  "data-reveal",
  "docs/project-context.md"
]) {
  assert.ok(starterBody.includes(contract), `Modular starter is missing: ${contract}`);
}

const motion = await import(pathToFileURL(file("modules/motion.js")));
for (const exportName of ["mountScrollProgress", "mountScrollScene", "mountReveals", "mountThemePicker"]) {
  assert.equal(typeof motion[exportName], "function", `Missing motion export: ${exportName}`);
}

const audit = auditPaths([
  file("templates/modular-scroll-starter"),
  file("tokens/system.css")
]);
const auditErrors = audit.findings.filter((item) => item.severity === "error");
assert.deepEqual(auditErrors, [], `Starter design audit failed:\n${JSON.stringify(auditErrors, null, 2)}`);

const detectorProof = auditSources([{
  file: "bad.html",
  source: '<html><head><style>a{transition:all .2s;outline:none}</style></head><body><h1>A</h1><h1>B</h1><div onclick="x()">Go</div></body></html>'
}]);
for (const rule of ["a11y/html-lang", "responsive/viewport", "hierarchy/h1-count", "a11y/nonsemantic-click", "a11y/outline-none", "performance/transition-all"]) {
  assert.ok(detectorProof.some((item) => item.rule === rule), `Design audit self-check missed ${rule}`);
}

console.log("Design system check passed.");
