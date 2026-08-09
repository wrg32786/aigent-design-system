import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import "./check-no-ide.mjs";
import "./check-install.mjs";
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
  "skills/aigent-design/reference/publish.md", "skills/aigent-design/visual-exemplars/index.json",
  "design-intelligence/README.md", "design-intelligence/brief.schema.json", "design-intelligence/layouts.json",
  "inspiration/README.md", "inspiration/schemas/design-dna.schema.json", "resolve/README.md", "vision/README.md",
  "creative-production/README.md", "assets/README.md", "publish/README.md",
  "templates/modular-scroll-starter/index.html", "templates/immersive-sales-deck/index.html", "templates/command-center-interface/index.html",
  "templates/threejs-product-stage/index.html", "scripts/cli.mjs", "scripts/check-install.mjs", "scripts/inspire.mjs", ".github/workflows/validate.yml",
];
assert.deepEqual(required.filter((relativePath) => !fs.existsSync(file(relativePath))), [], "Missing required agent-native files.");

const packageJson = JSON.parse(fs.readFileSync(file("package.json"), "utf8"));
assert.equal(packageJson.version, "1.4.0");
assert.equal(packageJson.bin?.["aigent-design"], "scripts/cli.mjs");
for (const script of ["serve", "plan", "inspire", "resolve", "resolve:check", "vision", "vision:check", "audit", "taste", "taste:check", "install:check", "intelligence", "inspiration", "registry", "eval", "check", "smoke", "publish", "publish:check"]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing package script: ${script}`);
}
for (const removed of ["studio", "studio:check", "desktop:start", "desktop:check", "desktop:dist"]) assert.equal(packageJson.scripts?.[removed], undefined);
assert.equal(packageJson.dependencies?.["electron-updater"], undefined);
assert.equal(packageJson.devDependencies?.electron, undefined);

const skillRoot = file("skills");
const skillFiles = fs.readdirSync(skillRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(skillRoot, entry.name, "SKILL.md"))
  .filter((skill) => fs.existsSync(skill));
assert.ok(skillFiles.length >= 20, `Expected a substantial skill library; found ${skillFiles.length}.`);
for (const skill of skillFiles) {
  const body = fs.readFileSync(skill, "utf8");
  assert.ok(/^---\r?\nname:\s*[^\r\n]+\r?\ndescription:\s*[^\r\n]+\r?\n---/m.test(body), `Invalid skill frontmatter: ${path.relative(process.cwd(), skill)}`);
}

const primarySkill = fs.readFileSync(file("skills/aigent-design/SKILL.md"), "utf8");
for (const contract of [
  "Aigent's own brand and examples are never target-project product truth",
  ".aigent/project-context.md",
  ".aigent/design-direction.md",
  "Preservation contract",
  "VARIANCE",
  "setup-browser",
  "npx github:wrg32786/aigent-design-system taste",
  "Vision is a structured review protocol",
]) assert.ok(primarySkill.includes(contract), `Primary skill is missing contract: ${contract}`);
assert.ok(!primarySkill.includes("node scripts/inspire.mjs"), "Primary skill must use package-backed tooling rather than copied runtime scripts.");

const exemplars = JSON.parse(fs.readFileSync(file("skills/aigent-design/visual-exemplars/index.json"), "utf8"));
assert.ok(exemplars.exemplars.length >= 6);
for (const exemplar of exemplars.exemplars) assert.ok(fs.existsSync(file(`skills/aigent-design/visual-exemplars/${exemplar.file}`)));
assert.equal(VISUAL_DIMENSIONS.length, 12);

const motion = await import(pathToFileURL(file("modules/motion.js")));
for (const exportName of ["mountScrollProgress", "mountScrollScene", "mountReveals", "mountThemePicker"]) assert.equal(typeof motion[exportName], "function");

for (const [label, findings] of [
  ["catalog", checkCatalogs()],
  ["asset", checkAssetManifests()],
  ["intelligence", checkIntelligence()],
  ["registry", checkRegistry()],
  ["eval", checkEvals()],
]) {
  assert.deepEqual(findings.filter((item) => item.severity === "error"), [], `${label} validation failed:\n${JSON.stringify(findings, null, 2)}`);
}

const { registry } = readRegistry();
for (const name of ["aigent-design-skill", "inspiration-intelligence", "design-resolver", "vision-critic", "publish-site"]) assert.ok(registry.items.some((item) => item.name === name), `${name} is missing from the registry.`);
const primaryRegistryItem = registry.items.find((item) => item.name === "aigent-design-skill");
assert.equal(primaryRegistryItem.registryDependencies?.length ?? 0, 0, "Primary Aigent install must not pull root-level registry dependencies into customer repos.");
for (const entry of primaryRegistryItem.files) {
  assert.ok(entry.target?.startsWith("~/.claude/skills/aigent-design/"), `Primary Aigent registry file escapes the vendor skill directory: ${entry.target}`);
}
assert.ok(primaryRegistryItem.files.some((entry) => entry.target === "~/.claude/skills/aigent-design/reference/publish.md"), "Primary install must include every reference named by the core skill.");

const resourceCatalog = JSON.parse(fs.readFileSync(file("creative-production/catalog.json"), "utf8"));
assert.ok(resourceCatalog.resources.length >= 25);

const readme = fs.readFileSync(file("README.md"), "utf8");
for (const contract of [
  "Design direction and browser QA for Claude Code",
  "npx --yes --allow-git=all github:wrg32786/aigent-design-system install",
  "npx --yes --allow-git=all github:wrg32786/aigent-design-system init",
  "setup-browser",
  ".aigent/install.json",
  "does **not** contain a magical visual model",
  "Comparative no-skill/Impeccable/Aigent evaluations",
]) assert.ok(readme.includes(contract), `README is missing current product contract: ${contract}`);

const publicSurfaces = ["README.md", "index.html", "vault/index.html", "vault/app.js", "templates/immersive-sales-deck/index.html", "skills/aigent-design/SKILL.md", "skills/aigent-design/reference/publish.md"];
for (const relative of publicSurfaces) {
  const body = fs.readFileSync(file(relative), "utf8");
  for (const retired of ["studio-core", "AIgent Studio", "AIgent Desktop", "aigent-studio", "shadcn@latest add wrg32786/aigent-design-system/studio-core"]) {
    assert.ok(!body.includes(retired), `${relative} still contains retired product path: ${retired}`);
  }
}

const pages = ["index.html", "templates/modular-scroll-starter/index.html", "templates/immersive-sales-deck/index.html", "templates/command-center-interface/index.html", "templates/threejs-product-stage/index.html", "vault/index.html", "inspiration/lab/index.html"];
const audit = auditPaths([...pages.map(file), file("tokens/system.css")]);
assert.deepEqual(audit.findings.filter((item) => item.severity === "error"), [], "Flagship design audit failed.");

const detectorProof = auditSources([{ file: "bad.html", source: '<html><head><style>a{transition:all .2s;outline:none}</style></head><body><h1>A</h1><h1>B</h1><div onclick="x()">Go</div></body></html>' }]);
for (const rule of ["a11y/html-lang", "responsive/viewport", "hierarchy/h1-count", "a11y/nonsemantic-click", "a11y/outline-none", "performance/transition-all"]) assert.ok(detectorProof.some((item) => item.rule === rule), `Design audit self-check missed ${rule}`);

console.log(`Aigent check passed: safe consumer install, ${skillFiles.length} source skills, ${exemplars.exemplars.length} visual exemplars, current public surfaces, browser QA, and agent-native product boundary.`);
