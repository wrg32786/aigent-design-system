#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "desktop", "resources", "generated");
fs.mkdirSync(output, { recursive: true });

function canvas(width, height) {
  return { width, height, pixels: Buffer.alloc(width * height * 4) };
}
function blend(target, offset, r, g, b, a = 255) {
  const alpha = a / 255;
  target[offset] = Math.round(r * alpha + target[offset] * (1 - alpha));
  target[offset + 1] = Math.round(g * alpha + target[offset + 1] * (1 - alpha));
  target[offset + 2] = Math.round(b * alpha + target[offset + 2] * (1 - alpha));
  target[offset + 3] = 255;
}
function pixel(image, x, y, color) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  blend(image.pixels, (y * image.width + x) * 4, ...color);
}
function fill(image, top = [3, 8, 7], bottom = [7, 20, 17]) {
  for (let y = 0; y < image.height; y += 1) {
    const t = y / Math.max(1, image.height - 1);
    for (let x = 0; x < image.width; x += 1) {
      const edge = Math.min(1, Math.hypot((x / image.width) - .55, (y / image.height) - .4));
      const glow = Math.max(0, 1 - edge * 1.8);
      const r = Math.round(top[0] * (1 - t) + bottom[0] * t + glow * 4);
      const g = Math.round(top[1] * (1 - t) + bottom[1] * t + glow * 16);
      const b = Math.round(top[2] * (1 - t) + bottom[2] * t + glow * 14);
      pixel(image, x, y, [r, g, b, 255]);
    }
  }
}
function line(image, x0, y0, x1, y1, color, thickness = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (let oy = -thickness; oy <= thickness; oy += 1) for (let ox = -thickness; ox <= thickness; ox += 1) pixel(image, x + ox, y + oy, color);
  }
}
function circle(image, cx, cy, radius, color, fillCircle = false, thickness = 1) {
  const minX = Math.floor(cx - radius - thickness), maxX = Math.ceil(cx + radius + thickness);
  const minY = Math.floor(cy - radius - thickness), maxY = Math.ceil(cy + radius + thickness);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x - cx, y - cy);
      if ((fillCircle && distance <= radius) || (!fillCircle && Math.abs(distance - radius) <= thickness)) pixel(image, x, y, color);
    }
  }
}
function ellipse(image, cx, cy, rx, ry, angle, color, thickness = 1) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const extent = Math.ceil(Math.max(rx, ry) + thickness * 2);
  for (let y = cy - extent; y <= cy + extent; y += 1) {
    for (let x = cx - extent; x <= cx + extent; x += 1) {
      const dx = x - cx, dy = y - cy;
      const ux = dx * cos + dy * sin;
      const uy = -dx * sin + dy * cos;
      const value = Math.sqrt((ux * ux) / (rx * rx) + (uy * uy) / (ry * ry));
      if (Math.abs(value - 1) <= thickness / Math.max(rx, ry)) pixel(image, x, y, color);
    }
  }
}
function grid(image, spacing, color) {
  for (let x = 0; x < image.width; x += spacing) line(image, x, 0, x, image.height, color);
  for (let y = 0; y < image.height; y += spacing) line(image, 0, y, image.width, y, color);
}
function orbit(image, cx, cy, radius) {
  for (let r = radius; r > 0; r -= 1) {
    const t = r / radius;
    circle(image, cx, cy, r, [Math.round(28 + 90 * t), Math.round(68 + 120 * t), Math.round(120 + 120 * t), 16], true);
  }
  ellipse(image, cx, cy, radius * 1.55, radius * .48, .42, [185, 220, 82, 220], 2);
  ellipse(image, cx, cy, radius * 1.55, radius * .48, 1.34, [185, 220, 82, 190], 2);
  circle(image, cx - radius * 1.25, cy - radius * .32, Math.max(2, radius * .06), [101, 244, 223, 255], true);
}
function frame(image, margin = 8) {
  line(image, margin, margin, image.width - margin, margin, [101, 244, 223, 80]);
  line(image, image.width - margin, margin, image.width - margin, image.height - margin, [101, 244, 223, 80]);
  line(image, image.width - margin, image.height - margin, margin, image.height - margin, [101, 244, 223, 80]);
  line(image, margin, image.height - margin, margin, margin, [101, 244, 223, 80]);
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = crcTable();
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
function writePng(file, image) {
  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const row = y * (image.width * 4 + 1);
    raw[row] = 0;
    image.pixels.copy(raw, row + 1, y * image.width * 4, (y + 1) * image.width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0); ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), pngChunk("IHDR", ihdr), pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })), pngChunk("IEND", Buffer.alloc(0))]);
  fs.writeFileSync(file, png);
}
function writeBmp(file, image) {
  const rowSize = Math.ceil((image.width * 3) / 4) * 4;
  const pixelBytes = rowSize * image.height;
  const header = Buffer.alloc(54);
  header.write("BM", 0); header.writeUInt32LE(54 + pixelBytes, 2); header.writeUInt32LE(54, 10);
  header.writeUInt32LE(40, 14); header.writeInt32LE(image.width, 18); header.writeInt32LE(image.height, 22);
  header.writeUInt16LE(1, 26); header.writeUInt16LE(24, 28); header.writeUInt32LE(pixelBytes, 34);
  const body = Buffer.alloc(pixelBytes);
  for (let y = 0; y < image.height; y += 1) {
    const sourceY = image.height - y - 1;
    for (let x = 0; x < image.width; x += 1) {
      const source = (sourceY * image.width + x) * 4;
      const target = y * rowSize + x * 3;
      body[target] = image.pixels[source + 2]; body[target + 1] = image.pixels[source + 1]; body[target + 2] = image.pixels[source];
    }
  }
  fs.writeFileSync(file, Buffer.concat([header, body]));
}

