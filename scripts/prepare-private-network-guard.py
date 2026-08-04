from pathlib import Path


def replace(file, old, new):
    path = Path(file)
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"Expected contract not found in {file}: {old[:100]}")
    path.write_text(text.replace(old, new, 1))


replace(
    "inspiration/lib/url-forensics.mjs",
    'import fs from "node:fs";\nimport path from "node:path";\n',
    'import dns from "node:dns/promises";\nimport fs from "node:fs";\nimport net from "node:net";\nimport path from "node:path";\n',
)

marker = 'async function importPlaywright() {'
network_guard = r'''function ipv4Number(value) {
  return value.split(".").reduce((total, part) => (total * 256) + Number(part), 0) >>> 0;
}

function inIpv4Range(value, base, prefix) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipv4Number(value) & mask) === (ipv4Number(base) & mask);
}

function isPrivateAddress(value) {
  const address = String(value || "").replace(/^\[|\]$/g, "").toLowerCase();
  const version = net.isIP(address);
  if (version === 4) {
    return [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4],
    ].some(([base, prefix]) => inIpv4Range(address, base, prefix));
  }
  if (version === 6) {
    if (address === "::" || address === "::1") return true;
    if (address.startsWith("fc") || address.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(address)) return true;
    if (address.startsWith("ff")) return true;
    if (address.startsWith("::ffff:")) {
      return isPrivateAddress(address.slice("::ffff:".length));
    }
  }
  return false;
}

function createNetworkGuard(allowPrivate = false) {
  const cache = new Map();

  async function addressesFor(hostname) {
    const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (net.isIP(normalized)) return [normalized];
    if (!cache.has(normalized)) {
      cache.set(
        normalized,
        dns.lookup(normalized, { all: true, verbatim: true })
          .then((records) => records.map((record) => record.address)),
      );
    }
    return cache.get(normalized);
  }

  async function assertAllowed(value) {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return;
    if (allowPrivate) return;

    const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      throw new Error(`Blocked private inspiration host: ${hostname}`);
    }
    const addresses = await addressesFor(hostname);
    if (!addresses.length || addresses.some(isPrivateAddress)) {
      throw new Error(`Blocked private inspiration address for ${hostname}`);
    }
  }

  return { assertAllowed };
}

'''
replace(
    "inspiration/lib/url-forensics.mjs",
    marker,
    network_guard + marker,
)

replace(
    "inspiration/lib/url-forensics.mjs",
    '''  const normalized = normalizeUrl(input);
  const id = options.id || sourceIdFor(normalized, options.label);''',
    '''  const normalized = normalizeUrl(input);
  const network = createNetworkGuard(Boolean(options.allowPrivate));
  await network.assertAllowed(normalized);
  const id = options.id || sourceIdFor(normalized, options.label);''',
)

replace(
    "inspiration/lib/url-forensics.mjs",
    '''      const page = await browser.newPage({ viewport, reducedMotion: "no-preference" });
      const pageErrors = [];
      const requestFailures = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || "failed" }));

      try {''',
    '''      const pageErrors = [];
      const requestFailures = [];
      const context = await browser.newContext({
        viewport,
        reducedMotion: "no-preference",
        acceptDownloads: false,
        serviceWorkers: "block",
      });
      await context.route("**/*", async (route) => {
        const request = route.request();
        try {
          await network.assertAllowed(request.url());
          await route.continue();
        } catch (error) {
          requestFailures.push({
            url: request.url(),
            error: error instanceof Error ? error.message : String(error),
          });
          await route.abort("blockedbyclient");
        }
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => requestFailures.push({
        url: request.url(),
        error: request.failure()?.errorText || "failed",
      }));
      page.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));
      page.on("popup", (popup) => popup.close().catch(() => {}));

      try {''',
)

replace(
    "inspiration/lib/url-forensics.mjs",
    '''      } finally {
        await page.close();
      }''',
    '''      } finally {
        await context.close();
      }''',
)

replace(
    "inspiration/lib/url-forensics.mjs",
    '''      failures,
      rawCdpStored: Boolean(options.raw),''',
    '''      failures,
      allowPrivate: Boolean(options.allowPrivate),
      rawCdpStored: Boolean(options.raw),''',
)

replace(
    "scripts/inspire.mjs",
    '''    raw: hasFlag(args, "--raw"),
    viewports: parseViewports(option(args, "--viewports")),''',
    '''    raw: hasFlag(args, "--raw"),
    allowPrivate: hasFlag(args, "--allow-private"),
    viewports: parseViewports(option(args, "--viewports")),''',
)
replace(
    "scripts/inspire.mjs",
    '''  console.log(`AIgent Inspiration Intelligence\n\nCommands:\n  add <url|file> [--label name] [--viewports desktop:1440x1000,mobile:390x844]\n''',
    '''  console.log(`AIgent Inspiration Intelligence\n\nCommands:\n  add <url|file> [--label name] [--viewports desktop:1440x1000,mobile:390x844] [--allow-private]\n''',
)

replace(
    "scripts/inspiration-smoke.mjs",
    '''  scrollSteps: 5,
  timeout: 30000,''',
    '''  scrollSteps: 5,
  timeout: 30000,
  allowPrivate: true,''',
)

replace(
    "README.md",
    '''A URL capture records:
''',
    '''Public network addresses are required by default. Add `--allow-private` only for an operator-owned localhost or private-network site:

```bash
npx github:wrg32786/aigent-design-system inspire add \\
  http://127.0.0.1:4177 \\
  --label local-preview \\
  --allow-private
```

The capture context blocks service workers, downloads, popups, dialogs, and private-address requests unless that explicit flag is present.

A URL capture records:
''',
)

replace(
    "inspiration/README.md",
    '''A live URL is the highest-confidence source because the system can inspect DOM structure, computed styles, responsive behavior, interactions, media, and browser animation evidence.''',
    '''A live URL is the highest-confidence source because the system can inspect DOM structure, computed styles, responsive behavior, interactions, media, and browser animation evidence. Public network addresses are required by default; use `--allow-private` only for an operator-owned localhost or private-network preview.''',
)

replace(
    "SECURITY.md",
    '''- do not use URL forensics to bypass access controls or collect data beyond the design task
''',
    '''- do not use URL forensics to bypass access controls or collect data beyond the design task
- public-address capture is the default; `--allow-private` is required for operator-owned localhost or private-network previews
''',
)

print("Prepared private-network guard.")
