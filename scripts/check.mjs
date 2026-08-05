import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPaths, auditSources } from "./design-audit.mjs";
import { checkAssetManifests } from "./check-assets.mjs";
import { checkCatalogs } from "./check-catalogs.mjs";
import { checkIntelligence } from "./check-intelligence.mjs";
import { checkRegistry, readRegistry } from "./check-registry.mjs";
import { checkEvals } from "./check-evals.mjs";

const required = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "PRODUCT.md",
  "DESIGN.md",
  "LICENSE",
  "THIRD_PARTY.md",
  "registry.json",
  "package.json",
  "tokens/system.css",
  "tokens/aigent-tokens.css",
  "modules/motion.js",
  "templates/modular-scroll-starter/index.html",
  "templates/immersive-sales-deck/index.html",
  "templates/command-center-interface/index.html",
  "templates/threejs-product-stage/index.html",
  "templates/free-design-stack/index.html",
  "templates/spline-scroll-landing/index.html",
  "templates/asset-scroll-gallery/index.html",
  "patterns/README.md",
  "patterns/guided-deck/guided-deck.js",
  "patterns/guided-deck/guided-deck.css",
  "patterns/command-palette/command-palette.js",
  "patterns/command-palette/command-palette.css",
  "patterns/focus-reveal/focus-reveal.js",
  "patterns/focus-reveal/focus-reveal.css",
  "patterns/scene-stage/scene-stage.js",
  "patterns/scene-stage/scene-stage.css",
  "patterns/object-stage/object-stage.js",
  "patterns/object-stage/object-stage.css",
  "design-intelligence/README.md",
  "design-intelligence/brief.schema.json",
  "design-intelligence/example-brief.json",
  "design-intelligence/layouts.json",
  "design-intelligence/type-systems.json",
  "design-intelligence/motion-systems.json",
  "design-intelligence/component-sources.json",
  "design-intelligence/interface-systems.json",
  "inspiration/README.md",
  "inspiration/schemas/source.schema.json",
  "inspiration/schemas/design-dna.schema.json",
  "inspiration/schemas/motion-dna.schema.json",
  "inspiration/schemas/reference-matrix.schema.json",
  "inspiration/schemas/influence-ledger.schema.json",
  "inspiration/lib/common.mjs",
  "inspiration/lib/store.mjs",
  "inspiration/lib/design-dna.mjs",
  "inspiration/lib/url-forensics.mjs",
  "inspiration/lib/file-forensics.mjs",
  "inspiration/lib/synthesis.mjs",
  "inspiration/lib/originality.mjs",
  "inspiration/lib/report.mjs",
  "inspiration/examples/editorial-reference.json",
  "inspiration/examples/immersive-reference.json",
  "inspiration/examples/interface-reference.json",
  "inspiration/lab/index.html",
  "inspiration/lab/app.js",
  "inspiration/fixtures/site/index.html",
  "inspiration/evals/README.md",
  "inspiration/evals/rubric.json",
  "resolve/README.md",
  "resolve/resolve.schema.json",
  "resolve/example.resolve.json",
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
  "skills/aigent-design/SKILL.md",
  "skills/aigent-design/commands.json",
  "skills/aigent-design/scripts/context.mjs",
  "skills/aigent-design/reference/shape.md",
  "skills/aigent-design/reference/inspiration.md",
  "skills/aigent-design/reference/color.md",
  "skills/aigent-design/reference/layout.md",
  "skills/aigent-design/reference/type.md",
  "skills/aigent-design/reference/motion.md",
  "skills/aigent-design/reference/media.md",
  "skills/aigent-design/reference/interface.md",
  "skills/aigent-design/reference/deck.md",
  "skills/aigent-design/reference/craft-floor.md",
  "skills/aigent-design/reference/resolve.md",
  "skills/design-resolver/SKILL.md",
  "skills/design-forensics/SKILL.md",
  "skills/reference-synthesis/SKILL.md",
  "skills/inspiration-originality-audit/SKILL.md",
  "evals/README.md",
  "evals/rubric.json",
  "evals/review.schema.json",
  "case-studies/README.md",
  "case-studies/theaigent-home/README.md",
  "case-studies/tools-vault/README.md",
  "vault/index.html",
  "vault/app.js",
  "scripts/cli.mjs",
  "scripts/inspire.mjs",
  "scripts/check-inspiration.mjs",
  "scripts/inspiration-smoke.mjs",
  "scripts/resolve-design.mjs",
  "scripts/check-resolve.mjs",
  "scripts/plan-design.mjs",
  "scripts/check-intelligence.mjs",
  "scripts/check-registry.mjs",
  "scripts/check-evals.mjs",
  "scripts/score-design.mjs",
  "scripts/capture.mjs",
  "scripts/check-assets.mjs",
  "scripts/check-catalogs.mjs",
  "docs/project-context.md",
  "docs/product-brief.md",
  "docs/roadmap.md",
  "docs/publish-checklist.md",
  "docs/design-principles.md",
  "docs/source-stack-intake.md",
  "docs/cinematic-scroll-deck-playbook.md",
  ".github/workflows/validate.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/pattern.yml",
  ".github/ISSUE_TEMPLATE/bug.yml",
  ".github/ISSUE_TEMPLATE/source-correction.yml",
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

