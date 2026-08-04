#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPaths } from "./design-audit.mjs";

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function collectSource(target) {
  const files = [];
  function visit(current) {
    const stat = fs.statSync(current);
    if (stat.isDirectory()) return fs.readdirSync(current).forEach((name) => visit(path.join(current, name)));
    if ([".html", ".css", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".astro", ".vue", ".svelte"].includes(path.extname(current))) files.push(current);
  }
  visit(target);
  return files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

export function scoreDesign({ brief, target, review = null, root = process.cwd() }) {
  const absolute = path.resolve(root, target);
  const source = collectSource(absolute);
  const audit = auditPaths([absolute]);
  const rules = new Set(audit.findings.map((finding) => finding.rule));
  const checks = [
    ["document-contract", 5, !rules.has("a11y/html-lang") && !rules.has("responsive/viewport") && !rules.has("hierarchy/h1-count"), "Language, viewport, and one-h1 contract"],
    ["semantic-interaction", 4, !rules.has("a11y/nonsemantic-click") && !rules.has("a11y/image-alt") && !rules.has("security/blank-rel"), "Semantic interaction and media alternatives"],
    ["focus", 4, /focus-visible/.test(source) && !rules.has("a11y/outline-none"), "Visible keyboard focus"],
    ["reduced-motion", 4, /prefers-reduced-motion/.test(source), "Reduced-motion path"],
    ["responsive", 4, /@media\s*\([^)]*(max-width|width\s*[<:=])/.test(source), "Authored narrow-screen composition"],
    ["design-contract", 4, /THESIS:\s*/.test(source) && /OWN WORLD:\s*/.test(source), "Recorded direction contract"],
    ["tokens", 4, /var\(--(?:ds-|[a-z]+-color)/.test(source), "Semantic design roles"],
    ["fallback", 4, !/(three|spline|video|canvas|webgl)/i.test(source) || /(poster|fallback|aria-hidden|noscript)/i.test(source), "Media fallback or no heavy media"],
    ["taste-floor", 4, !rules.has("taste/gradient-text") && !rules.has("taste/identical-card-grid") && !rules.has("taste/pure-black-background"), "No detected generated-design defaults"],
    ["performance-floor", 3, !rules.has("performance/transition-all") && !rules.has("performance/will-change-overuse"), "Bounded transitions and compositor hints"]
  ];

  const mechanical = checks.map(([id, points, pass, label]) => ({ id, label, points, earned: pass ? points : 0, pass }));
  const mechanicalScore = mechanical.reduce((sum, check) => sum + check.earned, 0);

  const rubric = JSON.parse(fs.readFileSync(path.join(root, "evals/rubric.json"), "utf8"));
  let humanScore = null;
  let human = [];
  if (review) {
    human = rubric.humanCategories.map((category) => {
      const rating = Number(review.ratings?.[category.id]);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error(`Invalid human rating: ${category.id}`);
      const earned = (rating / 5) * category.weight;
      return { ...category, rating, earned };
    });
    humanScore = human.reduce((sum, category) => sum + category.earned, 0);
  }

  return {
    schemaVersion: 1,
    brief: brief.name,
    target,
    generatedAt: new Date().toISOString(),
    mechanical: { score: mechanicalScore, maximum: 40, checks, auditFindings: audit.findings },
    human: review ? { score: humanScore, maximum: 60, reviewer: review.reviewer, categories: human, verdict: review.verdict, strengths: review.strengths || [], failures: review.failures || [] } : { score: null, maximum: 60, status: "pending-review" },
    total: humanScore == null ? null : Math.round((mechanicalScore + humanScore) * 10) / 10,
    maximum: 100
  };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  try {
    const args = process.argv.slice(2);
    const briefPath = option(args, "--brief");
    const target = option(args, "--target");
    const reviewPath = option(args, "--review");
    const out = option(args, "--out");
    if (!briefPath || !target) throw new Error("Usage: node scripts/score-design.mjs --brief brief.json --target path [--review review.json] [--out result.json]");
    const brief = JSON.parse(fs.readFileSync(path.resolve(briefPath), "utf8"));
    const review = reviewPath ? JSON.parse(fs.readFileSync(path.resolve(reviewPath), "utf8")) : null;
    const result = scoreDesign({ brief, target, review });
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (out) {
      fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
      fs.writeFileSync(path.resolve(out), text);
      console.log(`Wrote ${out}`);
    } else process.stdout.write(text);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
