#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPaths } from "./design-audit.mjs";

const SOURCE_EXTENSIONS = new Set([
  ".html", ".css", ".js", ".mjs", ".jsx", ".ts", ".tsx", ".astro", ".vue", ".svelte",
]);
const DEFAULT_IGNORES = new Set([
  ".git", ".aigent", "node_modules", "dist", "build", "coverage", ".next", ".nuxt", ".svelte-kit",
]);
const DEFAULT_VIEWPORTS = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "tablet", width: 1024, height: 768 },
  { id: "mobile", width: 390, height: 844 },
];
const DEFAULT_CONFIG = {
  schemaVersion: 1,
  entry: "/index.html",
  surfaceMode: "persuade",
  gate: {
    minimumScore: 90,
    maxErrors: 0,
    maxWarnings: 5,
    requireHumanReview: true,
  },
  checks: {
    static: true,
    browser: true,
    reducedMotion: true,
    zoom200: true,
    contrast: true,
    touchTargets: true,
  },
  viewports: DEFAULT_VIEWPORTS,
  ignore: [...DEFAULT_IGNORES],
};

const RULES = {
  "browser/navigation": [25, "P0", "Make the target page load successfully before changing the design."],
  "browser/page-error": [18, "P0", "Fix the first runtime exception at its shared source, then rerun the resolver."],
  "browser/http-status": [18, "P0", "Fix the route or server response so the target returns a successful document."],
  "responsive/horizontal-overflow": [14, "P1", "Find the widest rendered node and recompose it for this viewport; do not hide overflow as the first fix."],
  "responsive/zoom-overflow": [12, "P1", "Rework fixed dimensions and text containers so the page survives 200% text sizing."],
  "a11y/contrast": [10, "P1", "Adjust the semantic foreground or surface role; preserve the selected palette while meeting contrast."],
  "a11y/focus-visible": [10, "P1", "Add an intentional visible focus state to the shared interactive primitive."],
  "a11y/touch-target": [6, "P2", "Increase the hit area without inflating the visible control unnecessarily."],
  "a11y/reduced-motion": [10, "P1", "Provide a complete reduced-motion state that preserves hierarchy and meaning."],
  "layout/clipped-text": [8, "P1", "Fix the constraining container, line height, or responsive composition; do not truncate required content."],
  "layout/fixed-coverage": [5, "P2", "Reduce or recompose fixed chrome so it does not dominate the usable viewport."],
  "browser/request-failure": [3, "P2", "Remove the failed dependency or provide a local, loading, and failure path."],
  "performance/image-dimensions": [3, "P2", "Declare intrinsic image dimensions or aspect ratio to prevent layout shift."],
  "content/placeholder": [5, "P2", "Replace placeholder language with product-specific copy and proof."],
  "taste/identical-card-grid": [4, "P2", "Verify that the content is truly a set of bounded peers; otherwise use a stronger page topology."],
  "taste/repeated-eyebrow": [2, "P3", "Reduce repeated labels when they flatten the hierarchy."],
  "taste/gradient-text": [3, "P3", "Use type scale, weight, spacing, or a solid semantic color unless the visual world specifically earns gradient text."],
  "taste/pure-black-background": [2, "P3", "Use a ground color from the visual world rather than default black."],
  "performance/transition-all": [3, "P2", "Transition only the properties that change."],
  "performance/will-change-overuse": [3, "P2", "Keep compositor hints targeted and temporary."],
};

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function hasFlag(args, name) {
  return args.includes(name);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function runId() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function mergeConfig(base, override = {}) {
  return {
    ...base,
    ...override,
    gate: { ...base.gate, ...(override.gate || {}) },
    checks: { ...base.checks, ...(override.checks || {}) },
    viewports: override.viewports || base.viewports,
    ignore: override.ignore || base.ignore,
  };
}

function resolveConfig(target, configPath) {
  const selected = configPath
    ? path.resolve(configPath)
    : fs.existsSync(path.join(target, "aigent.resolve.json"))
      ? path.join(target, "aigent.resolve.json")
      : null;
  const config = selected ? mergeConfig(DEFAULT_CONFIG, readJson(selected)) : structuredClone(DEFAULT_CONFIG);
  return { config, path: selected };
}

export function initResolveConfig(target = process.cwd(), options = {}) {
  const root = path.resolve(target);
  const configFile = path.join(root, "aigent.resolve.json");
  if (!fs.existsSync(configFile) || options.force) {
    writeJson(configFile, DEFAULT_CONFIG);
  }
  const ignoreFile = path.join(root, ".gitignore");
  const existing = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, "utf8") : "";
  const lines = [".aigent/resolve/", ".aigent/inspiration/sources/", ".aigent/inspiration/index.json"];
  const missing = lines.filter((line) => !existing.split(/\r?\n/).includes(line));
  if (missing.length) {
    fs.appendFileSync(ignoreFile, `${existing && !existing.endsWith("\n") ? "\n" : ""}${missing.join("\n")}\n`);
  }
  return configFile;
}

