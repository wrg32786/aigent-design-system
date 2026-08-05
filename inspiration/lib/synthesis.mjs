import fs from "node:fs";
import path from "node:path";
import { jaccard, nowIso, safeId, tokenize, writeJson, writeText } from "./common.mjs";
import { summarizeDesignDna } from "./design-dna.mjs";
import { auditOriginality } from "./originality.mjs";
import { loadIndex, loadSource, openStore, resolveSources, saveProject } from "./store.mjs";

const DIMENSIONS = ["structure", "typography", "material", "motion", "interaction", "media"];
const DEFAULT_TRANSFORMS = {
  structure: "Preserve the organizing principle but change section order, grouping, and responsive transformation for the target product.",
  typography: "Preserve role contrast but use a different family pairing, scale, line length, and delivery strategy.",
  material: "Preserve the material logic but rebuild palette, texture, radii, borders, shadows, and contrast from the target brand.",
  motion: "Preserve the perceptual purpose but change direction, timing, easing, subjects, handoff, and reduced-motion equivalent.",
  interaction: "Preserve the task model while using target-specific labels, states, keyboard behavior, and information architecture.",
  media: "Preserve the media role while producing original assets, camera language, lighting, grade, crop, and mobile derivatives.",
};

const PATTERN_MAP = {
  "pinned-narrative-stage": ["cinematic-page", "scene-stage", "focus-reveal"],
  "interactive-object-stage": ["threejs-product-stage", "object-stage", "scene-stage"],
  "immersive-media-stage": ["cinematic-page", "scene-stage"],
  "operator-workspace": ["command-center-interface", "command-palette"],
  "dense-interface": ["command-center-interface", "command-palette"],
  "editorial-sequence": ["cinematic-page", "focus-reveal"],
  "media-gallery": ["cinematic-asset-gallery", "scene-stage"],
  "linear-content-flow": ["cinematic-page"],
  unresolved: ["studio-core"],
};

function brandTerms(brief) {
  return [
    ...(brief?.brand?.adjectives || []),
    ...(brief?.brand?.antiReferences || []),
    brief?.brand?.themePreference,
    brief?.product?.name,
    brief?.surface?.mode,
    brief?.mode,
  ].filter(Boolean).join(" ");
}

function sourceSearchText(source) {
  const dna = source.designDna || {};
  return [source.label, source.kind, source.origin, ...(dna.signatures || []), dna.structure?.topology, ...(dna.structure?.modes || []), ...(dna.typography?.categories || []), ...(dna.material?.tags || []), ...(dna.motion?.tags || []), ...(dna.media?.renderers || []), ...(dna.media?.patterns || [])].filter(Boolean).join(" ");
}

export function searchSources(query, options = {}) {
  const store = openStore(options.root);
  const queryTokens = new Set(tokenize(query));
  return loadIndex(store).sources.map((summary) => {
    const source = loadSource(store, summary.id);
    const score = jaccard(queryTokens, new Set(tokenize(sourceSearchText(source))));
    return { ...summary, score: Number(score.toFixed(4)), designDna: summarizeDesignDna(source.designDna) };
  }).filter((item) => item.score > 0 || !queryTokens.size).sort((left, right) => right.score - left.score || String(right.updatedAt).localeCompare(String(left.updatedAt))).slice(0, options.limit || 12);
}

function rankForDimension(sources, dimension, brief) {
  const mode = brief?.surface?.mode || brief?.mode;
  return [...sources].sort((left, right) => {
    const leftDna = left.designDna || {};
    const rightDna = right.designDna || {};
    const confidence = (dna) => Number(dna.confidence?.[dimension] ?? dna.confidence?.overall ?? 0);
    const modeBoost = (dna) => mode && dna.structure?.modes?.includes(mode) ? 0.15 : 0;
    return (confidence(rightDna) + modeBoost(rightDna)) - (confidence(leftDna) + modeBoost(leftDna));
  });
}

function assignDimensions(sources, brief, explicit = {}) {
  const assignments = {};
  const counts = new Map(sources.map((source) => [source.id, 0]));
  for (const dimension of DIMENSIONS) {
    if (explicit[dimension]) {
      if (!sources.some((source) => source.id === explicit[dimension])) throw new Error(`Unknown reference assignment for ${dimension}: ${explicit[dimension]}`);
      assignments[dimension] = explicit[dimension];
      counts.set(explicit[dimension], (counts.get(explicit[dimension]) || 0) + 1);
      continue;
    }
    const ranked = rankForDimension(sources, dimension, brief);
    const candidate = ranked.find((source) => (counts.get(source.id) || 0) < 2) || ranked[0];
    assignments[dimension] = candidate.id;
    counts.set(candidate.id, (counts.get(candidate.id) || 0) + 1);
  }
  return assignments;
}