assert.ok(skillFiles.length >= 22, `Expected at least 22 installable skills; found ${skillFiles.length}.`);
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
  assert.equal(name, path.basename(path.dirname(skill)), `Skill name and directory differ: ${name}`);
}
for (const name of [
  "aigent-design",
  "design-forensics",
  "reference-synthesis",
  "inspiration-originality-audit",
  "design-resolver",
]) {
  assert.ok(skillNames.has(name), `Required skill is missing: ${name}`);
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
  '[data-theme="paper"]',
]) {
  assert.ok(tokenBody.includes(token), `Missing system token or theme: ${token}`);
}

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
assert.ok(registry.items.length >= 14, "Installable registry is unexpectedly small.");
assert.ok(
  registry.items.some((item) => item.name === "inspiration-intelligence"),
  "Inspiration Intelligence is missing from the registry.",
);
assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");
assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");
assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");
assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");
assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");
const fullStudio = registry.items.find((item) => item.name === "full-studio");
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/inspiration-intelligence")),
  "full-studio must install Inspiration Intelligence.",
);
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),
  "full-studio must install Design Resolver.",
);
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),
  "full-studio must install Design Resolver.",
);
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),
  "full-studio must install Design Resolver.",
);
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),
  "full-studio must install Design Resolver.",
);
assert.ok(
  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),
  "full-studio must install Design Resolver.",
);

const resourceCatalog = JSON.parse(fs.readFileSync(file("creative-production/catalog.json"), "utf8"));
assert.ok(resourceCatalog.resources.length >= 25, "Creative resource catalog is unexpectedly small.");
const integrationCatalog = JSON.parse(fs.readFileSync(file("integrations/catalog.json"), "utf8"));
assert.ok(integrationCatalog.integrations.length >= 8, "Integration catalog is unexpectedly small.");
assert.ok(
  integrationCatalog.integrations.every((item) => item.required === false),
  "Neutral core must not require optional integrations.",
);

const packageJson = JSON.parse(fs.readFileSync(file("package.json"), "utf8"));
assert.equal(packageJson.version, "0.4.0", "Expected package version 0.4.0.");
assert.equal(packageJson.bin?.["aigent-design"], "scripts/cli.mjs", "Missing CLI bin.");
for (const script of [
  "serve",
  "plan",
  "inspire",
  "audit",
  "assets",
  "catalogs",
  "intelligence",
  "inspiration",
  "resolve",
  "resolve:check",
  "registry",
  "eval",
  "score",
  "check",
  "smoke",
  "inspiration:smoke",
  "capture",
]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing package script: ${script}`);
}

const readme = fs.readFileSync(file("README.md"), "utf8");
for (const contract of [
  "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE",
  "shadcn@latest add wrg32786/aigent-design-system/studio-core",
  "shadcn@latest add wrg32786/aigent-design-system/inspiration-intelligence",
  "Design DNA",
  "influence ledger",
  "AIgent Resolve",
  "design-resolver",
  "resolve:check",
  "inspiration:smoke",
  "templates/immersive-sales-deck/",
  "templates/command-center-interface/",
  "templates/threejs-product-stage/",
  "vault/",
]) {
  assert.ok(readme.includes(contract), `README is missing product contract: ${contract}`);
}

const pages = [
  "index.html",
  "templates/modular-scroll-starter/index.html",
  "templates/immersive-sales-deck/index.html",
  "templates/command-center-interface/index.html",
  "templates/threejs-product-stage/index.html",
  "vault/index.html",
  "inspiration/lab/index.html",
  "inspiration/fixtures/site/index.html",
];
const audit = auditPaths([...pages.map(file), file("tokens/system.css")]);
const auditErrors = audit.findings.filter((item) => item.severity === "error");
assert.deepEqual(auditErrors, [], `Flagship design audit failed:\n${JSON.stringify(auditErrors, null, 2)}`);

const detectorProof = auditSources([{
  file: "bad.html",
  source: '<html><head><style>a{transition:all .2s;outline:none}</style></head><body><h1>A</h1><h1>B</h1><div onclick="x()">Go</div></body></html>',
}]);
for (const rule of [
  "a11y/html-lang",
  "responsive/viewport",
  "hierarchy/h1-count",
  "a11y/nonsemantic-click",
  "a11y/outline-none",
  "performance/transition-all",
]) {
  assert.ok(detectorProof.some((item) => item.rule === rule), `Design audit self-check missed ${rule}`);
}

console.log(
  `Design system check passed with ${registry.items.length} registry items, ${skillFiles.length} skills, ${resourceCatalog.resources.length} resources, ${integrationCatalog.integrations.length} integrations, Inspiration Intelligence, and AIgent Resolve v0.4.0.`,
);
