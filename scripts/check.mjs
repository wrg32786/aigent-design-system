import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const required = [
  "README.md",
  "LICENSE",
  "THIRD_PARTY.md",
  "tokens/system.css",
  "tokens/aigent-tokens.css",
  "modules/motion.js",
  "templates/modular-scroll-starter/index.html",
  "templates/free-design-stack/index.html",
  "templates/spline-scroll-landing/index.html",
  "templates/asset-scroll-gallery/index.html",
  "docs/source-stack-intake.md",
  "docs/cinematic-scroll-deck-playbook.md",
  "docs/awwwards-animation-menu.md",
  "docs/awwwards-animation-menu.html",
  "skills/aigent-3d-scroll-system/SKILL.md",
  "skills/aigent-landing-page-polish/SKILL.md",
  "skills/aigent-asset-gallery-system/SKILL.md"
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
  "--ds-scene-scale",
  '[data-theme="aigent"]',
  '[data-theme="paper"]'
]) {
  if (!tokenBody.includes(token)) {
    console.error(`Missing system token or theme: ${token}`);
    process.exit(1);
  }
}

const starterBody = fs.readFileSync(file("templates/modular-scroll-starter/index.html"), "utf8");
for (const contract of [
  "../../tokens/system.css",
  "../../modules/motion.js",
  "data-set-theme",
  "data-reveal"
]) {
  if (!starterBody.includes(contract)) {
    console.error(`Modular starter is missing: ${contract}`);
    process.exit(1);
  }
}

const motion = await import(pathToFileURL(file("modules/motion.js")));
for (const exportName of ["mountScrollScene", "mountReveals", "mountThemePicker"]) {
  if (typeof motion[exportName] !== "function") {
    console.error(`Missing motion export: ${exportName}`);
    process.exit(1);
  }
}

console.log("Design system check passed.");
