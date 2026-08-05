from pathlib import Path


def replace(path, old, new):
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"Expected hardening contract not found in {path}: {old[:120]!r}")
    file.write_text(text.replace(old, new, 1))


replace(
    "scripts/resolve-design.mjs",
    '''function collectAuditFiles(root, ignoreNames = []) {
  const ignored = new Set([...DEFAULT_IGNORES, ...ignoreNames]);
  const files = [];

  function visit(current) {
    const name = path.basename(current);
    if (ignored.has(name)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) visit(path.join(current, entry));
      return;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(current).toLowerCase())) files.push(current);
  }

  visit(root);
  return files.sort();
}''',
    '''function findProjectRoot(start) {
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
}''',
)

replace(
    "scripts/resolve-design.mjs",
    '''    const fixed = [...document.querySelectorAll("body *")]
      .filter(visible)
      .filter((element) => getComputedStyle(element).position === "fixed")
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const area = Math.max(0, Math.min(innerWidth, rect.right) - Math.max(0, rect.left))
          * Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
        return { tag: element.tagName.toLowerCase(), coverage: area / Math.max(1, innerWidth * innerHeight) };
      });''',
    '''    const interactiveSelector = 'a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"]),[role="button"]';
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
      });''',
)

replace(
    "scripts/resolve-design.mjs",
    '      fixedCoverage: fixed.reduce((total, item) => total + item.coverage, 0),',
    '      fixedCoverage: fixed.reduce((maximum, item) => Math.max(maximum, item.coverage), 0),',
)

replace(
    "scripts/resolve-design.mjs",
    '''      const result = {
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
        documentWidth: document.documentElement.scrollWidth,
      };''',
    '''      const offenders = [...document.querySelectorAll("body *")]
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
      };''',
)

replace(
    "scripts/resolve-design.mjs",
    '''async function browserFindings(url, config, runDirectory) {''',
    '''async function prepareFullPageCapture(page) {
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

async function browserFindings(url, config, runDirectory) {''',
)

replace(
    "scripts/resolve-design.mjs",
    '''        if (pageEvidence.zoom?.horizontalOverflow) {
          findings.push(browserFinding("responsive/zoom-overflow", "error", `The page overflows horizontally after 200% root text sizing (${pageEvidence.zoom.documentWidth}px).`, viewport.id));
        }''',
    '''        if (pageEvidence.zoom?.horizontalOverflow) {
          const offender = pageEvidence.zoom.offenders?.[0];
          const detail = offender ? ` Widest offender: ${offender.tag}${offender.className ? `.${offender.className.split(/\\s+/).join(".")}` : ""} (${offender.left}–${offender.right}px).` : "";
          findings.push(browserFinding("responsive/zoom-overflow", "error", `The page overflows horizontally after 200% root text sizing (${pageEvidence.zoom.documentWidth}px).${detail}`, viewport.id));
        }''',
)

replace(
    "scripts/resolve-design.mjs",
    '''        const screenshot = path.join(runDirectory, `${viewport.id}.png`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });''',
    '''        await prepareFullPageCapture(page);
        const screenshot = path.join(runDirectory, `${viewport.id}.png`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });''',
)

replace(
    "scripts/resolve-design.mjs",
    '''        const screenshot = path.join(runDirectory, "reduced-motion.png");
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });''',
    '''        await prepareFullPageCapture(page);
        const screenshot = path.join(runDirectory, "reduced-motion.png");
        await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });''',
)

replace(
    "tokens/system.css",
    '''.ds-theme-button {
  min-height: 36px;''',
    '''.ds-theme-button {
  min-height: 44px;''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''      text-wrap: balance;
    }''',
    '''      text-wrap: balance;
      overflow-wrap: anywhere;
    }''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''      .wordmark {
        display: block;
        margin-bottom: 10px;
      }

      .ds-theme-picker {
        max-width: calc(100vw - 32px);
      }''',
    '''      .wordmark {
        display: block;
        max-width: 100%;
        margin-bottom: 10px;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .ds-theme-picker {
        width: 100%;
        max-width: calc(100vw - 32px);
      }''',
)

replace(
    "scripts/check-resolve.mjs",
    '''const target = path.join(temporary, "site");
const out = path.join(temporary, "proof");
fs.mkdirSync(target, { recursive: true });''',
    '''const target = path.join(temporary, "site");
const out = path.join(temporary, "proof");
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(path.join(temporary, "package.json"), "{}\\n");''',
)

replace(
    "scripts/check-resolve.mjs",
    '''fs.writeFileSync(path.join(target, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#101714;color:#f3efe4}
a:focus-visible{outline:3px solid #65f4df;outline-offset:3px}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important}}
</style>
</head>
<body><main><h1>Example product</h1><a href="/">Open product</a></main></body>
</html>`);''',
    '''fs.writeFileSync(path.join(temporary, "shared.css"), `body{background:#101714;color:#f3efe4}
a:focus-visible{outline:3px solid #65f4df;outline-offset:3px}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important}}`);
fs.writeFileSync(path.join(target, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../shared.css">
</head>
<body><main><h1>Example product</h1><a href="/">Open product</a></main></body>
</html>`);''',
)

print("Prepared resolver hardening changes.")
