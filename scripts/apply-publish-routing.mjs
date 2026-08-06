#!/usr/bin/env node
import fs from "node:fs";

function read(file) { return fs.readFileSync(file, "utf8"); }
function write(file, value) { fs.writeFileSync(file, value); }
function replaceOnce(file, before, after) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`Missing routing marker in ${file}: ${before.slice(0, 100)}`);
  write(file, source.replace(before, after));
}
function appendOnce(file, marker, value) {
  const source = read(file);
  if (!source.includes(marker)) write(file, `${source.trimEnd()}\n${value}\n`);
}

replaceOnce(
  "publish/lib.mjs",
  `const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".svg", ".xml", ".txt", ".webmanifest"]);\nconst PUBLIC_ROOT_FILES = ["robots.txt", "favicon.ico", "favicon.svg", "site.webmanifest", "manifest.webmanifest", "_headers", "_redirects"];`,
  `const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json", ".jsonc", ".toml", ".svg", ".xml", ".txt", ".webmanifest"]);\nconst PUBLIC_ROOT_FILES = ["robots.txt", "favicon.ico", "favicon.svg", "site.webmanifest", "manifest.webmanifest", "404.html", "sitemap.xml", "browserconfig.xml", "vercel.json", "netlify.toml", "wrangler.toml", "wrangler.json", "wrangler.jsonc", "_headers", "_redirects"];`,
);
replaceOnce(
  "publish/lib.mjs",
  `    for (const match of source.matchAll(/new\\s+URL\\(\\s*["']([^"']+)["']\\s*,\\s*import\\.meta\\.url\\s*\\)/g)) values.push(match[1]);`,
  `    for (const match of source.matchAll(/new\\s+URL\\(\\s*["']([^"']+)["']\\s*,\\s*import\\.meta\\.url\\s*\\)/g)) values.push(match[1]);\n    for (const match of source.matchAll(/(?:fetch|new\\s+(?:Worker|SharedWorker|Audio))\\(\\s*["']([^"']+)["']/g)) values.push(match[1]);`,
);
replaceOnce(
  "scripts/publish-site.mjs",
  `      const result = await runCommand(step, { cwd: projectDirectory });`,
  `      const result = await runCommand(step, { cwd: outputDirectory });`,
);
replaceOnce(
  "scripts/publish-site.mjs",
  `      await runCommand(alias, { cwd: projectDirectory });`,
  `      await runCommand(alias, { cwd: outputDirectory });`,
);
appendOnce(".gitignore", ".netlify/", `.netlify/\n.vercel/\n.wrangler/`);

{
  const file = "skills/aigent-design/commands.json";
  const value = JSON.parse(read(file));
  if (!value.commands.some((command) => command.name === "publish")) {
    const index = value.commands.findIndex((command) => command.name === "audit");
    value.commands.splice(index >= 0 ? index : value.commands.length, 0, {
      name: "publish",
      owns: "Checkpoint, export, deploy, verify, domain-connect, record, and safely redeploy a finished website.",
      reference: "reference/publish.md",
    });
  }
  write(file, `${JSON.stringify(value, null, 2)}\n`);
}

