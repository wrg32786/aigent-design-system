import {
  clamp,
  median,
  normalizeCssColor,
  percentile,
  shortHash,
  tokenize,
  unique,
} from "./common.mjs";

const GENERIC_FONTS = new Set(["serif", "sans-serif", "monospace", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace"]);

function entriesByCount(map, limit = 12) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function addCount(map, value, amount = 1) {
  if (value === undefined || value === null || value === "") return;
  map.set(value, (map.get(value) || 0) + amount);
}

function fontCategory(family) {
  const value = String(family || "").toLowerCase();
  if (/mono|code|console|courier|menlo|martian|jetbrains/.test(value)) return "monospaced";
  if (/serif|georgia|times|garamond|baskerville|instrument/.test(value) && !/sans/.test(value)) return "serif";
  if (/condensed|narrow/.test(value)) return "condensed-sans";
  if (/rounded|soft/.test(value)) return "rounded-sans";
  if (/display|black|poster/.test(value)) return "display-sans";
  return "sans-serif";
}

function colorKey(value) {
  const rgb = normalizeCssColor(value);
  return rgb ? `rgb(${rgb.map((channel) => Math.round(channel)).join(" ")})` : null;
}

function inferTopology(summary) {
  const { sectionCount, stickyCount, fixedCount, interactiveCount, media, layout, textDensity } = summary;
  if (interactiveCount > 25 && layout.gridCount + layout.flexCount > 20 && textDensity === "high") return "operator-workspace";
  if (media.canvas > 0 || media.threeHints > 0 || media.splineHints > 0) {
    if (stickyCount > 0 || fixedCount > 0) return "interactive-object-stage";
    return "immersive-media-stage";
  }
  if (stickyCount > 0 && sectionCount >= 4) return "pinned-narrative-stage";
  if (sectionCount >= 7 && textDensity !== "low") return "editorial-sequence";
  if (interactiveCount > 12 && textDensity === "high") return "dense-interface";
  if (media.images + media.video > 5) return "media-gallery";
  return "linear-content-flow";
}

function inferMode(topology, summary) {
  if (["operator-workspace", "dense-interface"].includes(topology)) return ["operate"];
  if (topology === "editorial-sequence") return ["read", "persuade"];
  if (["interactive-object-stage", "immersive-media-stage", "pinned-narrative-stage"].includes(topology)) return ["experience", "persuade"];
  if (summary.interactiveCount > 10) return ["operate", "read"];
  return ["persuade", "read"];
}

function materialTags(summary) {
  const tags = [];
  if (summary.backdropBlurCount > 0) tags.push("translucent-layering");
  if (summary.shadowCount > Math.max(3, summary.elementCount * 0.08)) tags.push("shadowed-surfaces");
  if (summary.radiusMedian > 18) tags.push("rounded-material");
  else if (summary.radiusMedian < 4) tags.push("hard-edged-material");
  else tags.push("controlled-radius");
  if (summary.borderCount > summary.shadowCount * 2) tags.push("rule-driven");
  if (summary.gradientCount > 3) tags.push("gradient-field");
  if (summary.transparentSurfaceCount > 5) tags.push("layered-transparency");
  if (!tags.length) tags.push("flat-surface-system");
  return tags;
}

function motionTags(summary) {
  const tags = [];
  if (summary.scrollLinkedCount) tags.push("scroll-linked");
  if (summary.transformAnimationCount) tags.push("transform-driven");
  if (summary.opacityAnimationCount) tags.push("opacity-driven");
  if (summary.clipAnimationCount) tags.push("masked-reveal");
  if (summary.animationCount > 12) tags.push("motion-dense");
  else if (summary.animationCount > 0) tags.push("motion-restrained");
  else tags.push("static");
  if (summary.durationMedian > 800) tags.push("slow-cinematic");
  else if (summary.durationMedian && summary.durationMedian < 300) tags.push("fast-interface");
  return unique(tags);
}

function rendererHints(captures) {
  const scripts = captures.flatMap((capture) => capture.page?.scripts || []).join(" ").toLowerCase();
  const output = [];
  if (/three(?:\.min)?\.js|@react-three|three\/build/.test(scripts)) output.push("threejs");
  if (/spline/.test(scripts)) output.push("spline");
  if (/model-viewer/.test(scripts)) output.push("model-viewer");
  if (/gsap|scrolltrigger/.test(scripts)) output.push("gsap");
  if (/rive/.test(scripts)) output.push("rive");
  if (/lottie/.test(scripts)) output.push("lottie");
  return output;
}

function responsiveSummary(captures) {
  if (captures.length < 2) return { viewports: captures.map((capture) => capture.viewport), transformations: [] };
  const desktop = captures.reduce((best, capture) => capture.viewport.width > best.viewport.width ? capture : best, captures[0]);
  const mobile = captures.reduce((best, capture) => capture.viewport.width < best.viewport.width ? capture : best, captures[0]);
  const transformations = [];
  const desktopElements = new Map((desktop.elements || []).map((element) => [element.path, element]));
  const mobileElements = new Map((mobile.elements || []).map((element) => [element.path, element]));
  let hidden = 0;
  let stacked = 0;
  let relocated = 0;
  for (const [key, element] of desktopElements) {
    const counterpart = mobileElements.get(key);
    if (!counterpart || counterpart.style?.display === "none") { hidden += 1; continue; }
    if (element.rect?.width > desktop.viewport.width * 0.55 && counterpart.rect?.width > mobile.viewport.width * 0.8) stacked += 1;
    const desktopRatio = element.rect?.x / Math.max(1, desktop.viewport.width);
    const mobileRatio = counterpart.rect?.x / Math.max(1, mobile.viewport.width);
    if (Math.abs(desktopRatio - mobileRatio) > 0.25) relocated += 1;
  }
  if (hidden) transformations.push(`${hidden} desktop elements are hidden or replaced on the smallest viewport`);
  if (stacked) transformations.push(`${stacked} wide regions become near-full-width on mobile`);
  if (relocated) transformations.push(`${relocated} elements materially change horizontal position`);
  if ((desktop.page?.documentWidth || 0) > desktop.viewport.width + 2 || (mobile.page?.documentWidth || 0) > mobile.viewport.width + 2) transformations.push("one or more viewports overflow horizontally");
  return {
    viewports: captures.map((capture) => capture.viewport),
    desktop: { width: desktop.viewport.width, elementCount: desktop.elements?.length || 0 },
    mobile: { width: mobile.viewport.width, elementCount: mobile.elements?.length || 0 },
    transformations,
  };
}

export function deriveDesignDna(captures, source = {}) {
  if (!Array.isArray(captures) || !captures.length) return emptyDesignDna(source.kind || "unknown", "No browser or vision evidence was provided.");

  const fonts = new Map();
  const fontSizes = [];
  const fontWeights = new Map();
  const colors = new Map();
  const backgrounds = new Map();
  const radii = [];
  const gaps = [];
  const maxWidths = [];
  const headings = [];
  const textFragments = [];
  const positions = new Map();
  const displays = new Map();
  let elementCount = 0;
  let borderCount = 0;
  let shadowCount = 0;
  let backdropBlurCount = 0;
  let transparentSurfaceCount = 0;
  let gradientCount = 0;
  let stickyCount = 0;
  let fixedCount = 0;
  let sectionCount = 0;
  let interactiveCount = 0;
  let buttonCount = 0;
  let linkCount = 0;
  let inputCount = 0;
  let dialogCount = 0;
  let animationCount = 0;
  let scrollLinkedCount = 0;
  let transformAnimationCount = 0;
  let opacityAnimationCount = 0;
  let clipAnimationCount = 0;
  const durations = [];
  const media = { images: 0, video: 0, canvas: 0, svg: 0, iframe: 0, audio: 0, threeHints: 0, splineHints: 0 };
  const layout = { gridCount: 0, flexCount: 0, blockCount: 0, absoluteCount: 0 };

  for (const capture of captures) {
    sectionCount = Math.max(sectionCount, capture.sections?.length || 0);
    interactiveCount = Math.max(interactiveCount, capture.interactions?.length || 0);
    buttonCount = Math.max(buttonCount, capture.interactionSummary?.buttons || 0);
    linkCount = Math.max(linkCount, capture.interactionSummary?.links || 0);
    inputCount = Math.max(inputCount, capture.interactionSummary?.inputs || 0);
    dialogCount = Math.max(dialogCount, capture.interactionSummary?.dialogs || 0);

    for (const element of capture.elements || []) {
      elementCount += 1;
      const style = element.style || {};
      addCount(fonts, style.fontFamily);
      addCount(fontWeights, style.fontWeight);
      addCount(positions, style.position);
      addCount(displays, style.display);
      const fontSize = Number.parseFloat(style.fontSize);
      if (Number.isFinite(fontSize)) fontSizes.push(fontSize);
      const radius = Number.parseFloat(style.borderRadius);
      if (Number.isFinite(radius)) radii.push(radius);
      const gap = Number.parseFloat(style.gap);
      if (Number.isFinite(gap)) gaps.push(gap);
      if (element.rect?.width) maxWidths.push(element.rect.width);
      const foreground = colorKey(style.color);
      const background = colorKey(style.backgroundColor);
      if (foreground) addCount(colors, foreground);
      if (background) addCount(backgrounds, background);
      if (style.borderTopWidth && Number.parseFloat(style.borderTopWidth) > 0) borderCount += 1;
      if (style.boxShadow && style.boxShadow !== "none") shadowCount += 1;
      if (style.backdropFilter && style.backdropFilter !== "none") backdropBlurCount += 1;
      if (background && /rgba?\([^)]*(?:0\.|\/\s*0\.)/.test(style.backgroundColor || "")) transparentSurfaceCount += 1;
      if (/gradient\(/.test(style.backgroundImage || "")) gradientCount += 1;
      if (style.position === "sticky") stickyCount += 1;
      if (style.position === "fixed") fixedCount += 1;
      if (style.position === "absolute") layout.absoluteCount += 1;
      if (/grid/.test(style.display || "")) layout.gridCount += 1;
      else if (/flex/.test(style.display || "")) layout.flexCount += 1;
      else layout.blockCount += 1;
      if (element.headingLevel) headings.push({ level: element.headingLevel, text: element.text, fontSize, fontFamily: style.fontFamily, fontWeight: style.fontWeight });
      if (element.text) textFragments.push(element.text);
    }

    for (const animation of capture.animations || []) {
      animationCount += 1;
      const timing = animation.timing || {};
      const duration = Number(timing.duration);
      if (Number.isFinite(duration) && duration > 0 && duration < 120000) durations.push(duration);
      if (animation.timeline && !/DocumentTimeline/i.test(animation.timeline)) scrollLinkedCount += 1;
      const properties = new Set((animation.keyframes || []).flatMap((frame) => Object.keys(frame)));
      if (properties.has("transform") || properties.has("translate") || properties.has("rotate") || properties.has("scale")) transformAnimationCount += 1;
      if (properties.has("opacity")) opacityAnimationCount += 1;
      if (properties.has("clipPath") || properties.has("clip-path") || properties.has("mask")) clipAnimationCount += 1;
    }

    for (const [key, value] of Object.entries(capture.mediaSummary || {})) {
      if (key in media) media[key] = Math.max(media[key], Number(value) || 0);
    }
  }

  const renderers = rendererHints(captures);
  media.threeHints = renderers.includes("threejs") ? 1 : 0;
  media.splineHints = renderers.includes("spline") ? 1 : 0;
  const viewportArea = captures.reduce((sum, capture) => sum + capture.viewport.width * capture.viewport.height, 0) / captures.length;
  const elementsPerMegapixel = elementCount / captures.length / Math.max(0.1, viewportArea / 1_000_000);
  const textDensity = elementsPerMegapixel > 180 ? "high" : elementsPerMegapixel > 85 ? "medium" : "low";
  const summary = {
    elementCount: Math.round(elementCount / captures.length),
    sectionCount,
    interactiveCount,
    buttonCount,
    linkCount,
    inputCount,
    dialogCount,
    borderCount: Math.round(borderCount / captures.length),
    shadowCount: Math.round(shadowCount / captures.length),
    backdropBlurCount: Math.round(backdropBlurCount / captures.length),
    transparentSurfaceCount: Math.round(transparentSurfaceCount / captures.length),
    gradientCount: Math.round(gradientCount / captures.length),
    stickyCount: Math.round(stickyCount / captures.length),
    fixedCount: Math.round(fixedCount / captures.length),
    radiusMedian: median(radii),
    gapMedian: median(gaps),
    textDensity,
    layout,
    media,
  };
  const topology = inferTopology(summary);
  const mode = inferMode(topology, summary);
  const primaryFonts = entriesByCount(fonts, 8).filter((entry) => !GENERIC_FONTS.has(entry.value));
  const categories = unique(primaryFonts.map((entry) => fontCategory(entry.value)));
  const headingScale = headings
    .filter((heading) => Number.isFinite(heading.fontSize))
    .sort((left, right) => right.fontSize - left.fontSize)
    .slice(0, 8);
  const motionSummary = {
    animationCount,
    scrollLinkedCount,
    transformAnimationCount,
    opacityAnimationCount,
    clipAnimationCount,
    durationMedian: median(durations),
  };
  const materialSummary = { ...summary, materialTags: materialTags(summary) };
  const copySample = unique([...headings.map((heading) => heading.text), ...textFragments]).join(" ").slice(0, 12000);
  const signatures = unique([
    ...mode,
    topology,
    textDensity,
    ...categories,
    ...materialSummary.materialTags,
    ...motionTags(motionSummary),
    ...renderers,
    media.video ? "video" : null,
    media.images ? "images" : null,
    media.canvas ? "canvas" : null,
    interactiveCount > 15 ? "interactive" : null,
  ]);

  return {
    schemaVersion: 1,
    source: {
      id: source.id || null,
      kind: source.kind || "url",
      origin: source.origin || null,
      capturedAt: source.capturedAt || new Date().toISOString(),
    },
    confidence: {
      overall: source.kind === "url" ? 0.92 : source.analysisProvided ? 0.78 : 0.28,
      structure: source.kind === "url" ? 0.96 : 0.35,
      typography: source.kind === "url" ? 0.94 : 0.42,
      material: source.kind === "url" ? 0.9 : 0.5,
      motion: source.kind === "url" ? 0.84 : source.kind === "video" ? 0.72 : 0.2,
      interaction: source.kind === "url" ? 0.9 : 0.18,
      media: source.kind === "url" ? 0.92 : 0.58,
    },
    structure: {
      modes: mode,
      topology,
      sectionCount,
      density: textDensity,
      stickyRegions: summary.stickyCount,
      fixedRegions: summary.fixedCount,
      layout: {
        gridRegions: Math.round(layout.gridCount / captures.length),
        flexRegions: Math.round(layout.flexCount / captures.length),
        absoluteRegions: Math.round(layout.absoluteCount / captures.length),
        contentWidthP90: Math.round(percentile(maxWidths, 0.9)),
        gapMedian: Number(summary.gapMedian.toFixed(1)),
      },
      sectionLabels: unique(captures.flatMap((capture) => (capture.sections || []).map((section) => section.label || section.text))).slice(0, 20),
    },
    typography: {
      families: primaryFonts,
      categories,
      sizes: {
        minimum: Number(percentile(fontSizes, 0.05).toFixed(1)),
        bodyMedian: Number(median(fontSizes.filter((size) => size <= 28)).toFixed(1)),
        displayP95: Number(percentile(fontSizes, 0.95).toFixed(1)),
      },
      weights: entriesByCount(fontWeights, 8),
      headingScale,
      roleCount: unique(headings.map((heading) => `${heading.level}:${heading.fontFamily}:${heading.fontWeight}`)).length,
    },
    material: {
      tags: materialSummary.materialTags,
      foregroundColors: entriesByCount(colors, 10),
      backgroundColors: entriesByCount(backgrounds, 10),
      radiusMedian: Number(summary.radiusMedian.toFixed(1)),
      borderDensity: Number((summary.borderCount / Math.max(1, summary.elementCount)).toFixed(3)),
      shadowDensity: Number((summary.shadowCount / Math.max(1, summary.elementCount)).toFixed(3)),
      backdropBlurCount: summary.backdropBlurCount,
      gradientCount: summary.gradientCount,
    },
    motion: {
      tags: motionTags(motionSummary),
      ...motionSummary,
      durationMedian: Math.round(motionSummary.durationMedian),
      reducedMotionObserved: captures.some((capture) => capture.page?.reducedMotion === true),
    },
    interaction: {
      total: interactiveCount,
      buttons: buttonCount,
      links: linkCount,
      inputs: inputCount,
      dialogs: dialogCount,
      patterns: unique(captures.flatMap((capture) => capture.interactions?.map((interaction) => interaction.kind) || [])).slice(0, 20),
    },
    media: {
      ...media,
      renderers,
      patterns: unique(captures.flatMap((capture) => capture.media?.map((item) => item.kind) || [])),
    },
    responsive: responsiveSummary(captures),
    copyFingerprint: {
      headingTokens: unique(tokenize(headings.map((heading) => heading.text).join(" "))).slice(0, 120),
      sampleHash: shortHash(copySample, 16),
      sample: copySample,
    },
    signatures,
    evidence: {
      viewportCount: captures.length,
      elementCount: summary.elementCount,
      cdpNodeCount: Math.max(...captures.map((capture) => capture.cdp?.nodeCount || 0)),
      cdpLayoutCount: Math.max(...captures.map((capture) => capture.cdp?.layoutCount || 0)),
    },
  };
}

export function emptyDesignDna(kind = "unknown", reason = "No deterministic evidence available.") {
  return {
    schemaVersion: 1,
    source: { id: null, kind, origin: null, capturedAt: new Date().toISOString() },
    confidence: { overall: 0.1, structure: 0.1, typography: 0.1, material: 0.1, motion: 0.1, interaction: 0.1, media: 0.1 },
    structure: { modes: [], topology: "unresolved", sectionCount: 0, density: "unknown", stickyRegions: 0, fixedRegions: 0, layout: {}, sectionLabels: [] },
    typography: { families: [], categories: [], sizes: {}, weights: [], headingScale: [], roleCount: 0 },
    material: { tags: [], foregroundColors: [], backgroundColors: [], radiusMedian: 0, borderDensity: 0, shadowDensity: 0, backdropBlurCount: 0, gradientCount: 0 },
    motion: { tags: ["unresolved"], animationCount: 0, scrollLinkedCount: 0, transformAnimationCount: 0, opacityAnimationCount: 0, clipAnimationCount: 0, durationMedian: 0, reducedMotionObserved: false },
    interaction: { total: 0, buttons: 0, links: 0, inputs: 0, dialogs: 0, patterns: [] },
    media: { images: 0, video: 0, canvas: 0, svg: 0, iframe: 0, audio: 0, threeHints: 0, splineHints: 0, renderers: [], patterns: [] },
    responsive: { viewports: [], transformations: [] },
    copyFingerprint: { headingTokens: [], sampleHash: null, sample: "" },
    signatures: [kind, "unresolved"],
    evidence: { viewportCount: 0, elementCount: 0, cdpNodeCount: 0, cdpLayoutCount: 0, reason },
  };
}

export function summarizeDesignDna(dna) {
  return {
    id: dna.source?.id || null,
    mode: dna.structure?.modes || [],
    topology: dna.structure?.topology || "unresolved",
    density: dna.structure?.density || "unknown",
    typography: dna.typography?.categories || [],
    material: dna.material?.tags || [],
    motion: dna.motion?.tags || [],
    media: dna.media?.renderers?.length ? dna.media.renderers : dna.media?.patterns || [],
    signatures: dna.signatures || [],
    confidence: clamp(dna.confidence?.overall ?? 0),
  };
}
