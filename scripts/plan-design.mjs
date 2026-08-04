#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function words(values) {
  return new Set(values.flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
}

function overlap(left, right) {
  const a = words(Array.isArray(left) ? left : [left]);
  const b = words(Array.isArray(right) ? right : [right]);
  let count = 0;
  for (const item of a) if (b.has(item)) count += 1;
  return count;
}

function requireField(condition, message) {
  if (!condition) throw new Error(message);
}

function validateBrief(brief) {
  requireField(brief && typeof brief === "object", "Brief must be a JSON object.");
  requireField(typeof brief.name === "string" && brief.name.length > 1, "Brief needs name.");
  requireField(Array.isArray(brief.modes) && brief.modes.length, "Brief needs modes.");
  requireField(typeof brief.audience === "string" && brief.audience.length >= 8, "Brief needs audience.");
  requireField(typeof brief.visitorGoal === "string" && brief.visitorGoal.length >= 8, "Brief needs visitorGoal.");
  requireField(typeof brief.productMechanism === "string" && brief.productMechanism.length >= 8, "Brief needs productMechanism.");
  requireField(typeof brief.contentProfile === "string", "Brief needs contentProfile.");
  requireField(typeof brief.interactionLevel === "string", "Brief needs interactionLevel.");
  requireField(typeof brief.framework === "string", "Brief needs framework.");
  requireField(brief.brand && Array.isArray(brief.brand.adjectives), "Brief needs brand.adjectives.");
  requireField(brief.constraints && Number.isFinite(brief.constraints.maxInitialKB), "Brief needs constraints.maxInitialKB.");
  requireField(brief.media && Array.isArray(brief.media.available), "Brief needs media.available.");
}

function scoreLayout(layout, brief) {
  let score = 0;
  const reasons = [];

  const modeMatches = layout.modes.filter((mode) => brief.modes.includes(mode));
  if (modeMatches.length) {
    score += modeMatches.length * 9;
    reasons.push(`mode: ${modeMatches.join(", ")}`);
  }
  if (layout.contentProfiles.includes(brief.contentProfile)) {
    score += 8;
    reasons.push(`content: ${brief.contentProfile}`);
  }
  if (layout.density.includes(brief.density || "medium")) {
    score += 4;
    reasons.push(`density: ${brief.density || "medium"}`);
  }
  if (layout.interaction.includes(brief.interactionLevel)) {
    score += 5;
    reasons.push(`interaction: ${brief.interactionLevel}`);
  }
  const mediaMatches = layout.media.filter((medium) => brief.media.available.includes(medium));
  if (mediaMatches.length) {
    score += mediaMatches.length * 3;
    reasons.push(`media: ${mediaMatches.join(", ")}`);
  }
  if (layout.frameworks.includes(brief.framework) || layout.frameworks.includes("other")) {
    score += 3;
    reasons.push(`framework: ${brief.framework}`);
  }

  const direct = layout.score || {};
  for (const mode of brief.modes) score += direct[mode] || 0;
  score += direct[brief.contentProfile] || 0;
  score += direct[brief.interactionLevel] || 0;
  for (const medium of brief.media.available) score += direct[medium] || 0;

  if (brief.constraints.noWebGL && layout.media.includes("3d") && !layout.media.includes("video") && !layout.media.includes("images")) {
    score -= 12;
    reasons.push("penalty: WebGL prohibited");
  }
  if (brief.constraints.maxInitialKB < 500 && layout.media.includes("video")) {
    score -= 4;
    reasons.push("penalty: tight initial budget");
  }
  if (brief.constraints.mobilePriority && layout.id === "split-workspace") {
    score -= 5;
    reasons.push("penalty: mobile-first split workspace");
  }

  return { ...layout, score, reasons };
}

function scoreType(system, brief) {
  let score = 0;
  const reasons = [];
  const modeMatches = system.modes.filter((mode) => brief.modes.includes(mode));
  score += modeMatches.length * 7;
  if (modeMatches.length) reasons.push(`mode: ${modeMatches.join(", ")}`);

  const registerMatches = overlap(system.registers, brief.brand.adjectives);
  score += registerMatches * 4;
  if (registerMatches) reasons.push(`brand register overlap: ${registerMatches}`);

  if (brief.modes.includes("operate") && system.id === "native-product") score += 8;
  if (brief.modes.includes("experience") && system.id === "native-product") score -= 4;
  if (brief.contentProfile === "editorial" && system.id === "literary-technical") score += 8;
  if (brief.density === "high" && ["monumental-tech", "kinetic-poster"].includes(system.id)) score -= 6;

  return { ...system, score, reasons };
}