function findProjectRoot(start) {
  let current = fs.statSync(start).isDirectory() ? start : path.dirname(start);
  while (true) {
    if (fs.existsSync(path.join(current, "package.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return fs.statSync(start).isDirectory() ? start : path.dirname(start);
    current = parent;
  }
}

function collectAuditFiles(root, ignoreNames = []) {
  const ignored = new Set([...DEFAULT_IGNORES, ...ignoreNames]);
  const projectRoot = findProjectRoot(root);
  const files = new Set();
  const queue = [];

  function allowed(current) {
    const relative = path.relative(projectRoot, current);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
    return !relative.split(path.sep).some((segment) => ignored.has(segment));
  }

  function add(current) {
    if (!fs.existsSync(current) || !fs.statSync(current).isFile() || !allowed(current)) return;
    if (!SOURCE_EXTENSIONS.has(path.extname(current).toLowerCase()) || files.has(current)) return;
    files.add(current);
    queue.push(current);
  }

  function visit(current) {
    if (!fs.existsSync(current) || !allowed(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) visit(path.join(current, entry));
      return;
    }
    add(current);
  }

  function references(file, source) {
    const extension = path.extname(file).toLowerCase();
    const values = [];
    if (extension === ".html") {
      for (const match of source.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) values.push(match[1]);
    } else if (extension === ".css") {
      for (const match of source.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)/gi)) values.push(match[1]);
    } else {
      for (const match of source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)) values.push(match[1]);
    }
    return values;
  }

  function resolveReference(file, declared) {
    if (!declared || /^(?:[a-z]+:|\/\/|#|data:)/i.test(declared)) return null;
    const clean = declared.split(/[?#]/)[0];
    const base = clean.startsWith("/")
      ? path.join(projectRoot, clean.slice(1))
      : path.resolve(path.dirname(file), clean);
    const candidates = [base];
    if (!path.extname(base)) candidates.push(`${base}.js`, `${base}.mjs`, `${base}.css`, path.join(base, "index.js"));
    return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
  }

  visit(root);
  while (queue.length) {
    const file = queue.shift();
    const source = fs.readFileSync(file, "utf8");
    for (const declared of references(file, source)) {
      const resolved = resolveReference(file, declared);
      if (resolved) add(resolved);
    }
  }
  return [...files].sort();
}

function staticFindings(target, config) {
  if (!config.checks.static) return { files: [], findings: [] };
  const files = collectAuditFiles(target, config.ignore);
  if (!files.length) {
    return {
      files,
      findings: [{
        file: path.relative(process.cwd(), target) || ".",
        line: 1,
        rule: "resolve/no-source-files",
        severity: "error",
        message: "No supported frontend source files were found in the target.",
      }],
    };
  }
  return auditPaths(files);
}

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

function browserFinding(rule, severity, message, viewport, detail = {}) {
  return {
    file: detail.file || `<browser:${viewport}>`,
    line: 1,
    rule,
    severity,
    message,
    viewport,
    ...detail,
  };
}

async function collectPageEvidence(page, viewport, config) {
  const evidence = await page.evaluate(({ checkContrast, checkTouchTargets }) => {
    function visible(element) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.02 && rect.width > 0 && rect.height > 0;
    }

    function parseColor(value) {
      const match = /^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(value || "");
      if (!match) return null;
      return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] == null ? 1 : Number(match[4]) };
    }

    function luminance(color) {
      const values = [color.r, color.g, color.b].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }

    function contrast(foreground, background) {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return (lighter + 0.05) / (darker + 0.05);
    }

    function effectiveBackground(element) {
      let current = element;
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color && color.a >= 0.98) return color;
        current = current.parentElement;
      }
      return parseColor(getComputedStyle(document.body).backgroundColor);
    }

    const interactive = [...document.querySelectorAll(
      'a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"]),[role="button"]',
    )].filter(visible).slice(0, 80);
    const missingFocus = [];
    for (const element of interactive.slice(0, 24)) {
      element.focus({ preventScroll: true });
      const style = getComputedStyle(element);
      const outlined = style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
      const shadowed = style.boxShadow && style.boxShadow !== "none";
      if (!outlined && !shadowed) missingFocus.push(element.tagName.toLowerCase());
    }
    document.activeElement?.blur?.();

    const touchTargets = checkTouchTargets
      ? [...document.querySelectorAll('button,input:not([type="hidden"]),select,textarea,[role="button"],[role="checkbox"],[role="radio"]')]
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName.toLowerCase(), width: Math.round(rect.width), height: Math.round(rect.height), label: (element.getAttribute("aria-label") || element.textContent || "").trim().slice(0, 60) };
        })
        .filter((item) => item.width < 44 || item.height < 44)
        .slice(0, 20)
      : [];

    const lowContrast = [];
    if (checkContrast) {
      const candidates = [...document.querySelectorAll("h1,h2,h3,h4,p,li,label,button,a,small,code")]
        .filter(visible)
        .filter((element) => (element.textContent || "").trim())
        .slice(0, 260);
      for (const element of candidates) {
        const style = getComputedStyle(element);
        const foreground = parseColor(style.color);
        const background = effectiveBackground(element);
        if (!foreground || !background || foreground.a < 0.98 || background.a < 0.98) continue;
        const ratio = contrast(foreground, background);
        const large = Number.parseFloat(style.fontSize) >= 24 || (Number.parseFloat(style.fontSize) >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
        if (ratio < (large ? 3 : 4.5)) {
          lowContrast.push({ ratio: Math.round(ratio * 100) / 100, tag: element.tagName.toLowerCase(), text: element.textContent.trim().slice(0, 70) });
        }
        if (lowContrast.length >= 20) break;
      }
    }

    const clippedText = [...document.querySelectorAll("h1,h2,h3,h4,p,li,label,button,a")]
      .filter(visible)
      .filter((element) => {
        const style = getComputedStyle(element);
        return /hidden|clip/.test(`${style.overflow}${style.overflowX}${style.overflowY}`)
          && (element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2);
      })
      .map((element) => ({ tag: element.tagName.toLowerCase(), text: element.textContent.trim().slice(0, 70) }))
      .slice(0, 20);

    const interactiveSelector = 'a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"]),[role="button"]';
    const fixed = [...document.querySelectorAll("body *")]
      .filter(visible)
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.position !== "fixed" || style.pointerEvents === "none") return false;
        if (element.getAttribute("aria-hidden") === "true") return false;
        return element.matches(interactiveSelector)
          || Boolean(element.querySelector(interactiveSelector))
          || Boolean((element.textContent || "").trim());
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const area = Math.max(0, Math.min(innerWidth, rect.right) - Math.max(0, rect.left))
          * Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
        return { tag: element.tagName.toLowerCase(), coverage: area / Math.max(1, innerWidth * innerHeight) };
      });

    const imagesWithoutDimensions = [...document.images]
      .filter(visible)
      .filter((image) => !image.hasAttribute("width") && !image.hasAttribute("height") && getComputedStyle(image).aspectRatio === "auto")
      .map((image) => image.currentSrc || image.src)
      .slice(0, 20);

    const animations = document.getAnimations().map((animation) => {
      const timing = animation.effect?.getComputedTiming?.() || {};
      return { playState: animation.playState, duration: Number(timing.duration) || 0 };
    });

    return {
      viewport,
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      missingFocus,
      touchTargets,
      lowContrast,
      clippedText,
      fixedCoverage: fixed.reduce((maximum, item) => Math.max(maximum, item.coverage), 0),
      imagesWithoutDimensions,
      animations,
    };
  }, { checkContrast: Boolean(config.checks.contrast), checkTouchTargets: Boolean(config.checks.touchTargets && viewport.id === "mobile") });

  let zoom = null;
  if (config.checks.zoom200) {
    zoom = await page.evaluate(async () => {
      const previous = document.documentElement.style.fontSize;
      document.documentElement.style.fontSize = "200%";
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const offenders = [...document.querySelectorAll("body *")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((item) => item.right > innerWidth + 2 || item.left < -2)
        .sort((left, right) => Math.max(right.right - innerWidth, -right.left) - Math.max(left.right - innerWidth, -left.left))
        .slice(0, 5);
      const result = {
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
        documentWidth: document.documentElement.scrollWidth,
        offenders,
      };
      document.documentElement.style.fontSize = previous;
      return result;
    });
  }
  return { ...evidence, zoom };
}

