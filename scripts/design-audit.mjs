import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const supported = new Set([".html", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".astro", ".vue", ".svelte"]);
const TASTE_REVIEW_RULES = new Set(["motion/bounce-easing"]);

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

function repeatedFinding(findings, file, source, regex, minimum, rule, message) {
  const matches = [...source.matchAll(regex)];
  if (matches.length < minimum) return;
  findings.push({
    file,
    line: lineOf(source, matches[0].index ?? 0),
    rule,
    severity: "warning",
    message: `${message} Found ${matches.length}.`,
  });
}

function checkNestedCards(findings, file, source) {
  const cardOpen = /<(?:div|section|article)\b[^>]*(?:class|data-[\w-]+)=["'][^"']*\b(?:card|feature-card|pricing-card|info-card)\b[^"']*["'][^>]*>/gi;
  const matches = [...source.matchAll(cardOpen)];
  for (const match of matches) {
    const start = match.index ?? 0;
    const nearby = source.slice(start + match[0].length, start + match[0].length + 1200);
    cardOpen.lastIndex = 0;
    if (!cardOpen.test(nearby)) continue;
    findings.push({ file, line: lineOf(source, start), rule: "taste/nested-cards", severity: "warning", message: "Card-like containers appear nested. Use hierarchy and proximity before adding another container." });
    return;
  }
}

// Copy smells, adapted from leonxlnx/taste-skill and nutlope/hallmark (MIT, see skills/aigent-design/NOTICE.md).
const SLOP_WORDS = ["delve", "delves", "tapestry", "testament to", "realm", "embark", "plethora", "myriad", "meticulous", "meticulously", "multifaceted", "paradigm",
  "elevate", "elevates", "unlock", "unlocks", "unleash", "empower", "empowers", "empowering", "supercharge", "supercharged", "seamless", "seamlessly", "effortless", "effortlessly",
  "cutting-edge", "revolutionary", "revolutionize", "transformative", "holistic", "next-level", "world-class", "best-in-class", "game-changer", "game-changing", "state-of-the-art",
  "synergy", "reimagine", "reimagined", "next-generation", "next-gen", "robust", "powerful", "unparalleled", "industry-leading", "mission-critical", "future-proof"];
const LITERAL_AFTER = {
  powerful: /^\s+(?:and\s+)?\d[\d,.]*\s?(?:w|kw|hp|v|nm|mah|wh|kwh|lumens?|watts?|volts?|rpm)\b/i,
  robust: /^\s+(?:steel|stainless|aluminium|aluminum|alloy|oak|timber|iron|carbon|frames?|chassis|casing|housing|hinges?)\b/i,
  unlock: /^s?\s+(?:the |your |a )?(?:door|doors|bike|car|phone|locker|gate|box|room)\b/i,
  seamless: /^\s+(?:knit|knitted|garments?|socks?|tights|leggings|pipes?|steel|gutters?|flooring)\b/i,
};
const STOCK_PHRASES = [/in today'?s (?:fast-paced|digital|modern|ever-changing|busy)/i, /unlock the (?:power|potential)/i, /harness the power/i, /the future of [a-z]+ is (?:here|now)/i,
  /say goodbye to/i, /whether you'?re an? /i, /look no further/i, /join (?:thousands|millions|hundreds) of/i, /imagine a world/i, /ready to (?:transform|take your|elevate|level up)/i,
  /one-stop shop/i, /take (?:it|your [a-z]+|things) to the next level/i, /\b(?:it'?s|this is|we'?re|we are) not just (?:a|an|another)\b/i, /\blet'?s dive in\b/i,
  /\b(?:in|with) just a few clicks\b/i, /\bwe'?ve got you covered\b/i, /\bthe possibilities are endless\b/i, /\bat your fingertips\b/i, /\bbuilt for the modern\b/i];

function visibleText(source) {
  const blank = (text) => text.replace(/[^\n]/g, " ");
  return source
    .replace(/<(script|style|code|pre)\b[\s\S]*?<\/\1>/gi, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<[^>]*>/g, blank)
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => " ".repeat(entity.length));
}

function checkCopy(findings, file, source) {
  const text = visibleText(source);
  const slopHits = [];
  for (const word of SLOP_WORDS) {
    const pattern = new RegExp(`(?<![\\w-])${word.replace(/[-]/g, "[- ]").replace(/ /g, "\\s+")}(?![\\w-])`, "gi");
    for (const match of text.matchAll(pattern)) {
      const after = text.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 40);
      if (LITERAL_AFTER[word.toLowerCase()]?.test(after)) continue;
      slopHits.push(match);
    }
  }
  if (slopHits.length) {
    slopHits.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const words = [...new Set(slopHits.map((hit) => hit[0].toLowerCase()))].slice(0, 6).join(", ");
    findings.push(finding(file, source, slopHits[0], "taste/copy-slop-word", "warning", `Generated-copy filler words (${words}). Replace each with the fact it stands in for: the figure, the mechanism, the material, the place. Found ${slopHits.length}.`));
  }
  for (const pattern of STOCK_PHRASES) {
    const match = text.match(new RegExp(pattern.source, "i"));
    if (match) findings.push(finding(file, source, match, "taste/copy-stock-phrase", "warning", `Stock line "${match[0].trim()}". Say what the product does, in its own nouns.`));
  }
  for (const match of text.matchAll(/\bscroll\s+(?:down|to\s+(?:explore|discover|begin|continue))\b/gi)) {
    findings.push(finding(file, source, match, "taste/scroll-cue", "warning", "Scroll cues are decoration text. Visitors already know how to scroll; let the hero carry the invitation."));
  }
}

