// Contract check for the agent site starter: manifest coverage, licensing
// boundaries, agent instructions, motion safety, and a no-install scaffold.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { auditPaths } from "./design-audit.mjs";
import { buildStaticExport } from "../publish/lib.mjs";
import { createSite, starterFiles } from "./create-site.mjs";

const root = process.cwd();
const starter = path.join(root, "templates", "agent-site-starter");
const read = (relative) => fs.readFileSync(path.join(starter, relative), "utf8");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

// Every template file is shipped by exactly one registry item, and every registry entry exists.
const templateFiles = walk(starter).map((file) => path.relative(root, file).split(path.sep).join("/")).sort();
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
const declared = registry.items
  .filter((item) => item.name === "agent-site-starter" || item.name === "agent-site-remotion-hero")
  .flatMap((item) => item.files.map((file) => file.path))
  .filter((file) => file.startsWith("templates/agent-site-starter/"))
  .sort();
assert.deepEqual(declared, templateFiles, "Registry items agent-site-starter and agent-site-remotion-hero must list every starter template file.");
assert.ok(starterFiles().some((file) => file.relative === "src/styles/tokens.css"), "Starter must receive tokens from tokens/system.css.");
assert.ok(!starterFiles().some((file) => file.relative.startsWith("remotion/")), "Remotion must stay out of the default scaffold.");
assert.ok(starterFiles({ withRemotion: true }).some((file) => file.relative.startsWith("remotion/")), "--with-remotion must add the Remotion folder.");

// GSAP and Remotion are npm dependencies only. Nothing vendored.
for (const file of templateFiles) {
  const base = path.basename(file).toLowerCase();
  assert.ok(!/(^|[./-])(gsap|scrolltrigger|remotion)([.-].*)?\.(m?js|cjs)$/.test(base), `Do not vendor GSAP or Remotion source: ${file}`);
  assert.ok(!file.includes("/node_modules/") && !file.includes("/dist/"), `Build output or dependencies committed: ${file}`);
  const body = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(!/\bGreenSock, Inc\b|@license GSAP|Copyright \(c\) \d{4}.*Remotion/i.test(body), `Third-party source text found in ${file}`);
}
const sitePackage = JSON.parse(read("package.json"));
assert.match(sitePackage.dependencies?.gsap ?? "", /^\^?\d/, "GSAP must be an npm dependency of the site.");
assert.match(sitePackage.dependencies?.astro ?? "", /^\^?\d/, "Astro must be an npm dependency of the site.");
assert.equal(sitePackage.dependencies?.remotion, undefined, "The site must not depend on Remotion at runtime.");
assert.match(sitePackage.scripts?.gates ?? "", /taste .*--strict-warnings/, "The gates script must run the Aigent linter strictly.");
const remotionPackage = JSON.parse(read("remotion/package.json"));
assert.ok(remotionPackage.dependencies?.remotion, "The optional Remotion project must install Remotion from npm.");
assert.match(read("src/site.config.ts"), /heroVideo: null as/, "The Remotion hero loop must be off by default.");

// Motion safety.
const scroll = read("src/scripts/scroll-story.ts");
assert.ok(scroll.includes("prefers-reduced-motion: no-preference"), "Scroll story must only enhance when motion is allowed.");
assert.ok(scroll.includes("gsap.matchMedia") && scroll.includes("mm.revert"), "Scroll story must scope and revert its timeline.");
assert.ok(read("src/components/Hero.astro").includes("prefers-reduced-motion: reduce"), "Hero loop must fall back to a still under reduced motion.");

// Agent instructions.
const agents = read("AGENTS.md");
for (const contract of [".claude/skills/aigent-design/SKILL.md", "craft-floor.md", "copy.md", "gates.md", "gsap-scroll-choreography", "publish-site", "npm run gates", "greensock/gsap-skills", "remotion-dev/skills"]) {
  assert.ok(agents.includes(contract), `Starter AGENTS.md is missing: ${contract}`);
}
assert.ok(read("CLAUDE.md").includes("AGENTS.md"), "Starter CLAUDE.md must point to AGENTS.md.");
assert.ok(read(".cursor/rules/aigent.mdc").includes("AGENTS.md"), "Cursor rule must point to AGENTS.md.");

