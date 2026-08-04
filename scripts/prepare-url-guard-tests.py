from pathlib import Path


def replace(file, old, new):
    path = Path(file)
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"Expected contract not found in {file}: {old[:100]}")
    path.write_text(text.replace(old, new, 1))


replace(
    "inspiration/lib/common.mjs",
    '''export function normalizeUrl(value) {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  parsed.hash = "";
  return parsed.toString();
}''',
    '''export function normalizeUrl(value) {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  if (parsed.username || parsed.password) throw new Error("Credential-embedded inspiration URLs are not supported.");
  parsed.hash = "";
  return parsed.toString();
}''',
)

replace(
    "inspiration/lib/url-forensics.mjs",
    '''    if (address.startsWith("::ffff:")) {
      return isPrivateAddress(address.slice("::ffff:".length));
    }''',
    '''    if (address.startsWith("::ffff:")) {
      const mapped = address.slice("::ffff:".length);
      return net.isIP(mapped) === 4 ? isPrivateAddress(mapped) : true;
    }''',
)

replace(
    "scripts/inspiration-smoke.mjs",
    '''const storeRoot = path.join(temporary, "store");
const fixture = await captureUrl(`${base}/inspiration/fixtures/site/`, {''',
    '''const storeRoot = path.join(temporary, "store");
await assert.rejects(
  captureUrl(`${base}/inspiration/fixtures/site/`, {
    root: storeRoot,
    id: "blocked-fixture",
    label: "Blocked fixture",
    viewports: [{ id: "desktop", width: 1440, height: 1000 }],
  }),
  /Blocked private inspiration/,
);
const fixture = await captureUrl(`${base}/inspiration/fixtures/site/`, {''',
)

replace(
    "scripts/check-inspiration.mjs",
    '''import { importFile } from "../inspiration/lib/file-forensics.mjs";
''',
    '''import { normalizeUrl } from "../inspiration/lib/common.mjs";
import { importFile } from "../inspiration/lib/file-forensics.mjs";
''',
)
replace(
    "scripts/check-inspiration.mjs",
    '''const root = process.cwd();
const required = [''',
    '''const root = process.cwd();
assert.throws(
  () => normalizeUrl("https://user:password@example.com/reference"),
  /Credential-embedded inspiration URLs/,
);
const required = [''',
)

print("Prepared URL guard regression tests.")