async function prepareFullPageCapture(page) {
  await page.evaluate(async () => {
    const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const step = Math.max(240, Math.floor(innerHeight * 0.72));
    let position = 0;
    let maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    while (position < maximum) {
      position = Math.min(maximum, position + step);
      scrollTo({ top: position, behavior: "instant" });
      await pause(90);
      maximum = Math.max(maximum, document.documentElement.scrollHeight - innerHeight);
    }
    scrollTo({ top: 0, behavior: "instant" });
    await pause(180);
  });
}

async function browserFindings(url, config, runDirectory) {
  if (!config.checks.browser) return { findings: [], captures: [], evidence: [] };
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return {
      findings: [browserFinding("browser/playwright-missing", "error", "Playwright is required for rendered resolve checks. Run npm install and npx playwright install chromium.", "all")],
      captures: [],
      evidence: [],
    };
  }

  const browser = await chromium.launch({ headless: true });
  const findings = [];
  const captures = [];
  const evidence = [];
  try {
    for (const viewport of config.viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      const pageErrors = [];
      const requestFailures = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || "failed" }));
      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        await page.waitForTimeout(250);

        if (!response || response.status() >= 400) {
          findings.push(browserFinding("browser/http-status", "error", `Target returned ${response?.status() ?? "no response"}.`, viewport.id));
        }
        for (const message of pageErrors.slice(0, 8)) {
          findings.push(browserFinding("browser/page-error", "error", message, viewport.id));
        }
        for (const failure of requestFailures.filter((item) => !/favicon\.ico/.test(item.url)).slice(0, 8)) {
          findings.push(browserFinding("browser/request-failure", "warning", `${failure.error}: ${failure.url}`, viewport.id));
        }

        const pageEvidence = await collectPageEvidence(page, viewport, config);
        evidence.push(pageEvidence);
        if (pageEvidence.h1Count !== 1) {
          findings.push(browserFinding("hierarchy/h1-count", "error", `Rendered page has ${pageEvidence.h1Count} h1 elements.`, viewport.id));
        }
        if (pageEvidence.horizontalOverflow) {
          findings.push(browserFinding("responsive/horizontal-overflow", "error", `Rendered width is ${pageEvidence.documentWidth}px in a ${viewport.width}px viewport.`, viewport.id));
        }
        if (pageEvidence.zoom?.horizontalOverflow) {
          const offender = pageEvidence.zoom.offenders?.[0];
          const detail = offender ? ` Widest offender: ${offender.tag}${offender.className ? `.${offender.className.split(/\s+/).join(".")}` : ""} (${offender.left}–${offender.right}px).` : "";
          findings.push(browserFinding("responsive/zoom-overflow", "error", `The page overflows horizontally after 200% root text sizing (${pageEvidence.zoom.documentWidth}px).${detail}`, viewport.id));
        }
        if (pageEvidence.missingFocus.length) {
          findings.push(browserFinding("a11y/focus-visible", "error", `${pageEvidence.missingFocus.length} sampled interactive elements had no computed outline or focus shadow.`, viewport.id));
        }
        for (const target of pageEvidence.touchTargets) {
          const severity = target.width < 24 || target.height < 24 ? "error" : "warning";
          findings.push(browserFinding("a11y/touch-target", severity, `${target.tag} target is ${target.width}×${target.height}px${target.label ? ` (${target.label})` : ""}.`, viewport.id));
        }
        for (const item of pageEvidence.lowContrast) {
          findings.push(browserFinding("a11y/contrast", "error", `Contrast ${item.ratio}:1 on ${item.tag}${item.text ? ` (${item.text})` : ""}.`, viewport.id));
        }
        for (const item of pageEvidence.clippedText) {
          findings.push(browserFinding("layout/clipped-text", "warning", `Visible ${item.tag} clips required text${item.text ? ` (${item.text})` : ""}.`, viewport.id));
        }
        if (pageEvidence.fixedCoverage > 0.35) {
          findings.push(browserFinding("layout/fixed-coverage", "warning", `Fixed elements cover ${Math.round(pageEvidence.fixedCoverage * 100)}% of the viewport.`, viewport.id));
        }
        for (const source of pageEvidence.imagesWithoutDimensions) {
          findings.push(browserFinding("performance/image-dimensions", "warning", `Visible image has no intrinsic dimensions or aspect ratio: ${source}`, viewport.id));
        }

        await prepareFullPageCapture(page);
        const screenshot = path.join(runDirectory, `${viewport.id}.png`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
        captures.push({ viewport, file: path.basename(screenshot), reducedMotion: false });
      } catch (error) {
        findings.push(browserFinding("browser/navigation", "error", error instanceof Error ? error.message : String(error), viewport.id));
      } finally {
        await context.close();
      }
    }

    if (config.checks.reducedMotion) {
      const viewport = config.viewports.find((item) => item.id === "desktop") || config.viewports[0];
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "reduce" });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(450);
        const running = await page.evaluate(() => document.getAnimations()
          .filter((animation) => animation.playState === "running")
          .filter((animation) => Number(animation.effect?.getComputedTiming?.().duration) > 100)
          .length);
        if (running > 0) {
          findings.push(browserFinding("a11y/reduced-motion", "error", `${running} substantial animations remain active with reduced motion enabled.`, "reduced-motion"));
        }
        await prepareFullPageCapture(page);
        const screenshot = path.join(runDirectory, "reduced-motion.png");
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
        captures.push({ viewport, file: path.basename(screenshot), reducedMotion: true });
      } catch (error) {
        findings.push(browserFinding("browser/navigation", "error", `Reduced-motion capture failed: ${error instanceof Error ? error.message : String(error)}`, "reduced-motion"));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return { findings, captures, evidence };
}

