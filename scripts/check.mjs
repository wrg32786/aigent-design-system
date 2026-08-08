import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import "./check-no-ide.mjs";
import { auditPaths, auditSources } from "./design-audit.mjs";
import { checkAssetManifests } from "./check-assets.mjs";
import { checkCatalogs } from "./check-catalogs.mjs";
import { checkIntelligence } from "./check-intelligence.mjs";
import { checkRegistry, readRegistry } from "./check-registry.mjs";
import { checkEvals } from "./check-evals.mjs";
import { VISUAL_DIMENSIONS } from "../vision/lib/common.mjs";

const file = (relativePath) => path.join(process.cwd(), relativePath);
const required = [
  "README.md", "CHANGELOG.md", "CONTRIBUTING.md", "SECURITY.md", "PRODUCT.md", "DESIGN.md", "LICENSE", "THIRD_PARTY.md",
  "registry.json", "package.json", "tokens/system.css", "tokens/aigent-tokens.css", "modules/motion.js",
  "skills/aigent-design/SKILL.md", "skills/aigent-design/commands.json", "skills/aigent-design/scripts/context.mjs",
  "skills/aigent-design/reference/shape.md", "skills/aigent-design/reference/inspiration.md", "skills/aigent-design/reference/layout.md",
  "skills/aigent-design/reference/type.md", "skills/aigent-design/reference/color.md", "skills/aigent-design/reference/motion.md",
  "skills/aigent-design/reference/media.md", "skills/aigent-design/reference/interface.md", "skills/aigent-design/reference/deck.md",
  "skills/aigent-design/reference/craft-floor.md", "skills/aigent-design/reference/resolve.md", "skills/aigent-design/reference/vision.md",
  "design-intelligence/README.md", "design-intelligence/brief.schema.json", "design-intelligence/layouts.json",
  "design-intelligence/type-systems.json", "design-intelligence/motion-systems.json", "design-intelligence/interface-systems.json",
  "inspiration/README.md", "inspiration/schemas/design-dna.schema.json", "inspiration/schemas/reference-matrix.schema.json",
  "resolve/README.md", "resolve/resolve.schema.json",
  "vision/README.md", "vision/visual-review-task.schema.json", "vision/visual-review.schema.json",
  "creative-production/README.md", "creative-production/catalog.json",
  "assets/README.md", "assets/manifests/asset-manifest.schema.json",
  "publish/README.md", "publish/providers.json", "publish/lib.mjs",
  "templates/modular-scroll-starter/index.html", "templates/immersive-sales-deck/index.html",
  "templates/command-center-interface/index.html", "templates/threejs-product-stage/index.html",
  "scripts/cli.mjs", "scripts/plan-design.mjs", "scripts/inspire.mjs", "scripts/resolve-design.mjs",
  "scripts/vision-review.mjs", "scripts/design-audit.mjs", "scripts/publish-site.mjs",
  ".github/workflows/validate.yml",
];

const missing = required.filter((relativePath) => !fs.existsSync(file(relativePath)));
assert.deepEqual(missing, [], `Missing required agent-native files:\n${missing.join("\n")}`);

