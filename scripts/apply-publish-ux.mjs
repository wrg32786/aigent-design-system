#!/usr/bin/env node
import fs from "node:fs";

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(before)) throw new Error(`Missing UX marker in ${file}: ${before.slice(0, 100)}`);
  fs.writeFileSync(file, source.replace(before, after));
}

replaceOnce(
  "studio/publish.js",
  `    await dependencies.api(\`/api/projects/\${project().id}/publish/export\`, { method: "POST", body: { author: dependencies.getAuthor() } });`,
  `    await dependencies.api(\`/api/projects/\${project().id}/publish\`, {\n      method: "POST",\n      body: { provider: "local", mode: "preview", siteName: $("#publish-site-name").value || project().id, verify: false, vision: false, author: dependencies.getAuthor() },\n    });`,
);
replaceOnce(
  "scripts/studio-server.mjs",
  `You are the operating design-and-code agent inside AIgent Studio v1.0.`,
  `You are the operating design-and-code agent inside AIgent Studio v1.2.`,
);
replaceOnce("studio/README.md", `# AIgent Studio 1.0`, `# AIgent Studio 1.2`);
replaceOnce("studio/README.md", `Studio 1.0 includes:`, `Studio 1.2 includes:`);

fs.rmSync("scripts/apply-publish-ux.mjs");
console.log("Applied recorded local export UX.");