function ruleMeta(finding) {
  if (RULES[finding.rule]) return RULES[finding.rule];
  if (finding.severity === "error") return [10, "P1", finding.message];
  return [3, "P2", finding.message];
}

function normalizeFindings(findings) {
  return findings.map((finding) => {
    const [penalty, priority, action] = ruleMeta(finding);
    return {
      ...finding,
      id: `${finding.rule}:${finding.file}:${finding.line}:${finding.viewport || "static"}`,
      priority,
      penalty,
      action,
    };
  }).sort((left, right) => {
    const priority = Number(left.priority.slice(1)) - Number(right.priority.slice(1));
    return priority || right.penalty - left.penalty || left.rule.localeCompare(right.rule);
  });
}

function calculateScore(findings) {
  const perRule = new Map();
  for (const finding of findings) {
    const count = perRule.get(finding.rule) || 0;
    if (count >= 3) continue;
    perRule.set(finding.rule, count + 1);
  }
  let penalty = 0;
  for (const [rule, count] of perRule) {
    const sample = findings.find((finding) => finding.rule === rule);
    penalty += sample.penalty * count;
  }
  return Math.max(0, Math.round((100 - penalty) * 10) / 10);
}

function comparePrevious(previous, findings) {
  if (!previous?.findings) return { previousRun: null, resolved: [], introduced: findings.map((item) => item.id), persistent: [] };
  const before = new Map(previous.findings.map((item) => [item.id, item]));
  const after = new Map(findings.map((item) => [item.id, item]));
  return {
    previousRun: previous.runId || null,
    resolved: [...before.keys()].filter((key) => !after.has(key)),
    introduced: [...after.keys()].filter((key) => !before.has(key)),
    persistent: [...after.keys()].filter((key) => before.has(key)),
  };
}

