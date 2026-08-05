import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_STORE,
  ensureDir,
  nowIso,
  readJson,
  safeId,
  safeInside,
  writeJson,
} from "./common.mjs";

export function openStore(root = DEFAULT_STORE) {
  const resolved = path.resolve(root);
  for (const child of ["sources", "projects", "tmp"]) ensureDir(path.join(resolved, child));
  const indexFile = path.join(resolved, "index.json");
  if (!fs.existsSync(indexFile)) writeJson(indexFile, { schemaVersion: 1, updatedAt: nowIso(), sources: [] });
  return { root: resolved, indexFile };
}

export function sourceDirectory(store, id) {
  const directory = path.join(store.root, "sources", safeId(id));
  safeInside(store.root, directory);
  return directory;
}

export function projectDirectory(store, id) {
  const directory = path.join(store.root, "projects", safeId(id));
  safeInside(store.root, directory);
  return directory;
}

export function loadIndex(store) {
  const index = readJson(store.indexFile);
  if (!Array.isArray(index.sources)) index.sources = [];
  return index;
}

export function saveIndex(store, index) {
  index.schemaVersion = 1;
  index.updatedAt = nowIso();
  index.sources.sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
  writeJson(store.indexFile, index);
  return index;
}

export function upsertSource(store, source) {
  const index = loadIndex(store);
  const summary = {
    id: source.id,
    label: source.label,
    kind: source.kind,
    origin: source.origin,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt || nowIso(),
    tags: source.designDna?.signatures || source.tags || [],
    report: source.report || null,
    confidence: source.designDna?.confidence?.overall ?? null,
  };
  const existing = index.sources.findIndex((item) => item.id === source.id);
  if (existing >= 0) index.sources[existing] = summary;
  else index.sources.push(summary);
  saveIndex(store, index);
  return summary;
}

export function saveSource(store, source, designDna) {
  const directory = sourceDirectory(store, source.id);
  ensureDir(directory);
  source.updatedAt = nowIso();
  if (!source.createdAt) source.createdAt = source.updatedAt;
  if (designDna) source.designDna = designDna;
  writeJson(path.join(directory, "source.json"), source);
  if (designDna) writeJson(path.join(directory, "design-dna.json"), designDna);
  upsertSource(store, source);
  return directory;
}

export function loadSource(store, id) {
  const directory = sourceDirectory(store, id);
  const sourceFile = path.join(directory, "source.json");
  if (!fs.existsSync(sourceFile)) throw new Error(`Unknown inspiration source: ${id}`);
  const source = readJson(sourceFile);
  const dnaFile = path.join(directory, "design-dna.json");
  if (fs.existsSync(dnaFile)) source.designDna = readJson(dnaFile);
  source.directory = directory;
  return source;
}

export function listSources(store) {
  return loadIndex(store).sources;
}

export function resolveSources(store, ids) {
  return ids.map((id) => loadSource(store, id));
}

export function saveProject(store, id, files) {
  const directory = projectDirectory(store, id);
  ensureDir(directory);
  for (const [name, value] of Object.entries(files)) {
    const target = path.join(directory, name);
    if (typeof value === "string") fs.writeFileSync(target, value.endsWith("\n") ? value : `${value}\n`);
    else writeJson(target, value);
  }
  return directory;
}