const packageJson = JSON.parse(fs.readFileSync(file("package.json"), "utf8"));
assert.equal(packageJson.bin?.["aigent-design"], "scripts/cli.mjs", "Missing Aigent CLI bin.");
for (const script of ["serve", "plan", "inspire", "resolve", "resolve:check", "vision", "vision:check", "audit", "taste", "taste:check", "assets", "catalogs", "intelligence", "inspiration", "registry", "eval", "score", "check", "smoke", "inspiration:smoke", "capture", "publish", "publish:check"]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing package script: ${script}`);
}
for (const removed of ["studio", "studio:check", "desktop:start", "desktop:check", "desktop:dist"]) {
  assert.equal(packageJson.scripts?.[removed], undefined, `Legacy IDE script must not remain in the product contract: ${removed}`);
}
assert.equal(packageJson.dependencies?.["electron-updater"], undefined, "Electron updater must not remain a runtime dependency.");
assert.equal(packageJson.devDependencies?.electron, undefined, "Electron must not remain a development dependency.");
assert.equal(packageJson.devDependencies?.["electron-builder"], undefined, "electron-builder must not remain a development dependency.");

const skillRoot = file("skills");
const skillFiles = fs.readdirSync(skillRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(skillRoot, entry.name, "SKILL.md"))
  .filter((skill) => fs.existsSync(skill));
assert.ok(skillFiles.length >= 20, `Expected a substantial skill library; found ${skillFiles.length}.`);
for (const skill of skillFiles) {
  const body = fs.readFileSync(skill, "utf8");
  const frontmatter = /^---\r?\nname:\s*([^\r\n]+)\r?\ndescription:\s*([^\r\n]+)\r?\n---/m.exec(body);
  assert.ok(frontmatter, `Invalid skill frontmatter: ${path.relative(process.cwd(), skill)}`);
}

const primarySkill = fs.readFileSync(file("skills/aigent-design/SKILL.md"), "utf8");
assert.ok(primarySkill.includes("Use automatically for requests to design"), "Primary skill must advertise automatic design routing.");
assert.ok(primarySkill.includes("Do not make them memorize Aigent commands"), "Primary skill must keep specialist routing internal.");
assert.ok(primarySkill.includes("Show me 2–3 designs you like"), "Primary skill must help steer users toward useful references.");

assert.equal(VISUAL_DIMENSIONS.length, 12, "Vision critique must retain twelve explicit dimensions.");
assert.equal(new Set(VISUAL_DIMENSIONS.map((item) => item.id)).size, VISUAL_DIMENSIONS.length, "Vision dimensions must be unique.");

const motion = await import(pathToFileURL(file("modules/motion.js")));
for (const exportName of ["mountScrollProgress", "mountScrollScene", "mountReveals", "mountThemePicker"]) {
  assert.equal(typeof motion[exportName], "function", `Missing motion export: ${exportName}`);
}

for (const [label, findings] of [
  ["catalog", checkCatalogs()],
  ["asset", checkAssetManifests()],
  ["intelligence", checkIntelligence()],
  ["registry", checkRegistry()],
  ["eval", checkEvals()],
]) {
  const errors = findings.filter((item) => item.severity === "error");
  assert.deepEqual(errors, [], `${label} validation failed:\n${JSON.stringify(errors, null, 2)}`);
}

const { registry } = readRegistry();
assert.ok(registry.items.some((item) => item.name === "aigent-design-skill"), "Primary Aigent design skill is missing from the registry.");
for (const name of ["inspiration-intelligence", "design-resolver", "vision-critic", "publish-site"]) {
  assert.ok(registry.items.some((item) => item.name === name), `${name} is missing from the registry.`);
}

const resourceCatalog = JSON.parse(fs.readFileSync(file("creative-production/catalog.json"), "utf8"));
assert.ok(resourceCatalog.resources.length >= 25, "Creative resource catalog is unexpectedly small.");

const readme = fs.readFileSync(file("README.md"), "utf8");
for (const contract of [
  "Turn Claude Code into a professional design team for your repo",
  "npx github:wrg32786/aigent-design-system install",
  "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → TASTE → RESOLVE → SEE → POLISH",
  "You do **not** need to know which Aigent skill to invoke",
  "Show me 2–3 sites whose design you like",
  "Claude Code",
  "Aigent Taste",
  "Aigent Resolve",
  "Aigent Vision",
  "Design DNA",
]) {
  assert.ok(readme.includes(contract), `README is missing simple product contract: ${contract}`);
}
for (const retiredPitch of ["Install AIgent Desktop", "Open AIgent Studio", "Download the Windows installer", "Launch AIgent Studio", "studio-core"]) {
  assert.ok(!readme.includes(retiredPitch), `README still contains retired product positioning: ${retiredPitch}`);
}

const pages = [
  "index.html",
  "templates/modular-scroll-starter/index.html",
  "templates/immersive-sales-deck/index.html",
  "templates/command-center-interface/index.html",
  "templates/threejs-product-stage/index.html",
  "vault/index.html",
  "inspiration/lab/index.html",
];
const audit = auditPaths([...pages.map(file), file("tokens/system.css")]);
assert.deepEqual(audit.findings.filter((item) => item.severity === "error"), [], "Flagship design audit failed.");

const detectorProof = auditSources([{
  file: "bad.html",
  source: '<html><head><style>a{transition:all .2s;outline:none}</style></head><body><h1>A</h1><h1>B</h1><div onclick="x()">Go</div></body></html>',
}]);
for (const rule of ["a11y/html-lang", "responsive/viewport", "hierarchy/h1-count", "a11y/nonsemantic-click", "a11y/outline-none", "performance/transition-all"]) {
  assert.ok(detectorProof.some((item) => item.rule === rule), `Design audit self-check missed ${rule}`);
}

console.log(`Aigent agent-native check passed: ${registry.items.length} registry items, ${skillFiles.length} skills, ${resourceCatalog.resources.length} creative resources, one-command install, automatic routing, Taste, Resolve, Vision, Inspiration Intelligence, and browser QA.`);
