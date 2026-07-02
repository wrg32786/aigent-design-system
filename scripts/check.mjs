import fs from "node:fs";
import path from "node:path";

const required = [
  "README.md",
  "LICENSE",
  "THIRD_PARTY.md",
  "tokens/aigent-tokens.css",
  "templates/free-design-stack/index.html",
  "templates/spline-scroll-landing/index.html",
  "templates/asset-scroll-gallery/index.html",
  "docs/source-stack-intake.md",
  "docs/cinematic-scroll-deck-playbook.md",
  "skills/aigent-3d-scroll-system/SKILL.md",
  "skills/aigent-landing-page-polish/SKILL.md",
  "skills/aigent-asset-gallery-system/SKILL.md"
];

const missing = required.filter((file) => !fs.existsSync(path.join(process.cwd(), file)));

if (missing.length) {
  console.error("Missing required files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

for (const skill of required.filter((file) => file.endsWith("SKILL.md"))) {
  const body = fs.readFileSync(path.join(process.cwd(), skill), "utf8");
  if (!body.startsWith("---\nname:")) {
    console.error(`Invalid skill frontmatter: ${skill}`);
    process.exit(1);
  }
}

console.log("AIgent Design System check passed.");