function markdownReport(report) {
  const lines = [
    "# AIgent Resolve Report",
    "",
    `- **Status:** ${report.gate.pass ? "mechanical gate passed" : "mechanical gate failed"}`,
    `- **Score:** ${report.score}/100 (minimum ${report.gate.minimumScore})`,
    `- **Errors:** ${report.totals.errors}`,
    `- **Warnings:** ${report.totals.warnings}`,
    `- **Human review:** ${report.gate.requireHumanReview ? "required before completion" : "not required by config"}`,
    `- **Run:** ${report.runId}`,
    "",
    "## Repair order",
    "",
  ];

  if (!report.repairContract.topActions.length) {
    lines.push("No mechanical findings remain. Complete the human design review against product clarity, specificity, composition, typography, motion/media, originality, and finish.");
  } else {
    for (const [index, item] of report.repairContract.topActions.entries()) {
      lines.push(`${index + 1}. **${item.priority} · ${item.rule}** — ${item.action}`);
      lines.push(`   - Evidence: ${item.message}`);
      lines.push(`   - Location: ${item.file}${item.viewport ? ` · ${item.viewport}` : ""}`);
    }
  }

  lines.push("", "## Change since previous run", "");
  lines.push(`- Resolved: ${report.comparison.resolved.length}`);
  lines.push(`- Introduced: ${report.comparison.introduced.length}`);
  lines.push(`- Persistent: ${report.comparison.persistent.length}`);
  lines.push("", "## Design lock", "");
  lines.push(`- Product truth: ${report.repairContract.preserve.product}`);
  lines.push(`- Design authority: ${report.repairContract.preserve.design}`);
  lines.push(`- Inspiration plan: ${report.repairContract.preserve.inspirationPlan}`);
  lines.push("", "## Stop condition", "");
  lines.push(report.repairContract.stopWhen);
  return `${lines.join("\n")}\n`;
}

