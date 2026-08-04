import fs from "node:fs";
import path from "node:path";
import {
  copyFile,
  ensureDir,
  normalizeUrl,
  nowIso,
  relativePath,
  sourceIdFor,
  writeJson,
} from "./common.mjs";
import { deriveDesignDna } from "./design-dna.mjs";
import { generateSourceReport } from "./report.mjs";
import { openStore, saveSource, sourceDirectory } from "./store.mjs";

const COMPUTED_STYLES = [
  "display",
  "position",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-align",
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-top-width",
  "border-radius",
  "box-shadow",
  "backdrop-filter",
  "opacity",
  "transform",
  "z-index",
  "overflow",
  "grid-template-columns",
  "grid-template-rows",
  "gap",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "transition-duration",
  "transition-property",
  "scroll-snap-type",
];

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error("Playwright is required for URL forensics. Run npm install, then npx playwright install chromium.");
  }
}

function screenshotName(viewport, kind) {
  return `${viewport.id}-${kind}.png`;
}

async function settle(page, timeout) {
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page.waitForLoadState("networkidle", { timeout: Math.min(timeout, 7000) }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(250);
}

async function traverse(page, steps = 8) {
  const snapshots = [];
  for (let index = 0; index < steps; index += 1) {
    const progress = steps === 1 ? 0 : index / (steps - 1);
    await page.evaluate((amount) => {
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      scrollTo({ top: maximum * amount, behavior: "instant" });
    }, progress);
    await page.waitForTimeout(140);
    snapshots.push(await page.evaluate((amount) => ({
      progress: amount,
      scrollY,
      activeAnimations: document.getAnimations().filter((animation) => animation.playState === "running").length,
      focused: document.activeElement?.tagName || null,
    }), progress));
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(180);
  return snapshots;
}

async function collectPageEvidence(page, viewport) {
  return page.evaluate(({ width, height }) => {
    const clean = (value, maximum = 180) => String(value || "").replace(/\s+/g, " ").trim().slice(0, maximum);
    const visible = (element, style, rect) => style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0.02 && rect.width > 0.5 && rect.height > 0.5;
    const nth = (element) => {
      if (!element.parentElement) return 1;
      const siblings = [...element.parentElement.children].filter((candidate) => candidate.tagName === element.tagName);
      return siblings.indexOf(element) + 1;
    };
    const elementPath = (element) => {
      const parts = [];
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 7) {
        let part = current.tagName.toLowerCase();
        if (current.id) {
          part += `#${current.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
          parts.unshift(part);
          break;
        }
        const classes = [...current.classList].filter(Boolean).slice(0, 2).map((name) => name.replace(/[^a-zA-Z0-9_-]/g, ""));
        if (classes.length) part += `.${classes.join(".")}`;
        part += `:nth-of-type(${nth(current)})`;
        parts.unshift(part);
        current = current.parentElement;
      }
      return parts.join(" > ");
    };
    const number = (value) => Number(Number.parseFloat(value || 0).toFixed(3));
    const styleRecord = (style) => ({
      display: style.display,
      position: style.position,
      fontFamily: clean(style.fontFamily, 240),
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      textAlign: style.textAlign,
      color: style.color,
      backgroundColor: style.backgroundColor,
      backgroundImage: clean(style.backgroundImage, 360),
      borderTopColor: style.borderTopColor,
      borderTopWidth: style.borderTopWidth,
      borderRadius: style.borderRadius,
      boxShadow: clean(style.boxShadow, 360),
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || "none",
      opacity: style.opacity,
      transform: clean(style.transform, 220),
      zIndex: style.zIndex,
      overflow: `${style.overflowX}/${style.overflowY}`,
      gridTemplateColumns: clean(style.gridTemplateColumns, 260),
      gridTemplateRows: clean(style.gridTemplateRows, 260),
      gap: style.gap,
      animationName: clean(style.animationName, 160),
      animationDuration: clean(style.animationDuration, 160),
      transitionDuration: clean(style.transitionDuration, 160),
      transitionProperty: clean(style.transitionProperty, 220),
    });

    const elements = [];
    const candidates = [...document.querySelectorAll("body *")].slice(0, 4000);
    for (const element of candidates) {
      if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK"].includes(element.tagName)) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (!visible(element, style, rect)) continue;
      const headingLevel = /^H[1-6]$/.test(element.tagName) ? Number(element.tagName.slice(1)) : null;
      elements.push({
        path: elementPath(element),
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role"),
        ariaLabel: clean(element.getAttribute("aria-label"), 140),
        text: clean(element.innerText || element.textContent, 220),
        headingLevel,
        childCount: element.children.length,
        rect: { x: number(rect.x), y: number(rect.y + scrollY), width: number(rect.width), height: number(rect.height) },
        style: styleRecord(style),
      });
      if (elements.length >= 1400) break;
    }

    const sections = [...document.querySelectorAll("main, section, article, header, footer, nav, [role='region']")]
      .map((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (!visible(element, style, rect)) return null;
        const heading = element.querySelector(":scope > h1, :scope > h2, :scope > h3, h1, h2, h3");
        return {
          path: elementPath(element),
          tag: element.tagName.toLowerCase(),
          label: clean(element.getAttribute("aria-label") || heading?.textContent || element.id || element.className, 160),
          text: clean(element.innerText, 260),
          rect: { x: number(rect.x), y: number(rect.y + scrollY), width: number(rect.width), height: number(rect.height) },
          position: style.position,
        };
      })
      .filter(Boolean)
      .slice(0, 120);

    const interactions = [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [role='button'], [role='tab'], [role='dialog'], dialog")]
      .map((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (!visible(element, style, rect)) return null;
        const kind = element.matches("a[href]") ? "link"
          : element.matches("button,[role='button']") ? "button"
          : element.matches("input,select,textarea") ? "input"
          : element.matches("dialog,[role='dialog']") ? "dialog"
          : element.matches("summary") ? "disclosure"
          : element.matches("[role='tab']") ? "tab"
          : "interactive";
        return {
          path: elementPath(element),
          kind,
          label: clean(element.getAttribute("aria-label") || element.textContent || element.getAttribute("placeholder"), 180),
          disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
          rect: { x: number(rect.x), y: number(rect.y + scrollY), width: number(rect.width), height: number(rect.height) },
        };
      })
      .filter(Boolean)
      .slice(0, 400);

    const media = [...document.querySelectorAll("img, picture, video, audio, canvas, svg, iframe, model-viewer, spline-viewer")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (!visible(element, style, rect)) return null;
        const kind = element.tagName.toLowerCase();
        return {
          path: elementPath(element),
          kind,
          source: clean(element.currentSrc || element.src || element.getAttribute("url") || element.getAttribute("src"), 500),
          alt: clean(element.alt || element.getAttribute("aria-label"), 180),
          rect: { x: number(rect.x), y: number(rect.y + scrollY), width: number(rect.width), height: number(rect.height) },
        };
      })
      .filter(Boolean)
      .slice(0, 300);

    const animations = document.getAnimations().slice(0, 500).map((animation, index) => {
      let keyframes = [];
      let timing = {};
      try {
        keyframes = animation.effect?.getKeyframes?.().slice(0, 20).map((frame) => {
          const output = {};
          for (const [key, value] of Object.entries(frame)) {
            if (["computedOffset", "easing", "offset", "composite"].includes(key) || ["opacity", "transform", "translate", "rotate", "scale", "clipPath", "clip-path", "mask", "filter", "backgroundColor", "color"].includes(key)) output[key] = value;
          }
          return output;
        }) || [];
        timing = animation.effect?.getTiming?.() || {};
      } catch {}
      const target = animation.effect?.target;
      return {
        id: animation.id || `animation-${index + 1}`,
        type: animation.constructor?.name || "Animation",
        playState: animation.playState,
        playbackRate: animation.playbackRate,
        currentTime: typeof animation.currentTime === "number" ? animation.currentTime : null,
        startTime: typeof animation.startTime === "number" ? animation.startTime : null,
        timeline: animation.timeline?.constructor?.name || null,
        target: target instanceof Element ? elementPath(target) : null,
        timing,
        keyframes,
      };
    });

    const scripts = [...document.scripts].map((script) => script.src || clean(script.textContent, 100)).filter(Boolean).slice(0, 200);
    const customProperties = {};
    const rootStyle = getComputedStyle(document.documentElement);
    for (const name of [...rootStyle].filter((entry) => entry.startsWith("--")).slice(0, 120)) customProperties[name] = clean(rootStyle.getPropertyValue(name), 220);

    const mediaSummary = {
      images: media.filter((item) => ["img", "picture"].includes(item.kind)).length,
      video: media.filter((item) => item.kind === "video").length,
      audio: media.filter((item) => item.kind === "audio").length,
      canvas: media.filter((item) => item.kind === "canvas").length,
      svg: media.filter((item) => item.kind === "svg").length,
      iframe: media.filter((item) => item.kind === "iframe").length,
    };
    const interactionSummary = {
      links: interactions.filter((item) => item.kind === "link").length,
      buttons: interactions.filter((item) => item.kind === "button").length,
      inputs: interactions.filter((item) => item.kind === "input").length,
      dialogs: interactions.filter((item) => item.kind === "dialog").length,
    };

    return {
      viewport: { id: `${width}x${height}`, width, height },
      page: {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || "",
        lang: document.documentElement.lang || "",
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        scripts,
        customProperties,
      },
      elements,
      sections,
      interactions,
      interactionSummary,
      media,
      mediaSummary,
      animations,
      copy: {
        headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((element) => clean(element.textContent, 240)).filter(Boolean).slice(0, 100),
        sample: clean(document.body.innerText, 12000),
      },
    };
  }, viewport);
}

async function collectCdpEvidence(page, rawFile = null) {
  const session = await page.context().newCDPSession(page);
  await session.send("DOMSnapshot.enable").catch(() => {});
  await session.send("Animation.enable").catch(() => {});
  const snapshot = await session.send("DOMSnapshot.captureSnapshot", {
    computedStyles: COMPUTED_STYLES,
    includePaintOrder: true,
  });
  const documents = snapshot.documents || [];
  const nodeCount = documents.reduce((sum, document) => sum + (document.nodes?.nodeType?.length || 0), 0);
  const layoutCount = documents.reduce((sum, document) => sum + (document.layout?.nodeIndex?.length || 0), 0);
  if (rawFile) writeJson(rawFile, snapshot);
  await session.detach().catch(() => {});
  return { nodeCount, layoutCount, documentCount: documents.length, styleNames: COMPUTED_STYLES };
}

export async function captureUrl(input, options = {}) {
  const normalized = normalizeUrl(input);
  const id = options.id || sourceIdFor(normalized, options.label);
  const store = openStore(options.root);
  const directory = sourceDirectory(store, id);
  const capturesDirectory = ensureDir(path.join(directory, "captures"));
  const evidenceDirectory = ensureDir(path.join(directory, "evidence"));
  const { chromium } = await importPlaywright();
  const browser = await chromium.launch({ headless: true });
  const captures = [];
  const failures = [];
  const viewports = options.viewports;
  const timeout = options.timeout || 30000;

  try {
    for (let viewportIndex = 0; viewportIndex < viewports.length; viewportIndex += 1) {
      const viewport = viewports[viewportIndex];
      const page = await browser.newPage({ viewport, reducedMotion: "no-preference" });
      const pageErrors = [];
      const requestFailures = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || "failed" }));

      try {
        const response = await page.goto(normalized, { waitUntil: "domcontentloaded", timeout });
        await settle(page, timeout);
        const scrollStates = await traverse(page, Math.max(3, options.scrollSteps || 8));
        const viewportShot = path.join(capturesDirectory, screenshotName(viewport, "viewport"));
        const fullShot = path.join(capturesDirectory, screenshotName(viewport, "full"));
        await page.screenshot({ path: viewportShot, animations: "disabled" });
        await page.screenshot({ path: fullShot, fullPage: true, animations: "disabled" });

        const evidence = await collectPageEvidence(page, viewport);
        evidence.viewport = viewport;
        evidence.scrollStates = scrollStates;
        evidence.network = {
          status: response?.status() || null,
          finalUrl: page.url(),
          failedRequests: requestFailures.slice(0, 100),
          pageErrors: pageErrors.slice(0, 100),
        };
        evidence.cdp = await collectCdpEvidence(page, options.raw ? path.join(evidenceDirectory, `${viewport.id}-cdp.json`) : null);
        evidence.screenshots = {
          viewport: relativePath(directory, viewportShot),
          full: relativePath(directory, fullShot),
        };

        if (viewportIndex === 0) {
          const filmstrip = [];
          const frameCount = Math.max(3, options.frames || 7);
          for (let index = 0; index < frameCount; index += 1) {
            const progress = frameCount === 1 ? 0 : index / (frameCount - 1);
            await page.evaluate((amount) => {
              const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
              scrollTo({ top: maximum * amount, behavior: "instant" });
            }, progress);
            await page.waitForTimeout(160);
            const file = path.join(capturesDirectory, `motion-${String(index).padStart(2, "0")}.png`);
            await page.screenshot({ path: file, animations: "disabled" });
            filmstrip.push({ progress, file: relativePath(directory, file) });
          }
          evidence.filmstrip = filmstrip;
          await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        }

        writeJson(path.join(evidenceDirectory, `${viewport.id}.json`), evidence);
        captures.push(evidence);
      } catch (error) {
        failures.push({ viewport: viewport.id, message: error instanceof Error ? error.message : String(error) });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  if (!captures.length) throw new Error(`Could not capture ${normalized}: ${failures.map((failure) => failure.message).join(" | ")}`);
  const capturedAt = nowIso();
  const designDna = deriveDesignDna(captures, { id, kind: "url", origin: normalized, capturedAt });
  const source = {
    schemaVersion: 1,
    id,
    label: options.label || captures[0].page?.title || new URL(normalized).hostname,
    kind: "url",
    origin: normalized,
    createdAt: capturedAt,
    updatedAt: capturedAt,
    capture: {
      viewports,
      frames: options.frames || 7,
      scrollSteps: options.scrollSteps || 8,
      failures,
      rawCdpStored: Boolean(options.raw),
    },
    evidence: captures.map((capture) => ({ viewport: capture.viewport, file: `evidence/${capture.viewport.id}.json`, screenshots: capture.screenshots })),
  };
  saveSource(store, source, designDna);
  source.report = generateSourceReport(directory, source, designDna, captures);
  saveSource(store, source, designDna);
  return { store, directory, source, designDna, captures };
}
