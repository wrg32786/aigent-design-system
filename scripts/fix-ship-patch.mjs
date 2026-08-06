#!/usr/bin/env node
import fs from "node:fs";

const file = "scripts/apply-ship-publish-patch.mjs";
let source = fs.readFileSync(file, "utf8");
source = source.replace(
  "fetch(\\`${base}/api/projects/\\${project.id}/publish\\`)",
  "fetch(\\`\\${base}/api/projects/\\${project.id}/publish\\`)",
);
source = source.replace(
  "fetch(\\`${base}/api/projects/\\${project.id}/publish/export\\`",
  "fetch(\\`\\${base}/api/projects/\\${project.id}/publish/export\\`",
);

const start = source.indexOf("const shipReadme = `");
const endMarker = "\n`;\nreplaceOnce(\"README.md\", `## AIgent Studio 1.0`";
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("Ship README patch block was not found.");
const replacement = `const shipReadme = [
  "## Ship the site",
  "",
  "AIgent Studio now closes the final gap from approved Canvas to a live URL. Open the **Ship** tab to:",
  "",
  "\\`\\`\\`text",
  "DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD",
  "\\`\\`\\`",
  "",
  "The built-in publisher creates a constrained public bundle, blocks unresolved Canvas patches, checkpoints the source, and deploys through **Netlify, Vercel, Cloudflare Pages, or a local export**. Production mode can run Resolve before and after deployment, prepare live Vision captures, record custom-domain follow-up, and redeploy an earlier exact artifact.",
  "",
  "\\`\\`\\`bash",
  "node scripts/publish-site.mjs deploy \\\\",
  "  --provider netlify \\\\",
  "  --mode preview \\\\",
  "  --project-dir . \\\\",
  "  --entry /index.html \\\\",
  "  --site my-site",
  "\\`\\`\\`",
  "",
  "Install the standalone production contract with:",
  "",
  "\\`\\`\\`bash",
  "pnpm dlx shadcn@latest add wrg32786/aigent-design-system/publish-site",
  "\\`\\`\\`",
  "",
  "Provider authentication stays in the official CLI/browser flow; Studio never asks for hosting tokens or secret environment-variable values. See [\\`publish/README.md\\`](publish/README.md).",
].join("\\n");`;
source = `${source.slice(0, start)}${replacement}${source.slice(end + 3)}`;
source = source.replace(
  'fs.rmSync("scripts/apply-ship-publish-patch.mjs");',
  'fs.rmSync("scripts/apply-ship-publish-patch.mjs");\nfs.rmSync("scripts/fix-ship-patch.mjs", { force: true });',
);
fs.writeFileSync(file, source);
console.log("Fixed Ship integration patch syntax.");