export async function resolveDesign(options = {}) {
  const target = path.resolve(options.target || process.cwd());
  if (!fs.existsSync(target)) throw new Error(`Resolve target not found: ${target}`);
  if (options.init) initResolveConfig(target, { force: options.force });
  const { config: loadedConfig, path: configPath } = resolveConfig(target, options.config);
  const config = mergeConfig(loadedConfig, options.override || {});
  const outputRoot = path.resolve(options.out || path.join(target, ".aigent", "resolve"));
  const latestPath = path.join(outputRoot, "latest.json");
  const previous = fs.existsSync(latestPath) ? readJson(latestPath) : null;
  const id = runId();
  const runDirectory = path.join(outputRoot, "runs", id);
  fs.mkdirSync(runDirectory, { recursive: true });

  const statics = staticFindings(target, config);
  let server = null;
  let pageUrl = options.url || null;
  if (config.checks.browser && !pageUrl) {
    server = await startStaticServer(target);
    const defaultEntry = fs.statSync(target).isFile() ? `/${path.basename(target)}` : "/index.html";
    pageUrl = new URL(config.entry || defaultEntry, `${server.baseUrl}/`).href;
  }

  let browser = { findings: [], captures: [], evidence: [] };
  try {
    if (pageUrl) browser = await browserFindings(pageUrl, config, runDirectory);
  } finally {
    if (server) await server.close();
  }

  const findings = normalizeFindings([...statics.findings, ...browser.findings]);
  const score = calculateScore(findings);
  const totals = {
    errors: findings.filter((item) => item.severity === "error").length,
    warnings: findings.filter((item) => item.severity !== "error").length,
  };
  const gate = {
    minimumScore: config.gate.minimumScore,
    maxErrors: config.gate.maxErrors,
    maxWarnings: config.gate.maxWarnings,
    requireHumanReview: Boolean(config.gate.requireHumanReview),
    pass: score >= config.gate.minimumScore
      && totals.errors <= config.gate.maxErrors
      && totals.warnings <= config.gate.maxWarnings,
  };
  const comparison = comparePrevious(previous, findings);
  const topActions = findings.slice(0, options.maxActions || 3).map((item) => ({
    id: item.id,
    priority: item.priority,
    rule: item.rule,
    message: item.message,
    file: item.file,
    viewport: item.viewport || null,
    action: item.action,
  }));
  const relative = (file) => path.relative(target, file).split(path.sep).join("/") || ".";
  const report = {
    schemaVersion: 1,
    runId: id,
    generatedAt: new Date().toISOString(),
    target: relative(target),
    pageUrl,
    config: configPath ? relative(configPath) : "defaults",
    score,
    totals,
    gate,
    findings,
    comparison,
    captures: browser.captures.map((capture) => ({ ...capture, file: relative(path.join(runDirectory, capture.file)) })),
    browserEvidence: browser.evidence,
    repairContract: {
      preserve: {
        product: fs.existsSync(path.join(target, "PRODUCT.md")) ? "PRODUCT.md" : "product truth supplied by the project",
        design: fs.existsSync(path.join(target, "DESIGN.md")) ? "DESIGN.md" : "the current rendered visual authority",
        inspirationPlan: fs.existsSync(path.join(target, ".aigent", "inspiration-plan.json")) ? ".aigent/inspiration-plan.json" : "none",
      },
      topActions,
      rules: [
        "Fix the highest-priority shared cause, not each visible symptom.",
        "Do not change the selected visual world merely to silence a detector.",
        "Do not add a dependency when the current stack or browser can solve the issue.",
        "Rerun after each coherent repair group and inspect the rendered result.",
      ],
      stopWhen: "Stop when the mechanical gate passes and a human or the operating agent has explicitly reviewed product clarity, specificity, composition, typography, motion/media, originality, and finish.",
    },
  };

  writeJson(path.join(runDirectory, "report.json"), report);
  fs.writeFileSync(path.join(runDirectory, "report.md"), markdownReport(report));
  writeJson(latestPath, report);
  fs.writeFileSync(path.join(outputRoot, "latest.md"), markdownReport(report));
  return report;
}

