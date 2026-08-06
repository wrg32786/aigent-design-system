#!/usr/bin/env node
import fs from "node:fs";

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(before)) throw new Error(`Missing security marker in ${file}: ${before.slice(0, 100)}`);
  fs.writeFileSync(file, source.replace(before, after));
}

replaceOnce(
  "publish/lib.mjs",
  `  if ([".js", ".mjs", ".cjs"].includes(extension)) {`,
  `  if ([".js", ".mjs", ".cjs", ".html", ".htm", ".svg"].includes(extension)) {`,
);
replaceOnce(
  "publish/lib.mjs",
  `    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;`,
  `    if (fs.existsSync(candidate) && !fs.lstatSync(candidate).isSymbolicLink() && fs.statSync(candidate).isFile()) return candidate;`,
);
replaceOnce(
  "publish/lib.mjs",
  `  if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) throw new Error(\`Publish entry does not exist: \${entryValue}\`);\n  if (blockedRelative(path.relative(projectDirectory, entryFile))) throw new Error("Publish entry is inside a private project directory.");`,
  `  if (!fs.existsSync(entryFile) || !fs.statSync(entryFile).isFile()) throw new Error(\`Publish entry does not exist: \${entryValue}\`);\n  if (fs.lstatSync(entryFile).isSymbolicLink()) throw new Error("Publish entry cannot be a symbolic link.");\n  if (blockedRelative(path.relative(projectDirectory, entryFile))) throw new Error("Publish entry is inside a private project directory.");`,
);
replaceOnce(
  "publish/lib.mjs",
  `    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;\n    visited.add(file);`,
  `    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) continue;\n    visited.add(file);`,
);
replaceOnce(
  "scripts/check-publish.mjs",
  `  const dangerousRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-publish-secret-"));`,
  `  if (process.platform !== "win32") {\n    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-publish-outside-"));\n    try {\n      fs.writeFileSync(path.join(outside, "outside.txt"), "must not ship");\n      fs.symlinkSync(path.join(outside, "outside.txt"), path.join(root, "assets", "outside.txt"));\n      fs.appendFileSync(path.join(root, "templates", "demo", "index.html"), '<a href="../../assets/outside.txt">outside</a>');\n      const symlinkOut = path.join(root, "symlink-out");\n      const symlinkManifest = buildStaticExport({ projectDirectory: root, entry: "/templates/demo/", outputDirectory: symlinkOut });\n      assert.equal(fs.existsSync(path.join(symlinkOut, "assets", "outside.txt")), false);\n      assert.ok(symlinkManifest.warnings.some((warning) => warning.includes("outside.txt")));\n    } finally {\n      fs.rmSync(outside, { recursive: true, force: true });\n    }\n  }\n\n  const dangerousRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aigent-publish-secret-"));`,
);

fs.rmSync("scripts/apply-publish-security.mjs");
console.log("Applied publish symlink and inline-reference protections.");
