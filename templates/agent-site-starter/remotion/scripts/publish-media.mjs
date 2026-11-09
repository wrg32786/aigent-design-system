// Copy rendered outputs into the site's public/media and write a manifest.
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const mediaDir = path.resolve("..", "public", "media");
const files = ["hero-desktop.mp4", "hero-mobile.mp4", "hero-poster.jpg", "hero-still.jpg"];
fs.mkdirSync(mediaDir, { recursive: true });
for (const file of files) {
  const source = path.join(outDir, file);
  if (!fs.existsSync(source)) throw new Error(`Missing render output: ${file}`);
  fs.copyFileSync(source, path.join(mediaDir, file));
}
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const manifest = {
  composition: "HeroLoop",
  compositionVersion: pkg.version,
  remotion: pkg.dependencies.remotion,
  renderedAt: new Date().toISOString(),
  outputs: files.map((file) => `/media/${file}`),
};
fs.writeFileSync(path.join(mediaDir, "hero-loop.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Copied hero loop renders to public/media. Set heroVideo in src/site.config.ts:");
console.log(JSON.stringify({ desktop: "/media/hero-desktop.mp4", mobile: "/media/hero-mobile.mp4", poster: "/media/hero-poster.jpg", still: "/media/hero-still.jpg" }, null, 2));