export async function runResolve(args = process.argv.slice(2)) {
  const target = path.resolve(option(args, "--target", process.cwd()));
  const override = { gate: {}, checks: {} };
  const gate = option(args, "--gate");
  const maxWarnings = option(args, "--max-warnings");
  const entry = option(args, "--entry");
  if (gate != null) override.gate.minimumScore = Number(gate);
  if (maxWarnings != null) override.gate.maxWarnings = Number(maxWarnings);
  if (entry) override.entry = entry;
  if (hasFlag(args, "--no-browser")) override.checks.browser = false;
  if (hasFlag(args, "--no-contrast")) override.checks.contrast = false;
  const report = await resolveDesign({
    target,
    config: option(args, "--config"),
    url: option(args, "--url"),
    out: option(args, "--out"),
    init: hasFlag(args, "--init"),
    force: hasFlag(args, "--force"),
    override,
    maxActions: Number(option(args, "--max-actions", 3)),
  });

  if (hasFlag(args, "--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    console.log(`AIgent Resolve: ${report.score}/100, ${report.totals.errors} errors, ${report.totals.warnings} warnings.`);
    console.log(`Report: ${path.relative(process.cwd(), path.resolve(option(args, "--out", path.join(target, ".aigent", "resolve")), "latest.md"))}`);
    console.log(report.gate.pass ? "Mechanical gate passed; complete the explicit human review." : "Mechanical gate failed; repair the ranked findings and rerun.");
  }
  if (!report.gate.pass && !hasFlag(args, "--no-fail")) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runResolve().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