// License notes must not call GSAP or Remotion MIT.
for (const [label, body] of [["starter README", read("README.md")], ["THIRD_PARTY.md", fs.readFileSync(path.join(root, "THIRD_PARTY.md"), "utf8")]]) {
  assert.ok(/gsap\.com\/standard-license/.test(body), `${label} must cite the GSAP Standard License.`);
  assert.ok(/company license/i.test(body) && /remotion/i.test(body), `${label} must note Remotion's company license.`);
  assert.ok(!/GSAP[^.\n]*\bis MIT\b|Remotion[^.\n]*\bis MIT\b/i.test(body), `${label} must not describe GSAP or Remotion as MIT.`);
}

// Scaffold without network, then lint the scaffolded source.
const target = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-starter-check-"));
const log = console.log;
console.log = () => undefined;
try {
  createSite([path.join(target, "site"), "--no-install", "--theme", "ember", "--with-remotion"]);
} finally {
  console.log = log;
}
const site = path.join(target, "site");
for (const file of ["package.json", ".gitignore", "AGENTS.md", "CLAUDE.md", "src/styles/tokens.css", "src/pages/index.astro", "remotion/package.json",
  ".claude/skills/aigent-design/SKILL.md", ".claude/skills/aigent-design/reference/gates.md", ".claude/skills/gsap-scroll-choreography/SKILL.md",
  ".claude/skills/publish-site/SKILL.md", ".claude/skills/remotion-web-assets/SKILL.md", ".aigent/install.json"]) {
  assert.ok(fs.existsSync(path.join(site, file)), `Scaffold is missing ${file}`);
}
assert.ok(fs.readFileSync(path.join(site, "src/styles/tokens.css")).equals(fs.readFileSync(path.join(root, "tokens/system.css"))), "Scaffolded tokens must match tokens/system.css.");
assert.match(fs.readFileSync(path.join(site, "src/site.config.ts"), "utf8"), /theme: "ember"/, "--theme must set the site theme.");
assert.equal(JSON.parse(fs.readFileSync(path.join(site, "package.json"), "utf8")).name, "site");
assert.throws(() => createSite([site, "--no-install"]), /not empty/, "Scaffold must refuse a non-empty directory without --force.");

const audit = auditPaths([path.join(site, "src")]);
assert.deepEqual(audit.findings, [], `Starter source must pass the design and copy linter:\n${JSON.stringify(audit.findings, null, 2)}`);
fs.rmSync(target, { recursive: true, force: true });

// Full build: in CI (where `npm run check` runs) or with --build. Scaffold with npm install,
// build with Astro, run the audit and copy linter on the source and built HTML, then export.
let built = "";
if (process.env.CI || process.argv.includes("--build")) {
  const buildRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-starter-build-"));
  const buildSite = path.join(buildRoot, "aigent-site");
  console.log = () => undefined;
  try { createSite([buildSite]); } finally { console.log = log; }
  assert.ok(!fs.existsSync(path.join(buildSite, "remotion")), "Default scaffold must not include Remotion.");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawnSync(npm, ["run", "build"], { cwd: buildSite, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  assert.equal(build.status, 0, `Starter build failed:\n${build.stdout}\n${build.stderr}`);
  const entry = path.join(buildSite, "dist", "index.html");
  assert.ok(fs.existsSync(entry), "Starter build did not produce dist/index.html.");
  const builtAudit = auditPaths([path.join(buildSite, "src"), entry]);
  assert.deepEqual(builtAudit.findings, [], `Built starter must pass the design audit and copy linter with no errors or warnings:\n${JSON.stringify(builtAudit.findings, null, 2)}`);
  const exported = buildStaticExport({ projectDirectory: path.join(buildSite, "dist"), entry: "/index.html", outputDirectory: path.join(buildRoot, "export") });
  assert.ok(fs.existsSync(path.join(buildRoot, "export", "index.html")), "publish-site export of the built starter is missing index.html.");
  built = `, built with Astro, linted clean, and exported ${exported.files?.length ?? "its"} files through publish-site`;
  fs.rmSync(buildRoot, { recursive: true, force: true });
}

console.log(`Agent site starter check passed: ${templateFiles.length} template files, npm-only GSAP and Remotion, reduced-motion paths, agent instructions, and a clean scaffold${built}.`);
