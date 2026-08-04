import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  commandExists,
  copyFile,
  ensureDir,
  hashFile,
  imageMetadata,
  nowIso,
  readJson,
  relativePath,
  sourceIdFor,
  writeJson,
} from "./common.mjs";
import { deriveDesignDna, emptyDesignDna } from "./design-dna.mjs";
import { generateSourceReport } from "./report.mjs";
import { openStore, saveSource, sourceDirectory } from "./store.mjs";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".mkv", ".webm", ".avi"]);
const JSON_EXTENSIONS = new Set([".json"]);

function mergeAnalysis(base, supplied) {
  if (!supplied) return base;
  return {
    ...base,
    ...supplied,
    source: { ...(base.source || {}), ...(supplied.source || {}) },
    confidence: { ...(base.confidence || {}), ...(supplied.confidence || {}) },
    evidence: { ...(base.evidence || {}), ...(supplied.evidence || {}) },
  };
}

function inferKind(file, explicit) {
  if (explicit) return explicit;
  const extension = path.extname(file).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return "screenshot";
  if (VIDEO_EXTENSIONS.has(extension)) return "motion-reference";
  if (JSON_EXTENSIONS.has(extension)) return "structured-reference";
  return "file";
}

function captureVideoFrames(source, destination, count = 7) {
  if (!commandExists("ffmpeg") || !commandExists("ffprobe")) return { frames: [], warning: "FFmpeg and ffprobe were not both available; no filmstrip was extracted." };
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", source], { encoding: "utf8" });
  const duration = Number.parseFloat(probe.stdout || "0");
  if (!Number.isFinite(duration) || duration <= 0) return { frames: [], warning: "Video duration could not be read." };
  const frames = [];
  for (let index = 0; index < count; index += 1) {
    const progress = count === 1 ? 0 : index / (count - 1);
    const at = Math.max(0, Math.min(duration - 0.02, duration * progress));
    const target = path.join(destination, `motion-${String(index).padStart(2, "0")}.jpg`);
    const result = spawnSync("ffmpeg", ["-loglevel", "error", "-ss", String(at), "-i", source, "-frames:v", "1", "-q:v", "2", "-y", target]);
    if (result.status === 0 && fs.existsSync(target)) frames.push({ progress, at, file: path.basename(target) });
  }
  return { duration, frames };
}

export function importFile(input, options = {}) {
  const sourceFile = path.resolve(input);
  if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) throw new Error(`Inspiration file not found: ${input}`);
  const id = options.id || sourceIdFor(sourceFile, options.label);
  const store = openStore(options.root);
  const directory = sourceDirectory(store, id);
  const capturesDirectory = ensureDir(path.join(directory, "captures"));
  const evidenceDirectory = ensureDir(path.join(directory, "evidence"));
  const kind = inferKind(sourceFile, options.kind);
  const extension = path.extname(sourceFile).toLowerCase();
  const copied = path.join(capturesDirectory, `source${extension || ".bin"}`);
  copyFile(sourceFile, copied);

  const evidence = {
    kind,
    file: relativePath(directory, copied),
    sha256: hashFile(sourceFile),
    bytes: fs.statSync(sourceFile).size,
  };
  let captures = [];
  if (IMAGE_EXTENSIONS.has(extension)) {
    evidence.image = imageMetadata(sourceFile);
    captures = [{
      viewport: { id: "source", width: evidence.image.width || 0, height: evidence.image.height || 0 },
      screenshots: { source: relativePath(directory, copied) },
      page: { title: options.label || path.basename(sourceFile), documentWidth: evidence.image.width || 0, documentHeight: evidence.image.height || 0 },
      elements: [], sections: [], interactions: [], media: [{ kind: "image", source: relativePath(directory, copied), rect: { x: 0, y: 0, width: evidence.image.width || 0, height: evidence.image.height || 0 } }],
      mediaSummary: { images: 1, video: 0, audio: 0, canvas: 0, svg: 0, iframe: 0 },
      interactionSummary: { links: 0, buttons: 0, inputs: 0, dialogs: 0 },
      animations: [], copy: { headings: [], sample: "" },
    }];
  } else if (VIDEO_EXTENSIONS.has(extension)) {
    evidence.video = captureVideoFrames(sourceFile, capturesDirectory, Math.max(3, options.frames || 7));
  } else if (JSON_EXTENSIONS.has(extension)) {
    try { evidence.structured = readJson(sourceFile); } catch (error) { evidence.parseError = error.message; }
  }

  writeJson(path.join(evidenceDirectory, "file.json"), evidence);
  let dna = captures.length ? deriveDesignDna(captures, { id, kind, origin: sourceFile, capturedAt: nowIso() }) : emptyDesignDna(kind, "This source needs model-assisted visual annotation before its design details can be trusted.");
  let supplied = null;
  if (options.analysis) {
    const analysisFile = path.resolve(options.analysis);
    supplied = readJson(analysisFile);
    copyFile(analysisFile, path.join(evidenceDirectory, "analysis.json"));
  } else if (evidence.structured?.structure || evidence.structured?.designDna) supplied = evidence.structured.designDna || evidence.structured;
  dna = mergeAnalysis(dna, supplied);
  dna.source = { id, kind, origin: sourceFile, capturedAt: nowIso() };
  dna.confidence = {
    ...(dna.confidence || {}),
    overall: supplied ? Math.max(dna.confidence?.overall || 0, 0.72) : Math.min(dna.confidence?.overall || 0.25, 0.35),
    limitation: supplied ? "A supplied annotation was merged with file evidence." : "File metadata alone cannot recover reliable layout, typography, material, or interaction details.",
  };

  const capturedAt = nowIso();
  const source = {
    schemaVersion: 1,
    id,
    label: options.label || path.basename(sourceFile),
    kind,
    origin: sourceFile,
    createdAt: capturedAt,
    updatedAt: capturedAt,
    capture: { sourceFile: path.basename(sourceFile), frames: evidence.video?.frames || [], analysisProvided: Boolean(supplied) },
    evidence: [{ file: "evidence/file.json", source: relativePath(directory, copied) }],
  };
  saveSource(store, source, dna);
  source.report = generateSourceReport(directory, source, dna, captures);
  saveSource(store, source, dna);
  return { store, directory, source, designDna: dna, evidence };
}