function scoreMotion(system, brief, layout) {
  let score = 0;
  const reasons = [];
  const modeMatches = system.modes.filter((mode) => brief.modes.includes(mode));
  score += modeMatches.length * 6;
  if (layout.motion.includes(system.id)) {
    score += 12;
    reasons.push(`native to ${layout.name}`);
  }
  if (brief.interactionLevel === "static" && system.cost === "high") score -= 10;
  if (brief.constraints.maxInitialKB < 500 && system.cost === "high") score -= 5;
  if (brief.constraints.noWebGL && system.runtimes.includes("threejs") && system.runtimes.length <= 2) score -= 8;
  if (brief.constraints.noAutoplay && system.id === "ambient-loop") score -= 8;
  if (brief.media.available.includes("data") && system.id === "data-state-morph") score += 8;
  if (brief.media.available.includes("3d") && system.id === "object-orbit-inspection") score += 8;
  if (brief.media.available.includes("video") && ["cinematic-descent","guided-scene-handoff","ambient-loop"].includes(system.id)) score += 4;
  return { ...system, score, reasons };
}

function pickMedia(brief, layout) {
  const preferred = brief.media.preferred || "auto";
  if (preferred !== "auto") return { medium: preferred, reason: "Pinned by the brief." };

  if (brief.constraints.noWebGL) {
    if (brief.media.available.includes("video") || brief.media.needsProduction) {
      return { medium: brief.interactionLevel === "high" ? "frame-sequence" : "video", reason: "WebGL is prohibited; rendered media preserves art direction." };
    }
    return { medium: "still", reason: "WebGL is prohibited and no production media is required." };
  }

  if (layout.id === "object-inspection" || brief.media.available.includes("3d")) {
    if (brief.interactionLevel === "high") return { medium: "threejs", reason: "Direct manipulation or live state earns a 3D runtime." };
    return { medium: "model-viewer", reason: "A bounded inspectable object does not need a custom renderer." };
  }

  if (brief.media.needsProduction && brief.modes.some((mode) => ["persuade","experience"].includes(mode))) {
    if (brief.interactionLevel === "static" || brief.interactionLevel === "low") return { medium: "video", reason: "Rendered media gives the strongest controlled art direction." };
    return { medium: "frame-sequence", reason: "Exact scroll states matter more than free-running playback." };
  }

  if (brief.contentProfile === "data-heavy" || brief.modes.includes("operate")) {
    return { medium: "css", reason: "The task and state model should lead; media remains subordinate." };
  }

  return { medium: "still", reason: "Start with the lightest complete state and escalate only after proof." };
}

function pickRuntime(medium, brief) {
  const map = {
    still: ["native CSS"],
    css: ["native CSS", "modules/motion.js"],
    video: ["HTML video", "GSAP only for coordinated narrative timing"],
    "frame-sequence": ["canvas or image sequence", "GSAP or native scroll mapping"],
    "model-viewer": ["@google/model-viewer"],
    spline: ["Spline runtime", "GSAP only when DOM and scene must share a timeline"],
    threejs: [brief.framework === "react" || brief.framework === "next" ? "Three.js via React Three Fiber" : "Three.js"],
    remotion: ["Remotion at build time", "HTML video at runtime"],
    rive: ["Rive canvas runtime"]
  };
  return map[medium] || ["native platform"];
}

function chooseInterface(interfaces, brief, layout) {
  const candidates = interfaces.map((item) => {
    let score = 0;
    score += item.modes.filter((mode) => brief.modes.includes(mode)).length * 8;
    if (item.layout === layout.id) score += 10;
    score += overlap(item.tasks, [brief.visitorGoal, brief.productMechanism]) * 2;
    return { ...item, score };
  }).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
  return candidates[0]?.score > 0 ? candidates[0] : null;
}

function chooseComponents(sources, brief) {
  return sources
    .filter((source) => source.frameworks.includes(brief.framework) || source.frameworks.includes("other") || (brief.framework === "vanilla" && source.frameworks.includes("vanilla")))
    .map((source) => {
      let score = 0;
      if (source.license === "MIT") score += 4;
      if (source.kind.includes("headless") && brief.modes.includes("operate")) score += 6;
      if (source.kind.includes("animated") && brief.modes.some((mode) => ["persuade","experience"].includes(mode))) score += 4;
      if (source.id === "shadcn-ui" && ["react","next"].includes(brief.framework)) score += 5;
      if (source.id === "floating-ui" && brief.interactionLevel === "high") score += 3;
      if (source.id === "tanstack-virtual" && brief.contentProfile === "data-heavy") score += 6;
      return { ...source, score };
    })
    .filter((source) => source.score > 0)
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 4);
}

function buildAntiPatterns(brief, layout, medium) {
  const items = new Set([
    "Do not use an identical card grid as the page scaffold.",
    "Do not put an eyebrow above every heading.",
    "Do not add motion that would not change meaning if removed.",
    "Do not mix component-library visual languages without restyling them into one system.",
    "Do not hide required content behind autoplay or a successful script load."
  ]);
  for (const item of brief.brand.antiReferences || []) items.add(`Reject: ${item}.`);
  if (brief.modes.includes("operate")) {
    items.add("Do not replace familiar controls with theatrical custom affordances.");
    items.add("Do not run an orchestrated page-load sequence before the task is usable.");
  }
  if (medium === "threejs") items.add("Do not use live 3D without a poster, loading state, offscreen pause, and bounded pixel ratio.");
  if (medium === "video" || medium === "frame-sequence") items.add("Do not preload later scenes before they become useful.");
  for (const warning of layout.avoidWhen || []) items.add(`Avoid this layout when ${warning}.`);
  return [...items];
}