replaceOnce(
  "skills/aigent-design/SKILL.md",
  `description: Turn Claude or another coding agent into a professional design studio for a DOM-backed visual canvas, immersive websites, 3D experiences, cinematic decks, product interfaces, inspiration synthesis, creative media, collaboration, ranked repair, and production verification.`,
  `description: Turn Claude or another coding agent into a professional design studio for a DOM-backed visual canvas, immersive websites, 3D experiences, cinematic decks, product interfaces, inspiration synthesis, creative media, collaboration, verified publishing, ranked repair, and production verification.`,
);
replaceOnce(
  "skills/aigent-design/SKILL.md",
  `Use this as the single entry point for the flagship design system. It routes to specialist Studio Canvas, inspiration, video, 3D, GSAP, Spline, Three.js, Remotion, provenance, resolve, and browser-QA skills only when needed.`,
  `Use this as the single entry point for the flagship design system. It routes to specialist Studio Canvas, inspiration, video, 3D, GSAP, Spline, Three.js, Remotion, provenance, publishing, resolve, and browser-QA skills only when needed.`,
);
replaceOnce(
  "skills/aigent-design/SKILL.md",
  `| \`vision\` | open annotated captures, write structured critique, and merge visual judgment with Resolve |\n| \`audit\``,
  `| \`vision\` | open annotated captures, write structured critique, and merge visual judgment with Resolve |\n| \`publish\` | checkpoint, export, deploy, verify, connect domains, and redeploy an exact artifact |\n| \`audit\``,
);
replaceOnce(
  "skills/aigent-design/SKILL.md",
  `- Canvas operations are reversible operator intent until they are deliberately distilled into source.\n- Real browser evidence decides whether the work is mechanically complete.`,
  `- Canvas operations are reversible operator intent until they are deliberately distilled into source.\n- Never publish unresolved Canvas operations or a whole workspace when a constrained public artifact will do.\n- Real browser evidence decides whether the work is mechanically complete.`,
);
replaceOnce(
  "skills/aigent-design/SKILL.md",
  `## Resolve routing\n`,
  `## Publish routing\n\nUse \`publish-site\` and \`reference/publish.md\` after the approved Canvas state has been distilled. Create a checkpoint, export only referenced public dependencies, run preflight Resolve for production, deploy through the selected official provider CLI, verify the public URL, prepare Vision captures when requested, and record the exact artifact for forward redeploy.\n\n## Resolve routing\n`,
);
replaceOnce(
  "skills/aigent-design/SKILL.md",
  `A finished result includes resolved Canvas comments and either an intentionally active patch journal or verified source distillation, product-specific content, a committed visual world, working desktop and mobile states, reduced motion, complete UI states, optimized and manifest-backed media, an influence ledger when references were used, a passing Resolve mechanical gate, a passing structured Vision review, and no unresolved rights or private records.`,
  `A finished result includes resolved Canvas comments and either an intentionally active patch journal or verified source distillation, product-specific content, a committed visual world, working desktop and mobile states, reduced motion, complete UI states, optimized and manifest-backed media, an influence ledger when references were used, a passing Resolve mechanical gate, a passing structured Vision review, no unresolved rights or private records, and—when publishing was requested—a recorded live URL or explicit export artifact.` ,
);

{
  const file = "registry.json";
  const registry = JSON.parse(read(file));
  const item = registry.items.find((entry) => entry.name === "aigent-design-skill");
  if (!item) throw new Error("aigent-design-skill registry item is missing");
  if (!item.files.some((entry) => entry.path === "skills/aigent-design/reference/publish.md")) {
    const index = item.files.findIndex((entry) => entry.path === "skills/aigent-design/reference/canvas.md");
    item.files.splice(index >= 0 ? index + 1 : item.files.length, 0, {
      path: "skills/aigent-design/reference/publish.md",
      type: "registry:file",
      target: "~/.claude/skills/aigent-design/reference/publish.md",
    });
  }
  write(file, `${JSON.stringify(registry, null, 2)}\n`);
}

replaceOnce(
  "scripts/check.mjs",
  `"skills/aigent-design/reference/vision.md", "skills/aigent-design/reference/canvas.md", "skills/design-resolver/SKILL.md"`,
  `"skills/aigent-design/reference/vision.md", "skills/aigent-design/reference/canvas.md", "skills/aigent-design/reference/publish.md", "skills/design-resolver/SKILL.md"`,
);
replaceOnce(
  "scripts/check.mjs",
  `const skillRoot = file("skills");`,
  `const commandCatalog = JSON.parse(fs.readFileSync(file("skills/aigent-design/commands.json"), "utf8"));\nassert.ok(commandCatalog.commands.some((command) => command.name === "publish" && command.reference === "reference/publish.md"), "AIgent Design publish command is missing.");\n\nconst skillRoot = file("skills");`,
);

replaceOnce("README.md", `## AIgent Studio 1.0`, `## AIgent Studio 1.2`);
replaceOnce(
  "README.md",
  `resolve · vision · audit · extract · install · eval`,
  `resolve · vision · publish · audit · extract · install · eval`,
);

fs.rmSync(".github/workflows/apply-ship-followups.yml", { force: true });
fs.rmSync("scripts/apply-publish-routing.mjs");
console.log("Applied final publish routing integration.");