export function isTasteFinding(item) {
  return item.rule.startsWith("taste/") || TASTE_REVIEW_RULES.has(item.rule);
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

      repeatedFinding(findings, file, source, /\b(?:card|feature-card|pricing-card|info-card)\b/gi, 8, "taste/card-dominance", "Card language dominates this surface. Verify that proximity, rules, or a stronger composition would communicate hierarchy better.");
      checkNestedCards(findings, file, source);
      checkCopy(findings, file, source);

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

    for (const match of source.matchAll(/\b(?:bounce|elastic)(?:\.out|\.in|\.inOut)?\b|cubic-bezier\s*\(\s*0\.68\s*,\s*-0\.55|cubic-bezier\s*\(\s*0\.175\s*,\s*0\.885/gi)) {
      findings.push(finding(file, source, match, "motion/bounce-easing", "warning", "Bounce or elastic easing needs a product-specific physical reason."));
    }

    for (const match of source.matchAll(/(?:background-clip|-webkit-background-clip)\s*:\s*text|\bbg-clip-text\b/gi)) {
      findings.push(finding(file, source, match, "taste/gradient-text", "warning", "Gradient text is a common generated-design default. Use weight, size, or a solid role color unless the brief earns it."));
    }

    for (const match of source.matchAll(/(?:linear|radial)-gradient\([^)]*(?:purple|violet|indigo|#(?:7c3aed|8b5cf6|6366f1))[^)]*(?:blue|cyan|#(?:3b82f6|06b6d4))/gi)) {
      findings.push(finding(file, source, match, "taste/ai-gradient", "warning", "Purple or indigo-to-blue gradients are a generated-design default. Choose a palette from the product's visual world."));
    }

    for (const match of source.matchAll(/font-family\s*:\s*[^;]*(?:\bInter\b|\bArial\b|system-ui)/gi)) {
      findings.push(finding(file, source, match, "taste/overused-display-font", "warning", "Do not let an overused or system font define a brand surface by default. Confirm the role is intentionally utilitarian or choose a product-specific display voice."));
    }

    for (const match of source.matchAll(/background(?:-color)?\s*:\s*(?:#000(?:000)?\b|rgb\(\s*0[ ,]+0[ ,]+0\s*\))/gi)) {
      findings.push(finding(file, source, match, "taste/pure-black-background", "warning", "Tint the ground from the visual world instead of defaulting to pure black."));
    }

    repeatedFinding(findings, file, source, /(?:fade[-_ ]?up|translateY\([^)]*\)[^{}]{0,120}opacity|opacity[^{}]{0,120}translateY\()/gi, 4, "taste/repeated-fade-up", "Repeated fade-up reveals flatten authored motion into a generic template pattern.");
    repeatedFinding(findings, file, source, /border-radius\s*:\s*(?:9999px|999px|100vw|50rem)|\brounded-full\b/g, 6, "taste/pill-overuse", "Pill shapes are heavily repeated. Reserve them for compact controls, status, or intentional brand actions.");
    repeatedFinding(findings, file, source, /(?:box-shadow|filter)\s*:[^;]*(?:0 0|drop-shadow)/gi, 6, "taste/glow-overuse", "Glow is heavily repeated. Tie emitted light to active instrumentation or meaningful media.");

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

export function auditPaths(targets, { tasteOnly = false } = {}) {
  const files = collectFiles(targets);
  const entries = files.map((file) => ({ file: path.relative(process.cwd(), file) || file, source: fs.readFileSync(file, "utf8") }));
  const findings = auditSources(entries);
  return { files, findings: tasteOnly ? findings.filter(isTasteFinding) : findings };
}

function printReport(files, findings, label = "Design audit") {
  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.length - errors;

  for (const item of findings) {
    const marker = item.severity === "error" ? "error" : "warn";
    console.log(`[${marker}] ${item.file}:${item.line} ${item.rule} — ${item.message}`);
  }

  console.log(`${label}: ${files.length} files, ${errors} errors, ${warnings} warnings.`);
  return { errors, warnings };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const raw = process.argv.slice(2);
  const strict = raw.includes("--strict");
  const strictWarnings = raw.includes("--strict-warnings");
  const json = raw.includes("--json");
  const tasteOnly = raw.includes("--taste-only");
  const targets = raw.filter((arg) => !arg.startsWith("--"));
  const resolved = (targets.length ? targets : ["templates/modular-scroll-starter", "tokens/system.css"])
    .map((target) => path.resolve(target));

  try {
    const result = auditPaths(resolved, { tasteOnly });
    if (json) {
      console.log(JSON.stringify({ files: result.files, findings: result.findings }, null, 2));
    } else {
      const totals = printReport(result.files, result.findings, tasteOnly ? "AIgent Taste" : "Design audit");
      if ((strict && totals.errors > 0) || (strictWarnings && result.findings.length > 0)) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
