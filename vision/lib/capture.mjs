import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { VISUAL_DIMENSIONS, createReviewTemplate, outputRoot, readJson, relativeTo, requiredViewportIds, writeJson } from "./common.mjs";

function mimeType(file) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return types[path.extname(file).toLowerCase()] || "application/octet-stream";
}

async function startStaticServer(target) {
  const root = fs.statSync(target).isDirectory() ? target : path.dirname(target);
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && fs.existsSync(path.join(root, "index.html"))) file = path.join(root, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const stat = fs.statSync(file);
    response.writeHead(200, {
      "content-type": mimeType(file),
      "content-length": stat.size,
      "cache-control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function revealFullPage(page) {
  await page.evaluate(async () => {
    const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const step = Math.max(240, Math.floor(innerHeight * 0.72));
    let position = 0;
    let maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    while (position < maximum) {
      position = Math.min(maximum, position + step);
      scrollTo({ top: position, behavior: "instant" });
      await pause(80);
      maximum = Math.max(maximum, document.documentElement.scrollHeight - innerHeight);
    }
    scrollTo({ top: 0, behavior: "instant" });
    await pause(160);
  });
}

async function annotatePage(page, maxElements = 72) {
  return page.evaluate((maximum) => {
    const prior = document.querySelector('[data-aigent-vision-overlay="root"]');
    prior?.remove();

    function visible(element) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) <= 0.02) return false;
      if (element.closest('[aria-hidden="true"]')) return false;
      return rect.width >= 20 && rect.height >= 14 && rect.bottom >= 0 && rect.top <= document.documentElement.scrollHeight;
    }

    function selectorFor(element) {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const parts = [];
      let current = element;
      while (current && current !== document.body && parts.length < 5) {
        let part = current.tagName.toLowerCase();
        const stableClasses = [...current.classList].filter((name) => !/^is-|^has-|^active$|^open$|^selected$/.test(name)).slice(0, 2);
        if (stableClasses.length) part += `.${stableClasses.map((name) => CSS.escape(name)).join(".")}`;
        const siblings = current.parentElement ? [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName) : [];
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join(" > ");
    }

    const selectors = [
      "header", "nav", "main", "section", "article", "aside", "footer",
      "h1", "h2", "h3", "p", "ul", "ol", "form", "dialog",
      "a[href]", "button", "input:not([type=hidden])", "select", "textarea",
      "img", "picture", "video", "canvas", "model-viewer", "iframe",
      "[role=button]", "[role=tab]", "[role=dialog]", "[data-reveal]",
    ];
    const all = [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const text = (element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim();
        const semantic = /^(HEADER|NAV|MAIN|SECTION|ARTICLE|ASIDE|FOOTER|H1|H2|H3|DIALOG|IMG|VIDEO|CANVAS|MODEL-VIEWER)$/.test(element.tagName)
          || element.matches('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab]');
        return {
          element,
          rect,
          text,
          score: (semantic ? 100000 : 0) + Math.min(rect.width * rect.height, 90000) + Math.min(text.length * 80, 8000),
        };
      })
      .sort((left, right) => right.score - left.score);

    const chosen = [];
    for (const candidate of all) {
      if (chosen.length >= maximum) break;
      const duplicate = chosen.some((selected) => {
        const sameBounds = Math.abs(selected.rect.left - candidate.rect.left) < 2
          && Math.abs(selected.rect.top - candidate.rect.top) < 2
          && Math.abs(selected.rect.width - candidate.rect.width) < 2
          && Math.abs(selected.rect.height - candidate.rect.height) < 2;
        return sameBounds || (selected.element.contains(candidate.element) && candidate.rect.width * candidate.rect.height > selected.rect.width * selected.rect.height * 0.82);
      });
      if (!duplicate) chosen.push(candidate);
    }
    chosen.sort((left, right) => left.rect.top - right.rect.top || left.rect.left - right.rect.left);

    const root = document.createElement("div");
    root.dataset.aigentVisionOverlay = "root";
    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      width: `${Math.max(document.documentElement.scrollWidth, innerWidth)}px`,
      height: `${Math.max(document.documentElement.scrollHeight, innerHeight)}px`,
      pointerEvents: "none",
      zIndex: "2147483647",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    });

    const elements = chosen.map((candidate, index) => {
      const id = `E${String(index + 1).padStart(3, "0")}`;
      const rect = candidate.element.getBoundingClientRect();
      const documentRect = {
        x: Math.round(rect.left + scrollX),
        y: Math.round(rect.top + scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      const style = getComputedStyle(candidate.element);
      const box = document.createElement("div");
      Object.assign(box.style, {
        position: "absolute",
        left: `${documentRect.x}px`,
        top: `${documentRect.y}px`,
        width: `${Math.max(1, documentRect.width)}px`,
        height: `${Math.max(1, documentRect.height)}px`,
        border: "2px solid rgba(101,244,223,.82)",
        boxShadow: "inset 0 0 0 1px rgba(3,8,7,.8)",
        boxSizing: "border-box",
      });
      const label = document.createElement("span");
      label.textContent = id;
      Object.assign(label.style, {
        position: "absolute",
        left: "-2px",
        top: "-18px",
        padding: "3px 5px",
        background: "#030807",
        color: "#65f4df",
        border: "1px solid rgba(101,244,223,.82)",
        fontSize: "10px",
        fontWeight: "700",
        lineHeight: "1",
        letterSpacing: ".05em",
      });
      box.append(label);
      root.append(box);
      return {
        id,
        selector: selectorFor(candidate.element),
        tag: candidate.element.tagName.toLowerCase(),
        role: candidate.element.getAttribute("role") || null,
        label: candidate.text.slice(0, 140),
        rect: documentRect,
        styles: {
          display: style.display,
          position: style.position,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          zIndex: style.zIndex,
        },
      };
    });
    document.body.append(root);
    return elements;
  }, maxElements);
}