function sourceDimensionSummary(source, dimension) {
  const dna = source.designDna || {};
  if (dimension === "structure") return { topology: dna.structure?.topology, modes: dna.structure?.modes, density: dna.structure?.density, sectionLabels: dna.structure?.sectionLabels?.slice(0, 8), responsive: dna.responsive?.transformations };
  if (dimension === "typography") return { families: dna.typography?.families?.slice(0, 6), categories: dna.typography?.categories, sizes: dna.typography?.sizes, headingScale: dna.typography?.headingScale?.slice(0, 8) };
  if (dimension === "material") return { tags: dna.material?.tags, foreground: dna.material?.foregroundColors?.slice(0, 6), background: dna.material?.backgroundColors?.slice(0, 6), radiusMedian: dna.material?.radiusMedian, borderDensity: dna.material?.borderDensity, shadowDensity: dna.material?.shadowDensity };
  if (dimension === "motion") return { tags: dna.motion?.tags, animationCount: dna.motion?.animationCount, scrollLinkedCount: dna.motion?.scrollLinkedCount, durationMedian: dna.motion?.durationMedian, reducedMotionObserved: dna.motion?.reducedMotionObserved };
  if (dimension === "interaction") return { patterns: dna.interaction?.patterns, total: dna.interaction?.total, buttons: dna.interaction?.buttons, inputs: dna.interaction?.inputs, dialogs: dna.interaction?.dialogs };
  return { patterns: dna.media?.patterns, renderers: dna.media?.renderers, images: dna.media?.images, video: dna.media?.video, canvas: dna.media?.canvas, iframe: dna.media?.iframe };
}

function mapPatterns(sources, assignments) {
  const patterns = new Set(["studio-core", "inspiration-intelligence"]);
  const structure = sources.find((source) => source.id === assignments.structure)?.designDna?.structure?.topology || "unresolved";
  for (const item of PATTERN_MAP[structure] || PATTERN_MAP.unresolved) patterns.add(item);
  for (const source of sources) {
    const renderers = source.designDna?.media?.renderers || [];
    if (renderers.includes("threejs")) patterns.add("threejs-product-stage");
    if (renderers.includes("spline")) patterns.add("cinematic-page");
    if (source.designDna?.interaction?.dialogs) patterns.add("command-palette");
  }
  return [...patterns];
}

function directionMarkdown(plan) {
  const rows = plan.referenceMatrix.dimensions.map((entry) => `| ${entry.dimension} | ${entry.sourceLabel} | ${entry.extractedPrinciple} | ${entry.requiredTransformation} |`);
  return `# Inspiration Direction\n\n## Product job\n\n${plan.briefSummary}\n\n## Direction thesis\n\n${plan.direction.thesis}\n\n## Reference matrix\n\n| Dimension | Source | Extracted principle | Required transformation |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n\n## Use\n\n${plan.direction.use.map((item) => `- ${item}`).join("\n")}\n\n## Transform\n\n${plan.direction.transform.map((item) => `- ${item}`).join("\n")}\n\n## Do not copy\n\n${plan.direction.doNotCopy.map((item) => `- ${item}`).join("\n")}\n\n## Recommended AIgent systems\n\n${plan.patterns.map((item) => `- ${item}`).join("\n")}\n\n## Completion contract\n\n- Preserve product truth and target brand authority.\n- Produce original copy, assets, type pairing, section order, and animation implementation.\n- Recompose mobile rather than shrinking the reference.\n- Add reduced-motion behavior.\n- Run the originality audit against every cited source.\n`;
}

