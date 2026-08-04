import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const DEFAULT_STORE = path.resolve(".aigent/inspiration");
export const DEFAULT_VIEWPORTS = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "tablet", width: 1024, height: 768 },
  { id: "mobile", width: 390, height: 844 },
];

export function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return file;
}

export function writeText(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value.endsWith("\n") ? value : `${value}\n`);
  return file;
}

export function slugify(value, fallback = "reference") {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

export function safeId(value) {
  const id = slugify(value);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Unsafe inspiration id: ${value}`);
  return id;
}

export function shortHash(value, length = 8) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
}

export function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function isUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(value) {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  parsed.hash = "";
  return parsed.toString();
}

export function sourceIdFor(input, label) {
  if (label) return safeId(label);
  if (isUrl(input)) {
    const parsed = new URL(input);
    const base = slugify(`${parsed.hostname}${parsed.pathname}`);
    return `${base}-${shortHash(normalizeUrl(input), 6)}`;
  }
  const base = slugify(path.basename(input, path.extname(input)));
  return `${base}-${shortHash(path.resolve(input), 6)}`;
}

export function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

export function hasFlag(args, name) {
  return args.includes(name);
}

export function positional(args, optionNames = []) {
  const optionsWithValues = new Set(optionNames);
  const result = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (optionsWithValues.has(value)) {
      index += 1;
      continue;
    }
    if (!value.startsWith("--")) result.push(value);
  }
  return result;
}

export function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseViewports(value) {
  if (!value) return DEFAULT_VIEWPORTS;
  const parsed = parseList(value).map((entry, index) => {
    const match = /^(?:(?<id>[a-z0-9-]+):)?(?<width>\d+)x(?<height>\d+)$/i.exec(entry);
    if (!match?.groups) throw new Error(`Invalid viewport "${entry}". Use desktop:1440x1000,mobile:390x844.`);
    const width = Number(match.groups.width);
    const height = Number(match.groups.height);
    if (width < 240 || height < 240 || width > 5000 || height > 5000) throw new Error(`Viewport out of range: ${entry}`);
    return { id: match.groups.id || `view-${index + 1}`, width, height };
  });
  const ids = new Set();
  for (const viewport of parsed) {
    if (ids.has(viewport.id)) throw new Error(`Duplicate viewport id: ${viewport.id}`);
    ids.add(viewport.id);
  }
  return parsed;
}

export function percentile(values, amount) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * amount)));
  return sorted[index];
}

export function median(values) {
  return percentile(values, 0.5);
}

export function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
}

export function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function shingles(value, size = 3) {
  const tokens = tokenize(value);
  if (tokens.length < size) return new Set(tokens);
  const output = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) output.add(tokens.slice(index, index + size).join(" "));
  return output;
}

export function jaccard(leftValues, rightValues) {
  const left = leftValues instanceof Set ? leftValues : new Set(leftValues || []);
  const right = rightValues instanceof Set ? rightValues : new Set(rightValues || []);
  if (!left.size && !right.size) return 0;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

export function ratioSimilarity(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right) || left <= 0 || right <= 0) return 0;
  return Math.min(left, right) / Math.max(left, right);
}

export function normalizeCssColor(value) {
  const match = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[/,]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i.exec(String(value || ""));
  if (!match) return null;
  const alphaRaw = match[4];
  const alpha = !alphaRaw ? 1 : alphaRaw.endsWith("%") ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw);
  if (alpha < 0.08) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function rgbDistance(left, right) {
  if (!left || !right) return 1;
  const distance = Math.sqrt(
    ((left[0] - right[0]) ** 2) +
    ((left[1] - right[1]) ** 2) +
    ((left[2] - right[2]) ** 2),
  );
  return clamp(1 - distance / 441.67295593);
}

export function commandExists(command) {
  const probe = process.platform === "win32" ? "where" : "which";
  return spawnSync(probe, [command], { stdio: "ignore" }).status === 0;
}

export function imageMetadata(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length < 24) return { bytes: buffer.length, format: path.extname(file).slice(1).toLowerCase() || "unknown" };

  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { bytes: buffer.length, format: "png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { bytes: buffer.length, format: "jpeg", height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  }

  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    const kind = buffer.subarray(12, 16).toString("ascii");
    if (kind === "VP8X" && buffer.length >= 30) {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { bytes: buffer.length, format: "webp", width, height };
    }
  }

  return { bytes: buffer.length, format: path.extname(file).slice(1).toLowerCase() || "unknown" };
}

export function safeInside(root, candidate) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(candidate);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error(`Path leaves allowed root: ${candidate}`);
  return resolved;
}

export function copyFile(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
  return destination;
}

export function relativePath(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

export function nowIso() {
  return new Date().toISOString();
}

export function humanBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
