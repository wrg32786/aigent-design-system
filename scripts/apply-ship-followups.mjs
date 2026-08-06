#!/usr/bin/env node
import fs from "node:fs";

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(before)) throw new Error(`Missing follow-up marker in ${file}: ${before.slice(0, 100)}`);
  fs.writeFileSync(file, source.replace(before, after));
}

replaceOnce(
  "publish/lib.mjs",
  `  if (provider === "netlify") {\n    const args = ["--yes", "netlify-cli@latest", "deploy", "--dir", directory, "--no-build", "--json", "--site-name", siteName];\n    if (mode === "production") args.push("--prod");\n    else args.push("--allow-anonymous");\n    return [{ label: \`Deploy \${mode} to Netlify\`, command: npx, args }];\n  }\n  if (provider === "vercel") {\n    return [\n      { label: "Link Vercel project", command: npx, args: ["--yes", "vercel@latest", "link", "--cwd", directory, "--yes", "--project", siteName] },\n      { label: \`Deploy \${mode} to Vercel\`, command: npx, args: ["--yes", "vercel@latest", "deploy", "--cwd", directory, "--yes", ...(mode === "production" ? ["--prod"] : [])] },\n    ];\n  }`,
  `  if (provider === "netlify") {\n    const args = ["--yes", "netlify-cli@latest", "deploy", "--dir", directory, "--no-build", "--json"];\n    if (mode === "production") args.push("--site-name", siteName, "--prod");\n    else args.push("--allow-anonymous");\n    return [{ label: \`Deploy \${mode} to Netlify\`, command: npx, args }];\n  }\n  if (provider === "vercel") {\n    return [\n      { label: "Link Vercel project", command: npx, args: ["--yes", "vercel@latest", "link", "--cwd", directory, "--yes", "--project", siteName] },\n      { label: \`Deploy \${mode} to Vercel\`, command: npx, args: ["--yes", "vercel@latest", "deploy", "--cwd", directory, "--yes", ...(mode === "production" ? ["--prod"] : ["--target", "preview"])] },\n    ];\n  }`,
);

replaceOnce(
  "publish/lib.mjs",
  `    for (const match of source.matchAll(/\\b(?:src|href|poster)\\s*=\\s*["']([^"']+)["']/gi)) values.push(match[1]);`,
  `    for (const match of source.matchAll(/\\b(?:src|href|poster|data-src|data-href|data-poster)\\s*=\\s*["']([^"']+)["']/gi)) values.push(match[1]);`,
);

replaceOnce(
  "publish/lib.mjs",
  `    const destination = path.join(outputDirectory, relative);\n    fs.mkdirSync(path.dirname(destination), { recursive: true });\n    fs.copyFileSync(file, destination);\n\n    const extension = path.extname(file).toLowerCase();\n    if (!TEXT_EXTENSIONS.has(extension) || stat.size > 5 * 1024 * 1024) continue;\n    const source = fs.readFileSync(file, "utf8");\n    scanTextForSecrets(relative, source);\n    for (const reference of referencesFrom(source, extension)) {\n      const resolved = resolveCandidate(projectDirectory, file, reference);\n      if (resolved) queue.push(resolved);\n      else if (!reference.startsWith("/") && !reference.includes("\\${")) warnings.push(\`\\${relative}: missing local reference \\${reference}\`);\n    }`,
  `    const extension = path.extname(file).toLowerCase();\n    const inspectText = TEXT_EXTENSIONS.has(extension) && stat.size <= 5 * 1024 * 1024;\n    const source = inspectText ? fs.readFileSync(file, "utf8") : null;\n    if (source != null) scanTextForSecrets(relative, source);\n\n    const destination = path.join(outputDirectory, relative);\n    fs.mkdirSync(path.dirname(destination), { recursive: true });\n    fs.copyFileSync(file, destination);\n\n    if (source == null) continue;\n    for (const reference of referencesFrom(source, extension)) {\n      const resolved = resolveCandidate(projectDirectory, file, reference);\n      if (resolved) queue.push(resolved);\n      else if (!reference.startsWith("/") && !reference.includes("\\${")) warnings.push(\`\\${relative}: missing local reference \\${reference}\`);\n    }`,
);

replaceOnce(
  "scripts/check-publish.mjs",
  `  assert.ok(netlify[0].args.includes("--allow-anonymous"));\n  const vercel = deploySteps({ provider: "vercel", mode: "production", directory: out, siteName: "demo", commit: "abc" });`,
  `  assert.ok(netlify[0].args.includes("--allow-anonymous"));\n  assert.equal(netlify[0].args.includes("--site-name"), false);\n  const netlifyProduction = deploySteps({ provider: "netlify", mode: "production", directory: out, siteName: "demo", commit: "abc" });\n  assert.ok(netlifyProduction[0].args.includes("--site-name"));\n  const vercelPreview = deploySteps({ provider: "vercel", mode: "preview", directory: out, siteName: "demo", commit: "abc" });\n  assert.deepEqual(vercelPreview[1].args.slice(-2), ["--target", "preview"]);\n  const vercel = deploySteps({ provider: "vercel", mode: "production", directory: out, siteName: "demo", commit: "abc" });`,
);

replaceOnce("README.md", `releases/tag/v1.2.0">v1.1.0`, `releases/tag/v1.2.0">v1.2.0`);
replaceOnce("README.md", `See [\`publish/README.md\`](publish/README.md).\n## AIgent Studio 1.0`, `See [\`publish/README.md\`](publish/README.md).\n\n## AIgent Studio 1.0`);
replaceOnce(
  "publish/README.md",
  `| Netlify | anonymous claimable preview or authenticated preview | authenticated deploy | connect in Netlify dashboard |`,
  `| Netlify | anonymous claimable preview | authenticated deploy | connect in Netlify dashboard |`,
);
replaceOnce(
  "publish/README.md",
  `The repository uses \`npx\` to run the current official CLIs instead of adding three hosting SDKs to the application.`,
  `The repository uses \`npx\` to run the current official CLIs instead of adding three hosting SDKs to the application. Netlify anonymous previews must be claimed within the provider's active claim window or they expire; use authenticated production mode for a durable site.`,
);

fs.rmSync("scripts/apply-ship-followups.mjs");
console.log("Applied Ship follow-up fixes.");