function plan(brief) {
  validateBrief(brief);

  const layouts = readJson("design-intelligence/layouts.json").layouts
    .map((layout) => scoreLayout(layout, brief))
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));

  const primary = layouts[0];
  const topPool = layouts.slice(1, Math.min(6, layouts.length));
  const exploration = topPool.length ? topPool[hashString(`${brief.name}:${brief.productMechanism}`) % topPool.length] : null;
  const canon = layouts.find((layout) => {
    if (brief.modes.includes("operate")) return layout.id === "operator-command-center";
    if (brief.modes.includes("read")) return layout.id === "editorial-dossier";
    return layout.id === "evidence-spine";
  }) || layouts[1];

  const typeSystems = readJson("design-intelligence/type-systems.json").typeSystems
    .map((system) => scoreType(system, brief))
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));

  const media = pickMedia(brief, primary);
  const motions = readJson("design-intelligence/motion-systems.json").motionSystems
    .map((system) => scoreMotion(system, brief, primary))
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));

  const interfaces = readJson("design-intelligence/interface-systems.json").interfaceSystems;
  const componentSources = readJson("design-intelligence/component-sources.json").sources;

  const interfaceSystem = chooseInterface(interfaces, brief, primary);
  const components = chooseComponents(componentSources, brief);
  const initialBudget = clamp(brief.constraints.maxInitialKB, 100, 10000);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    brief: {
      name: brief.name,
      modes: brief.modes,
      visitorGoal: brief.visitorGoal,
      productMechanism: brief.productMechanism,
      framework: brief.framework
    },
    direction: {
      thesis: `${primary.thesis} The page must prove: ${brief.productMechanism}.`,
      audienceScene: brief.audience,
      firstViewport: primary.structure[0],
      visitorPath: primary.structure,
      primaryAction: brief.visitorGoal,
      media,
      runtime: pickRuntime(media.medium, brief),
      visualWorldPrompt: `Derive one physical or cultural world from ${brief.brand.adjectives.join(", ")}. Carry its material, type, composition, controls, and state across the whole surface.`,
      antiPatterns: buildAntiPatterns(brief, primary, media.medium)
    },
    layout: {
      recommended: primary,
      exploration,
      canon,
      mobileContract: primary.mobile
    },
    typography: {
      recommended: typeSystems[0],
      alternate: typeSystems[1],
      stressTests: ["long heading", "localization expansion", "200% zoom", "narrow container", "font fallback"]
    },
    motion: {
      focal: motions[0],
      supporting: motions.slice(1, 3),
      budget: {
        initialKB: initialBudget,
        routineTransitionMs: brief.modes.includes("operate") ? [120, 250] : [160, 350],
        focalTransitionMs: brief.modes.some((mode) => ["persuade","experience"].includes(mode)) ? [500, 900] : [250, 500]
      }
    },
    interfaceSystem,
    componentSources: components.map(({score, ...source}) => source),
    production: {
      required: brief.media.needsProduction || !brief.media.available.length || brief.media.available.includes("none"),
      deliverables: [
        "desktop state",
        "mobile state",
        "reduced-motion state",
        "loading and failure state",
        "asset provenance manifest"
      ],
      assetNotes: media.medium === "threejs"
        ? ["optimized GLB or procedural source", "poster fallback", "pixel ratio cap", "offscreen pause"]
        : media.medium === "video" || media.medium === "frame-sequence"
          ? ["desktop and mobile encodes", "poster", "seek-ready export when scroll controlled", "deliberate preload"]
          : ["complete static first view"]
    },
    verification: [
      "squint test reveals primary, secondary, and major groups",
      "first viewport explains the offer, artifact, or task within seconds",
      "one signature motion idea carries the surface",
      "keyboard and visual order agree",
      "mobile is recomposed rather than shrunk",
      "reduced motion preserves hierarchy and state",
      "external components are restyled into one visual world",
      "no unresolved rights or public credentials",
      "browser checks pass at 1440px and 390px"
    ],
    decisionsNeedingHumanAuthority: [
      "final visual world",
      "commercial claims and proof",
      "asset licensing acceptance",
      "whether the exploration direction beats the recommended direction"
    ]
  };
}

function parseArgs(argv) {
  const args = { input: null, out: null, pretty: true };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--out") args.out = argv[++index];
    else if (value === "--compact") args.pretty = false;
    else if (!value.startsWith("--") && !args.input) args.input = value;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!args.input) throw new Error("Usage: node scripts/plan-design.mjs <brief.json> [--out plan.json] [--compact]");
  return args;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const brief = JSON.parse(fs.readFileSync(path.resolve(args.input), "utf8"));
    const result = plan(brief);
    const output = JSON.stringify(result, null, args.pretty ? 2 : 0) + "\n";
    if (args.out) {
      const target = path.resolve(args.out);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, output);
      console.log(`Wrote design plan: ${path.relative(process.cwd(), target) || target}`);
    } else {
      process.stdout.write(output);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

export { plan, validateBrief };
