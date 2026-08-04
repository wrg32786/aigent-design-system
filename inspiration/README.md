# Inspiration Intelligence

Inspiration Intelligence lets an agent inspect references, extract their reusable design logic, synthesize a new direction from multiple sources, and document how the result differs from every source.

It is not a website-cloning tool.

```text
SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → VERIFY
```

## What it accepts

- live public URLs
- screenshots and full-page captures
- motion references and screen recordings
- structured Design DNA JSON
- Figma or Penpot exports accompanied by an analysis record

A live URL is the highest-confidence source because the system can inspect DOM structure, computed styles, responsive behavior, interactions, media, and browser animation evidence. Screenshot and video inputs remain useful, but their inferred design details must be treated as lower confidence unless a visual model or human supplies an annotation.

## What it produces

Each source receives:

```text
.aigent/inspiration/sources/<id>/
  source.json
  design-dna.json
  report.html
  captures/
  evidence/
```

A composed project receives:

```text
.aigent/inspiration/projects/<id>/
  inspiration-plan.json
  reference-matrix.json
  influence-ledger.json
  DIRECTION.md
```

The local inspiration directory is ignored by Git by default so third-party screenshots, private references, and extracted page evidence do not enter a public repository accidentally.

## Quick start

```bash
npm install
npx playwright install chromium

node scripts/inspire.mjs add https://example.com --label example
node scripts/inspire.mjs add inspiration/examples/editorial-reference.json \
  --id editorial --kind structured-reference \
  --analysis inspiration/examples/editorial-reference.json

node scripts/inspire.mjs list
node scripts/inspire.mjs inspect example --summary
node scripts/inspire.mjs search "editorial pinned stage restrained motion"

node scripts/inspire.mjs compose \
  --brief design-intelligence/example-brief.json \
  --refs example,editorial \
  --out .aigent/inspiration-plan.json

node scripts/inspire.mjs apply .aigent/inspiration-plan.json --target .
```

The same commands are available through the repository CLI:

```bash
npx github:wrg32786/aigent-design-system inspire add https://example.com
```

## Design DNA

The normalized record covers six dimensions:

1. **Structure** — surface modes, topology, density, sequence, fixed and sticky regions, responsive changes.
2. **Typography** — families, categories, size range, weight distribution, heading scale, role count.
3. **Material** — semantic foreground and background colors, radius language, borders, shadows, blur, gradients.
4. **Motion** — animation types, scroll linkage, duration, transform, opacity and mask behavior, reduced-motion evidence.
5. **Interaction** — links, buttons, inputs, dialogs and recurring interaction patterns.
6. **Media** — image, video, SVG, canvas and iframe use plus Three.js, Spline, GSAP and related runtime hints.

Evidence and interpretation remain separate. Deterministic measurements are stored under `evidence/`; the normalized interpretation is `design-dna.json`.

## Reference synthesis

A composition assigns each design dimension to one source and limits a source to two dimensions by default.

```text
Reference A → structure + interaction
Reference B → typography + material
Reference C → motion + media
```

Every assignment includes:

- the extracted principle
- a required transformation
- excluded expression
- target AIgent patterns
- production requirements
- originality threshold

The system rejects the common failure mode where one source quietly controls structure, palette, typography, motion, and media while the agent calls the result “inspired.”

## Originality safeguards

Always exclude:

- source copy and claims
- source photographs, footage, 3D assets, icons and marks
- exact section order
- exact type pairing and scale
- exact animation timing and keyframes
- source HTML, CSS, JavaScript, shaders and private implementation details

The originality audit compares normalized structure, type, material, motion, interaction, media and copy fingerprints. It is a review heuristic, not a legal conclusion.

## URL forensics

The URL adapter uses Playwright and Chrome DevTools Protocol evidence to capture:

- desktop, tablet and mobile screenshots
- full-page screenshots
- a scroll filmstrip
- visible DOM hierarchy and geometry
- computed visual roles
- headings and copy fingerprint
- fixed and sticky regions
- interactions and media
- Web Animations timing and keyframes
- CDP DOMSnapshot node and layout counts
- network and page errors

Pass `--raw` only when you need the full CDP snapshot; it can be large.

## Screenshot and motion references

File import records hashes, dimensions and provenance. Video filmstrips are extracted when FFmpeg and ffprobe are installed. File metadata alone cannot reliably recover exact layout, type or interaction, so provide a Design DNA annotation with `--analysis` when the reference has no inspectable URL.

## Optional adapters

- `adapters/chrome-devtools.md` — interactive browser inspection and debugging.
- `adapters/screenshot-and-motion.md` — VLM-assisted annotation and filmstrip review.
- `adapters/figma-and-penpot.md` — optional editable direction-board round trip.
- `adapters/embeddings.md` — later semantic and visual retrieval for large libraries.

None is required by the dependency-light core.

## Verification

```bash
npm run inspiration
npm run inspiration:smoke
```

The deterministic check covers schemas, source import, search, synthesis, influence limits, application and originality heuristics. The browser smoke test captures a real responsive animated fixture, generates Design DNA and a report, composes two references, applies the direction and verifies the Inspiration Lab.
