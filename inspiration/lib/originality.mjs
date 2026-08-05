import { jaccard, ratioSimilarity, rgbDistance, shingles, tokenize } from "./common.mjs";

function values(entries) {
  return (entries || []).map((entry) => typeof entry === "string" ? entry : entry?.value).filter(Boolean);
}

function average(numbers) {
  const clean = numbers.filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

function paletteSimilarity(left, right) {
  const a = values([...(left?.material?.foregroundColors || []), ...(left?.material?.backgroundColors || [])]).map((value) => /^rgb\((\d+)\s+(\d+)\s+(\d+)\)$/.exec(value)).filter(Boolean).map((match) => match.slice(1).map(Number));
  const b = values([...(right?.material?.foregroundColors || []), ...(right?.material?.backgroundColors || [])]).map((value) => /^rgb\((\d+)\s+(\d+)\s+(\d+)\)$/.exec(value)).filter(Boolean).map((match) => match.slice(1).map(Number));
  if (!a.length || !b.length) return 0;
  return average(a.slice(0, 8).map((color) => Math.max(...b.slice(0, 8).map((candidate) => rgbDistance(color, candidate)))));
}

function featureSet(dna, paths) {
  const result = [];
  for (const path of paths) {
    let value = dna;
    for (const segment of path.split(".")) value = value?.[segment];
    if (Array.isArray(value)) result.push(...value.map((item) => typeof item === "string" ? item : JSON.stringify(item)));
    else if (value) result.push(typeof value === "string" ? value : JSON.stringify(value));
  }
  return result.flatMap(tokenize);
}

export function compareDesignDna(target, source) {
  const structure = jaccard(featureSet(target, ["structure.topology", "structure.modes", "structure.sequence", "structure.signatures"]), featureSet(source, ["structure.topology", "structure.modes", "structure.sequence", "structure.signatures"]));
  const typography = jaccard(featureSet(target, ["typography.categories", "typography.families", "typography.roles"]), featureSet(source, ["typography.categories", "typography.families", "typography.roles"]));
  const material = average([
    jaccard(featureSet(target, ["material.tags"]), featureSet(source, ["material.tags"])),
    paletteSimilarity(target, source),
    ratioSimilarity(target?.material?.radiusMedian, source?.material?.radiusMedian),
  ]);
  const motion = jaccard(featureSet(target, ["motion.tags"]), featureSet(source, ["motion.tags"]));
  const interaction = jaccard(featureSet(target, ["interaction.patterns"]), featureSet(source, ["interaction.patterns"]));
  const media = jaccard(featureSet(target, ["media.patterns", "media.renderers"]), featureSet(source, ["media.patterns", "media.renderers"]));
  const targetHashes = new Set(target?.copyFingerprint?.shingleHashes || []);
  const sourceHashes = new Set(source?.copyFingerprint?.shingleHashes || []);
  let copy = targetHashes.size && sourceHashes.size ? jaccard(targetHashes, sourceHashes) : 0;
  if (!targetHashes.size || !sourceHashes.size) {
    const targetCopy = target?.copyFingerprint?.sample || (target?.copyFingerprint?.headingTokens || []).join(" ");
    const sourceCopy = source?.copyFingerprint?.sample || (source?.copyFingerprint?.headingTokens || []).join(" ");
    copy = targetCopy && sourceCopy ? jaccard(shingles(targetCopy), shingles(sourceCopy)) : 0;
  }
  const weighted = (structure * 0.24) + (typography * 0.13) + (material * 0.17) + (motion * 0.18) + (interaction * 0.13) + (media * 0.1) + (copy * 0.05);
  return {
    overall: Number(weighted.toFixed(4)),
    dimensions: Object.fromEntries(Object.entries({ structure, typography, material, motion, interaction, media, copy }).map(([key, value]) => [key, Number(value.toFixed(4))])),
  };
}

export function auditOriginality(target, references, options = {}) {
  const threshold = Number(options.threshold ?? 0.72);
  const results = references.map((reference) => ({
    id: reference.id,
    label: reference.label,
    ...compareDesignDna(target, reference.designDna || reference),
  })).sort((left, right) => right.overall - left.overall);
  const warnings = [];
  for (const result of results) {
    if (result.overall >= threshold) warnings.push(`${result.label || result.id} controls too much of the resulting design (${Math.round(result.overall * 100)}% heuristic similarity).`);
    if (result.dimensions.copy >= 0.22) warnings.push(`${result.label || result.id} has meaningful copy overlap; replace or independently author the text.`);
    const dominant = Object.entries(result.dimensions).filter(([dimension, value]) => dimension !== "copy" && value >= 0.86).map(([dimension]) => dimension);
    if (dominant.length >= 3) warnings.push(`${result.label || result.id} is near-identical across ${dominant.join(", ")}; add explicit transformations.`);
  }
  return {
    schemaVersion: 1,
    threshold,
    results,
    verdict: warnings.length ? "review" : "pass",
    warnings,
    note: "Similarity is a design-review heuristic, not a legal conclusion.",
  };
}