export function composeDirection(brief, references, options = {}) {
  if (references.length < 3) throw new Error("Whole-surface reference synthesis requires at least three inspiration sources so no source controls more than two dimensions.");
  const assignments = assignDimensions(references, brief, options.assignments || {});
  const dimensions = DIMENSIONS.map((dimension) => {
    const source = references.find((candidate) => candidate.id === assignments[dimension]);
    return {
      dimension,
      sourceId: source.id,
      sourceLabel: source.label,
      extractedPrinciple: JSON.stringify(sourceDimensionSummary(source, dimension)),
      requiredTransformation: options.transforms?.[dimension] || DEFAULT_TRANSFORMS[dimension],
      excluded: ["source copy", "source assets", "source marks", "source code", "exact expressive implementation"],
    };
  });
  const patterns = mapPatterns(references, assignments);
  const thesis = `Create a product-specific ${brief?.surface?.mode || brief?.mode || "mixed-mode"} surface using a multi-source reference matrix. No single reference controls more than two design dimensions.`;
  const plan = {
    schemaVersion: 1,
    id: safeId(options.id || brief?.id || brief?.product?.name || `inspiration-${Date.now()}`),
    createdAt: nowIso(),
    brief,
    briefSummary: [brief?.product?.name, brief?.product?.job, brief?.surface?.mode || brief?.mode, brandTerms(brief)].filter(Boolean).join(" — ") || "Unspecified product brief",
    references: references.map((source) => ({ id: source.id, label: source.label, kind: source.kind, origin: source.origin, confidence: source.designDna?.confidence?.overall ?? null })),
    referenceMatrix: { assignments, dimensions },
    direction: {
      thesis,
      use: dimensions.map((entry) => `${entry.dimension}: abstract the principle from ${entry.sourceLabel}`),
      transform: dimensions.map((entry) => `${entry.dimension}: ${entry.requiredTransformation}`),
      doNotCopy: ["source copy or claims", "source photographs, video, 3D models, icons, or marks", "exact section order", "exact typography pairing and scale", "exact animation timing or keyframes", "source HTML, CSS, JavaScript, or shader code"],
    },
    patterns,
    production: {
      originalAssetsRequired: true,
      provenanceRequired: true,
      mobileDerivativeRequired: true,
      reducedMotionRequired: true,
    },
    originality: {
      maximumDimensionsPerSource: 2,
      threshold: Number(options.threshold ?? 0.72),
      auditRequired: true,
      note: "This is a design-synthesis safeguard, not a legal conclusion.",
    },
  };
  plan.influenceLedger = {
    schemaVersion: 1,
    project: plan.id,
    createdAt: plan.createdAt,
    sources: references.map((source) => ({
      id: source.id,
      label: source.label,
      origin: source.origin,
      usedFor: DIMENSIONS.filter((dimension) => assignments[dimension] === source.id),
      notUsed: ["copy", "assets", "marks", "source code", "exact section order", "exact animation implementation"],
    })),
    transformations: dimensions.map((entry) => ({ dimension: entry.dimension, sourceId: entry.sourceId, transformation: entry.requiredTransformation })),
    status: "planned",
  };
  plan.markdown = directionMarkdown(plan);
  return plan;
}

export function composeFromStore(brief, ids, options = {}) {
  const store = openStore(options.root);
  const sources = resolveSources(store, ids);
  const plan = composeDirection(brief, sources, options);
  const directory = saveProject(store, plan.id, {
    "inspiration-plan.json": { ...plan, markdown: undefined },
    "reference-matrix.json": plan.referenceMatrix,
    "influence-ledger.json": plan.influenceLedger,
    "DIRECTION.md": plan.markdown,
  });
  return { store, directory, plan, sources };
}

export function applyDirection(plan, target) {
  const root = path.resolve(target);
  fs.mkdirSync(path.join(root, ".aigent"), { recursive: true });
  const clean = { ...plan };
  delete clean.markdown;
  writeJson(path.join(root, ".aigent", "inspiration-plan.json"), clean);
  writeJson(path.join(root, ".aigent", "influence-ledger.json"), plan.influenceLedger);
  writeText(path.join(root, ".aigent", "INSPIRATION.md"), plan.markdown || directionMarkdown(plan));
  return path.join(root, ".aigent");
}

export function auditPlanTarget(targetDna, plan, references) {
  const audit = auditOriginality(targetDna, references, { threshold: plan.originality?.threshold });
  const assignmentCounts = {};
  for (const sourceId of Object.values(plan.referenceMatrix?.assignments || {})) assignmentCounts[sourceId] = (assignmentCounts[sourceId] || 0) + 1;
  for (const [sourceId, count] of Object.entries(assignmentCounts)) {
    if (count > (plan.originality?.maximumDimensionsPerSource || 2)) audit.warnings.push(`${sourceId} controls ${count} design dimensions; split the influence across more references.`);
  }
  audit.verdict = audit.warnings.length ? "review" : "pass";
  return audit;
}
