import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const supported = new Set([".html", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".astro", ".vue", ".svelte"]);

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function finding(file, source, match, rule, severity, message) {
  return {
    file,
    line: lineOf(source, match.index ?? 0),
    rule,
    severity,
    message,
  };
}

function collectFiles(targets) {
  const files = [];

  function visit(target) {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(target)) visit(path.join(target, entry));
      return;
    }
    if (supported.has(path.extname(target).toLowerCase())) files.push(target);
  }

  for (const target of targets) {
    if (!fs.existsSync(target)) throw new Error(`Audit target not found: ${target}`);
    visit(target);
  }

  return [...new Set(files)].sort();
}

export function auditSources(entries) {
  const findings = [];
  const corpus = entries.map(({ source }) => source).join("\n");
  const hasMotion = /\b(animation|transition|mountScrollScene|mountReveals|requestAnimationFrame)\b/.test(corpus);
  const hasInteractive = /<(a|button|input|select|textarea)\b/i.test(corpus);

  for (const { file, source } of entries) {
    const ext = path.extname(file).toLowerCase();

    if (ext === ".html") {
      if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(source)) {
        findings.push({ file, line: 1, rule: "a11y/html-lang", severity: "error", message: "Add a language to the html element." });
      }

      if (!/<meta\b[^>]*name=["']viewport["']/i.test(source)) {
        findings.push({ file, line: 1, rule: "responsive/viewport", severity: "error", message: "Add a responsive viewport meta tag." });
      }

      const h1s = [...source.matchAll(/<h1\b/gi)];
      if (h1s.length !== 1) {
        findings.push({ file, line: h1s[0] ? lineOf(source, h1s[0].index) : 1, rule: "hierarchy/h1-count", severity: "error", message: `Expected one h1; found ${h1s.length}.` });
      }

      for (const match of source.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)) {
        findings.push(finding(file, source, match, "a11y/image-alt", "error", "Image is missing alt text. Use alt=\"\" for decorative images."));
      }

      for (const match of source.matchAll(/<(div|span)\b[^>]*\bonclick=/gi)) {
        findings.push(finding(file, source, match, "a11y/nonsemantic-click", "error", "Use a button or link for click behavior."));
      }

      for (const match of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
        if (!/\brel=["'][^"']*noopener/i.test(match[0])) {
          findings.push(finding(file, source, match, "security/blank-rel", "error", "External target=_blank link needs rel=\"noopener noreferrer\"."));
        }
      }

      const eyebrowCount = (source.match(/\bds-eyebrow\b/g) || []).length;
      if (eyebrowCount > 1) {
        findings.push({ file, line: 1, rule: "taste/repeated-eyebrow", severity: "warning", message: `Found ${eyebrowCount} ds-eyebrow uses. Repeated labels above headings often flatten hierarchy.` });
      }

      const panelCount = (source.match(/\bds-panel\b/g) || []).length;
      if (panelCount >= 3 && /grid-template-columns\s*:\s*repeat\(3/i.test(source)) {
        findings.push({ file, line: 1, rule: "taste/identical-card-grid", severity: "warning", message: "A three-column panel grid may be acting as the page scaffold. Verify that the content truly needs cards." });
      }

      for (const match of source.matchAll(/\b(lorem ipsum|placeholder copy|coming soon\.\.\.)\b/gi)) {
        findings.push(finding(file, source, match, "content/placeholder", "warning", "Replace placeholder copy with product-specific language."));
      }
    }

    for (const match of source.matchAll(/transition\s*:\s*all\b/gi)) {
      findings.push(finding(file, source, match, "performance/transition-all", "warning", "Transition explicit properties instead of all."));
    }

    for (const match of source.matchAll(/outline\s*:\s*(?:none|0(?:\s|;|$))/gi)) {
      findings.push(finding(file, source, match, "a11y/outline-none", "error", "Do not remove focus outlines without an intentional replacement."));
    }

    for (const match of source.matchAll(/\b(?:bounce|elastic)(?:\.out|\.in|\.inOut)?\b/gi)) {
      findings.push(finding(file, source, match, "motion/bounce-easing", "warning", "Bounce or elastic easing needs a product-specific physical reason."));
    }

    for (const match of source.matchAll(/(?:background-clip|-webkit-background-clip)\s*:\s*text/gi)) {
      findings.push(finding(file, source, match, "taste/gradient-text", "warning", "Gradient text is a common generated-design default. Use weight, size, or a solid role color unless the brief earns it."));
    }

    for (const match of source.matchAll(/background(?:-color)?\s*:\s*(?:#000(?:000)?\b|rgb\(\s*0[ ,]+0[ ,]+0\s*\))/gi)) {
      findings.push(finding(file, source, match, "taste/pure-black-background", "warning", "Tint the ground from the visual world instead of defaulting to pure black."));
    }

    const willChangeCount = (source.match(/will-change\s*:/gi) || []).length;
    if (willChangeCount > 3) {
      findings.push({ file, line: 1, rule: "performance/will-change-overuse", severity: "warning", message: `Found ${willChangeCount} will-change declarations. Keep the hint targeted and temporary.` });
    }
  }

  if (hasMotion && !/prefers-reduced-motion/.test(corpus)) {
    findings.push({ file: "<target>", line: 1, rule: "a11y/reduced-motion", severity: "error", message: "Motion is present but no prefers-reduced-motion alternative was found in the audited sources." });
  }

  if (hasInteractive && !/focus-visible/.test(corpus)) {
    findings.push({ file: "<target>", line: 1, rule: "a11y/focus-visible", severity: "error", message: "Interactive elements are present but no focus-visible treatment was found in the audited sources." });
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
}

export function auditPaths(targets) {
  const files = collectFiles(targets);
  const entries = files.map((file) => ({ file: path.relative(process.cwd(), file) || file, source: fs.readFileSync(file, "utf8") }));
  return { files, findings: auditSources(entries) };
}

function printReport(files, findings) {
  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.length - errors;

  for (const item of findings) {
    const marker = item.severity === "error" ? "error" : "warn";
    console.log(`[${marker}] ${item.file}:${item.line} ${item.rule} — ${item.message}`);
  }

  console.log(`Design audit: ${files.length} files, ${errors} errors, ${warnings} warnings.`);
  return { errors, warnings };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const raw = process.argv.slice(2);
  const strict = raw.includes("--strict");
  const strictWarnings = raw.includes("--strict-warnings");
  const json = raw.includes("--json");
  const targets = raw.filter((arg) => !arg.startsWith("--"));
  const resolved = (targets.length ? targets : ["templates/modular-scroll-starter", "tokens/system.css"])
    .map((target) => path.resolve(target));

  try {
    const result = auditPaths(resolved);
    if (json) {
      console.log(JSON.stringify({ files: result.files, findings: result.findings }, null, 2));
    } else {
      const totals = printReport(result.files, result.findings);
      if ((strict && totals.errors > 0) || (strictWarnings && result.findings.length > 0)) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
