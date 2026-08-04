import fs from "node:fs";
import path from "node:path";
import { humanBytes, relativePath, writeText } from "./common.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(values) {
  if (!values?.length) return '<p class="muted">No evidence recorded.</p>';
  return `<ul>${values.map((value) => `<li>${escapeHtml(typeof value === "string" ? value : JSON.stringify(value))}</li>`).join("")}</ul>`;
}

function cards(items) {
  return items.map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></article>`).join("");
}

export function generateSourceReport(directory, source, dna, captures = []) {
  const screenshots = captures.flatMap((capture) => {
    const entries = [];
    for (const [kind, file] of Object.entries(capture.screenshots || {})) {
      entries.push({ viewport: capture.viewport?.id || "view", kind, file });
    }
    return entries;
  });
  const reportFile = path.join(directory, "report.html");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(source.label)} — Design Forensics</title>
<style>
:root{color-scheme:dark;--bg:#0b0d10;--surface:#14171c;--text:#f2efe8;--muted:#9da4ad;--line:#2b3139;--accent:#70e7d5;--warm:#e7a55d;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}main{width:min(1180px,calc(100% - 36px));margin:auto;padding:54px 0 100px}header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:end;padding-bottom:32px;border-bottom:1px solid var(--line)}h1,h2{font-family:"Arial Narrow",Inter,sans-serif;letter-spacing:-.035em;line-height:.92;margin:0}h1{font-size:clamp(3.4rem,8vw,7.5rem);max-width:10ch}h2{font-size:clamp(2rem,4vw,3.8rem)}p{color:var(--muted);line-height:1.65}.meta{font:600 .72rem/1.6 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--accent)}section{padding:48px 0;border-bottom:1px solid var(--line)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin-top:30px}.stats article{background:var(--surface);padding:22px}.stats span{display:block;color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em}.stats strong{display:block;margin-top:10px;font-size:1.3rem}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:42px;margin-top:28px}.screens{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:26px}.screens figure{margin:0;border:1px solid var(--line);background:var(--surface)}.screens img{display:block;width:100%;height:auto}.screens figcaption{padding:12px;color:var(--muted);font:600 .7rem/1.5 ui-monospace,monospace;text-transform:uppercase}code,pre{font-family:ui-monospace,monospace}pre{padding:18px;overflow:auto;border:1px solid var(--line);background:var(--surface);color:#cdd6df;line-height:1.55}ul{padding-left:1.2rem;color:var(--muted);line-height:1.65}.muted{color:var(--muted)}a{color:var(--accent)}@media(max-width:760px){header,.grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.screens{grid-template-columns:1fr}}
</style>
</head>
<body><main>
<header><div><p class="meta">AIgent Design Forensics / ${escapeHtml(source.kind)}</p><h1>${escapeHtml(source.label)}</h1><p>${escapeHtml(source.origin)}</p></div><div class="meta">Confidence ${Math.round((dna.confidence?.overall || 0) * 100)}%</div></header>
<div class="stats">${cards([
  {label:"Topology",value:dna.structure?.topology || "unknown"},
  {label:"Modes",value:(dna.structure?.modes || []).join(" + ") || "unknown"},
  {label:"Motion",value:(dna.motion?.tags || []).join(", ") || "static"},
  {label:"Evidence",value:String(dna.evidence?.viewportCount || captures.length || 0)},
])}</div>
<section><h2>Design DNA</h2><div class="grid"><div><h3>Structure</h3>${list([dna.structure?.topology, ...(dna.structure?.sectionLabels || []), ...(dna.responsive?.transformations || [])].filter(Boolean))}</div><div><h3>Signatures</h3>${list(dna.signatures || [])}</div><div><h3>Typography</h3>${list([...(dna.typography?.categories || []), ...(dna.typography?.families || []).map((entry)=>typeof entry === "string"?entry:entry.value), ...(dna.typography?.roles || []).map((role)=>`${role.role}: ${role.size || ""} ${role.family || ""}`)])}</div><div><h3>Material</h3>${list([...(dna.material?.tags || []), ...([...(dna.material?.foregroundColors || []), ...(dna.material?.backgroundColors || [])]).map((entry)=>typeof entry === "string"?entry:entry.value)])}</div><div><h3>Interaction</h3>${list(dna.interaction?.patterns || [])}</div><div><h3>Media</h3>${list([...(dna.media?.patterns || []), ...(dna.media?.renderers || [])])}</div></div></section>
${screenshots.length ? `<section><h2>Captured evidence</h2><div class="screens">${screenshots.map((shot)=>`<figure><img src="${escapeHtml(shot.file)}" alt="${escapeHtml(`${source.label} ${shot.viewport} ${shot.kind}`)}" loading="lazy" /><figcaption>${escapeHtml(shot.viewport)} / ${escapeHtml(shot.kind)}</figcaption></figure>`).join("")}</div></section>` : ""}
<section><h2>Use as inspiration</h2><p>Reuse the design principle, not the source expression. Assign this reference to one or two dimensions, record a required transformation, and exclude its copy, assets, marks, exact type pairing, exact section order, and source code.</p><pre>node scripts/inspire.mjs compose --brief design-intelligence/example-brief.json --refs ${escapeHtml(source.id)},another-reference --out .aigent/inspiration/projects/my-project/reference-matrix.json</pre></section>
<section><h2>Evidence record</h2><pre>${escapeHtml(JSON.stringify({source:{id:source.id,kind:source.kind,origin:source.origin},confidence:dna.confidence,evidence:dna.evidence},null,2))}</pre></section>
</main></body></html>`;
  writeText(reportFile, html);
  return relativePath(directory, reportFile);
}