function visualPrompt(task, templatePath) {
  const captures = task.captures.map((capture) => `- ${capture.viewport}: ${capture.original} and ${capture.annotated}`).join("\n");
  return `# AIgent Vision review task\n\nYou must open every original and annotated image before writing the review. Do not infer visual quality from source code, dimensions, or the mechanical score alone.\n\n## Captures\n\n${captures}\n\n## Review dimensions\n\n${VISUAL_DIMENSIONS.map((dimension) => `- **${dimension.label}:** ${dimension.prompt}`).join("\n")}\n\n## Required output\n\n1. Copy ${templatePath}.\n2. Set every viewport to \`reviewed\`.\n3. Give every dimension a status of \`pass\`, \`issue\`, or \`not-applicable\` with a concrete rationale.\n4. Record every actionable finding with viewport, priority, dimension, visible evidence, recommendation, and relevant element IDs from the annotated image.\n5. Use \`P0\` only for a broken or unsafe surface, \`P1\` for a ship-blocking design problem, \`P2\` for meaningful polish, and \`P3\` for optional refinement.\n6. Never mark a capture reviewed unless it was actually opened.\n7. Run \`aigent-design vision finalize --review <file>\` when complete.\n`;
}

async function browserUrl(target, report, explicitUrl) {
  if (explicitUrl) return { url: explicitUrl, server: null };
  const pageUrl = report.pageUrl || "";
  if (pageUrl && !/^http:\/\/(?:127\.0\.0\.1|localhost):\d+\//.test(pageUrl)) return { url: pageUrl, server: null };
  const server = await startStaticServer(target);
  let entry = "/index.html";
  const config = path.join(target, "aigent.resolve.json");
  if (fs.existsSync(config)) entry = readJson(config).entry || entry;
  return { url: new URL(entry, `${server.baseUrl}/`).href, server };
}

export async function prepareVisionReview(options = {}) {
  const target = path.resolve(options.target || process.cwd());
  const root = outputRoot(target, options.out);
  const reportFile = path.resolve(options.report || path.join(root, "latest.json"));
  if (!fs.existsSync(reportFile)) throw new Error(`Resolve report not found: ${reportFile}`);
  const report = options.reportObject || readJson(reportFile);
  if (!report.runId) throw new Error("Resolve report has no runId.");
  if (!report.captures?.length) throw new Error("Resolve report has no rendered captures. Run Resolve with browser checks first.");

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error("Playwright is required for AIgent Vision. Run npm install and npx playwright install chromium.");
  }

  const runDirectory = path.join(root, "runs", report.runId);
  fs.mkdirSync(runDirectory, { recursive: true });
  const { url, server } = await browserUrl(target, report, options.url);
  const browser = await chromium.launch({ headless: true });
  const captures = [];
  const elementMap = { schemaVersion: 1, runId: report.runId, generatedAt: new Date().toISOString(), viewports: {} };
  try {
    for (const capture of report.captures) {
      const viewportId = capture.reducedMotion ? "reduced-motion" : capture.viewport.id;
      const context = await browser.newContext({
        viewport: { width: capture.viewport.width, height: capture.viewport.height },
        reducedMotion: capture.reducedMotion ? "reduce" : "no-preference",
      });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        await page.waitForTimeout(250);
        await revealFullPage(page);
        const elements = await annotatePage(page, Number(options.maxElements || 72));
        const annotated = path.join(runDirectory, `${viewportId}.annotated.png`);
        await page.screenshot({ path: annotated, fullPage: true, animations: "disabled" });
        elementMap.viewports[viewportId] = elements;
        const original = path.resolve(target, capture.file);
        captures.push({
          viewport: viewportId,
          width: capture.viewport.width,
          height: capture.viewport.height,
          reducedMotion: Boolean(capture.reducedMotion),
          original: relativeTo(target, original),
          annotated: relativeTo(target, annotated),
        });
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (server) await server.close();
  }

  const elementMapFile = path.join(runDirectory, "element-map.json");
  writeJson(elementMapFile, elementMap);
  const task = {
    schemaVersion: 1,
    runId: report.runId,
    generatedAt: new Date().toISOString(),
    status: "awaiting-review",
    target: relativeTo(target, target),
    pageUrl: report.pageUrl || url,
    mechanicalReport: relativeTo(target, reportFile),
    requiredViewports: requiredViewportIds(report),
    dimensions: VISUAL_DIMENSIONS,
    captures,
    elementMap: relativeTo(target, elementMapFile),
    requiredOutput: relativeTo(target, path.join(root, "latest.visual-review.json")),
  };
  const taskFile = path.join(runDirectory, "visual-review-task.json");
  writeJson(taskFile, task);
  writeJson(path.join(root, "latest.visual-review-task.json"), task);
  const template = createReviewTemplate(report, task);
  const templateFile = path.join(root, "latest.visual-review.template.json");
  writeJson(templateFile, template);
  fs.writeFileSync(path.join(root, "latest.visual-review.prompt.md"), visualPrompt(task, relativeTo(target, templateFile)));
  return { task, templateFile, taskFile, elementMapFile };
}