function sidebar() {
  const image = canvas(164, 314); fill(image); grid(image, 24, [101, 244, 223, 10]); frame(image, 7);
  orbit(image, 82, 104, 38);
  line(image, 28, 205, 136, 205, [101, 244, 223, 120], 1);
  line(image, 28, 224, 108, 224, [242, 244, 239, 190], 2);
  line(image, 28, 239, 128, 239, [242, 244, 239, 160], 2);
  line(image, 28, 269, 92, 269, [240, 122, 82, 180], 1);
  writeBmp(path.join(output, "installer-sidebar.bmp"), image);
}
function header() {
  const image = canvas(150, 57); fill(image); grid(image, 18, [101, 244, 223, 12]);
  orbit(image, 122, 28, 15);
  line(image, 10, 17, 78, 17, [101, 244, 223, 210], 2);
  line(image, 10, 30, 94, 30, [242, 244, 239, 180], 2);
  line(image, 10, 42, 62, 42, [240, 122, 82, 180], 1);
  writeBmp(path.join(output, "installer-header.bmp"), image);
}
function dmg(scale = 1) {
  const image = canvas(540 * scale, 380 * scale); fill(image); grid(image, 48 * scale, [101, 244, 223, 9]); frame(image, 18 * scale);
  orbit(image, 270 * scale, 108 * scale, 55 * scale);
  circle(image, 166 * scale, 265 * scale, 54 * scale, [101, 244, 223, 50], true);
  circle(image, 374 * scale, 265 * scale, 54 * scale, [242, 244, 239, 24], true);
  line(image, 220 * scale, 265 * scale, 320 * scale, 265 * scale, [101, 244, 223, 150], 2 * scale);
  line(image, 300 * scale, 250 * scale, 320 * scale, 265 * scale, [101, 244, 223, 150], 2 * scale);
  line(image, 300 * scale, 280 * scale, 320 * scale, 265 * scale, [101, 244, 223, 150], 2 * scale);
  writePng(path.join(output, scale === 1 ? "dmg-background.png" : "dmg-background@2x.png"), image);
}

sidebar(); header(); dmg(1); dmg(2);
console.log(`Generated desktop installer assets in ${path.relative(root, output)}.`);
