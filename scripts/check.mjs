import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPaths, auditSources } from "./design-audit.mjs";
import { checkAssetManifests } from "./check-assets.mjs";
import { checkCatalogs } from "./check-catalogs.mjs";

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
  "creative-production/README.md",
  "creative-production/catalog.json",
  "creative-production/sources/3d-assets.md",
  "creative-production/sources/video-and-vfx.md",
  "creative-production/sources/ai-generation.md",
  "creative-production/pipelines/video-assets.md",
  "creative-production/pipelines/web-3d-assets.md",
  "creative-production/pipelines/blender.md",
  "creative-production/pipelines/remotion.md",
  "creative-production/pipelines/runtime-selection.md",
  "creative-production/standards/asset-budgets.md",
  "creative-production/standards/provenance.md",
  "creative-production/standards/mobile-fallbacks.md",
  "assets/README.md",
  "assets/manifests/asset-manifest.schema.json",
  "assets/manifests/example.asset-manifest.json",
  "integrations/README.md",
  "integrations/catalog.json",
  "recipes/README.md",
  "skills/README.md",
  "scripts/check-assets.mjs",
  "scripts/check-catalogs.mjs",
  "docs/project-context.md",
  "docs/product-brief.md",
  "docs/roadmap.md",
  "docs/publish-checklist.md",
  "docs/design-principles.md",
  "docs/source-stack-intake.md",
  "docs/cinematic-scroll-deck-playbook.md",
  "docs/awwwards-animation-menu.md",
  "docs/awwwards-animation-menu.html",
  ".github/workflows/validate.yml"
];

const file = (relativePath) => path.join(process.cwd(), relativePath);
const missing = required.filter((relativePath) => !fs.existsSync(file(relativePath)));

if (missing.length) {
  console.error("Missing required files:");
  for (const relativePath of missing) console.error(`- ${relativePath}`);
  process.exit(1);
}

const skillRoot = file("skills");
const skillFiles = fs.readdirSync(skillRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(skillRoot, entry.name, "SKILL.md"))
  .filter((skill) => fs.existsSync(skill))
  .sort();

assert.ok(skillFiles.length >= 17, `Expected at least 17 installable skills; found ${skillFiles.length}.`);

const skillNames = new Set();
for (const skill of skillFiles) {
  const body = fs.readFileSync(skill, "utf8");
  const frontmatter = /^---\r?\nname:\s*([^\r\n]+)\r?\ndescription:\s*([^\r\n]+)\r?\n---/m.exec(body);
  assert.ok(frontmatter, `Invalid skill frontmatter: ${path.relative(process.cwd(), skill)}`);

  const [, name, description] = frontmatter;
  assert.ok(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name), `Skill name must be kebab-case: ${name}`);
  assert.ok(description.trim().length >= 24, `Skill description is too short: ${name}`);
  assert.ok(!skillNames.has(name), `Duplicate skill name: ${name}`);
  skillNames.add(name);

  const directoryName = path.basename(path.dirname(skill));
  assert.equal(name, directoryName, `Skill name and directory differ: ${name} / ${directoryName}`);
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

const catalogFindings = checkCatalogs();
const catalogErrors = catalogFindings.filter((item) => item.severity === "error");
assert.deepEqual(catalogErrors, [], `Catalog validation failed:\n${JSON.stringify(catalogErrors, null, 2)}`);

const assetFindings = checkAssetManifests();
const assetErrors = assetFindings.filter((item) => item.severity === "error");
assert.deepEqual(assetErrors, [], `Asset manifest validation failed:\n${JSON.stringify(assetErrors, null, 2)}`);

const resourceCatalog = JSON.parse(fs.readFileSync(file("creative-production/catalog.json"), "utf8"));
assert.ok(resourceCatalog.resources.length >= 25, "Creative resource catalog is unexpectedly small.");

const integrationCatalog = JSON.parse(fs.readFileSync(file("integrations/catalog.json"), "utf8"));
assert.ok(integrationCatalog.integrations.length >= 8, "Integration catalog is unexpectedly small.");
assert.ok(integrationCatalog.integrations.every((item) => item.required === false), "Neutral core must not require optional integrations.");

const packageJson = JSON.parse(fs.readFileSync(file("package.json"), "utf8"));
for (const script of ["serve", "audit", "assets", "catalogs", "check", "smoke"]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing package script: ${script}`);
}

const readme = fs.readFileSync(file("README.md"), "utf8");
for (const contract of [
  "Direct",
  "Produce",
  "Build",
  "Verify",
  "creative-production/catalog.json",
  "assets/manifests/",
  "integrations/catalog.json",
  "skills/cinematic-studio/"
]) {
  assert.ok(readme.toLowerCase().includes(contract.toLowerCase()), `README is missing production contract: ${contract}`);
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

console.log(`Design system check passed with ${skillFiles.length} skills, ${resourceCatalog.resources.length} resources, and ${integrationCatalog.integrations.length} integrations.`);
