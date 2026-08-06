<p align="center">
  <img src="docs/assets/readme/readme-hero.svg" width="100%" alt="AIgent Design System">
</p>

<p align="center"><strong>Turn Claude, Codex, Cursor, and other coding agents into a design-and-production studio for immersive websites, product interfaces, cinematic decks, and the media behind them.</strong></p>

<p align="center">
  <a href="https://github.com/wrg32786/aigent-design-system/releases/tag/v1.2.0">v1.2.0</a>
  · <a href="https://theaigent.xyz">The AIgent</a>
  · <a href="https://tools.theaigent.xyz">AIgent Tools</a>
  · <a href="#studio-in-action">Studio in action</a>
  · <a href="#license">MIT</a>
</p>

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
```

AIgent studies references, synthesizes an original direction, produces the media, builds the real surface, lets the operator edit the rendered DOM directly, and closes the work through browser measurement and explicit visual judgment.

```text
SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE → SEE
```

## AIgent Desktop

Download the **Windows installer** (`.exe`) or the matching **macOS** Apple Silicon / Intel disk image (`.dmg`) from the [latest release](https://github.com/wrg32786/aigent-design-system/releases/latest).

The custom first-run wizard:

1. chooses a separate project workspace;
2. verifies the bundled runtime and local tools;
3. detects or installs Claude Code / Codex and opens the official authentication flow;
4. configures startup and updates;
5. launches the real AIgent Studio Canvas.

For source development:

```bash
npm install
npm run desktop:start
```

See [`desktop/README.md`](desktop/README.md) for builds and [`desktop/SIGNING.md`](desktop/SIGNING.md) for Windows signing, Apple Developer ID, notarization, base64 conversion, and GitHub Actions secrets.

## Studio in action

<p align="center">
  <img src="docs/assets/readme/studio-demo.svg" width="100%" alt="Animated walkthrough of AIgent Desktop and the DOM-backed Studio Canvas">
</p>

The ten-second loop uses a real Studio capture to walk through semantic layers, DOM selection, responsive property editing, the Canvas patch journal, agent distillation, Resolve, and Vision. It replaces the old gallery of decorative README screenshots.

## Ship the site

AIgent Studio now closes the final gap from approved Canvas to a live URL. Open the **Ship** tab to:

```text
DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

The built-in publisher creates a constrained public bundle, blocks unresolved Canvas patches, checkpoints the source, and deploys through **Netlify, Vercel, Cloudflare Pages, or a local export**. Production mode can run Resolve before and after deployment, prepare live Vision captures, record custom-domain follow-up, and redeploy an earlier exact artifact.

```bash
node scripts/publish-site.mjs deploy --provider netlify --mode preview --project-dir . --entry /index.html --site my-site
```

Install the standalone production contract with:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/publish-site
```

Provider authentication stays in the official CLI/browser flow; Studio never asks for hosting tokens or secret environment-variable values. See [`publish/README.md`](publish/README.md).

## AIgent Studio 1.0

AIgent Studio is a **DOM-backed visual website canvas**. The layers, selection boxes, inspector, comments, and coding agent operate against the actual project running in the browser—there is no disconnected design mockup to translate later.

```bash
npm install
npm run studio -- --open
```

Inside Studio you can:

- select and multi-select real rendered elements;
- navigate a synchronized semantic layers tree;
- edit text, layout, typography, appearance, motion, and responsive overrides;
- resize, reorder, duplicate, remove, and save sections as project components;
- browse project design tokens;
- undo and redo through a structured **Canvas patch journal**;
- attach element-bound comments and see active collaborators;
- create and restore Git checkpoints;
- hand selected elements, comments, and approved operations to Claude Code or Codex;
- run Design Intelligence, Inspiration Intelligence, AIgent Resolve, and AIgent Vision in the same project.

Canvas operations stay reversible in `.aigent/studio/canvas.json`. **Distill canvas edits into source** asks the authenticated local agent to repair the smallest correct shared source owner, after which the operator compares the real rendered result.

Install Studio into another project:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-studio
node scripts/studio-server.mjs --open
```

Credentials remain in the local Claude Code or Codex CLI. Studio is localhost-only by default and exposes no generic shell endpoint.

## Reference systems

The repository proof is the working code, not miniature promotional cards.

| System | Job |
| --- | --- |
| [`templates/modular-scroll-starter/`](templates/modular-scroll-starter/) | Brand-neutral cinematic scroll page |
| [`templates/immersive-sales-deck/`](templates/immersive-sales-deck/) | Guided sales, sponsorship, and launch presentation |
| [`templates/command-center-interface/`](templates/command-center-interface/) | Dense operator product interface |
| [`templates/threejs-product-stage/`](templates/threejs-product-stage/) | Progressive Three.js product stage with complete fallback |
| [`templates/free-design-stack/`](templates/free-design-stack/) | Pinned video narrative |
| [`templates/spline-scroll-landing/`](templates/spline-scroll-landing/) | Visually authored 3D page |
| [`templates/asset-scroll-gallery/`](templates/asset-scroll-gallery/) | Editorial resource gallery |
| [`vault/`](vault/) | Browse, preview, and install systems |
| [`inspiration/lab/`](inspiration/lab/) | Compose references into an original direction |

Complete surfaces:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/cinematic-page
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/immersive-sales-deck
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/command-center-interface
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/threejs-product-stage
```

## Install only what you need

| System | Includes | Install |
| --- | --- | --- |
| Studio core | product/design contracts, tokens, native motion, primary skill, planner | `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/studio-core` |
| Inspiration Intelligence | URL/file forensics, Design DNA, synthesis, originality review, influence ledger | `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/inspiration-intelligence` |
| Design Resolver | multi-viewport evidence, ranked root-cause repair, run comparison | `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/design-resolver` |
| AIgent Vision | annotated captures, structured critique, visual completion gate | `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/vision-critic` |
| Full studio | all design intelligence, production systems, references, skills, and QA | `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio` |

Review an item before installing it:

```bash
pnpm dlx shadcn@latest view wrg32786/aigent-design-system/inspiration-intelligence
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/inspiration-intelligence --dry-run
```

## One primary skill

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-design-skill
```

The consolidated [`aigent-design`](skills/aigent-design/SKILL.md) skill routes to specialists only when required:

```text
shape · inspire · create · page · deck · interface · asset
layout · typeset · color · animate · critique · polish
resolve · vision · audit · extract · install · eval
```

Product truth outranks generic taste advice. Inspiration is evidence, not a specification. Mobile is recomposed, not shrunk. Mechanical checks are a floor; rendered visual judgment decides completion.

## HyperFrames website-to-video

HyperFrames is now an optional first-class production route for turning websites, interfaces, design-system outputs, documents, and data stories into deterministic video. It is the preferred route when HTML is already the durable source and the deliverable is a product tour, launch film, README walkthrough, social variant, or reusable motion-graphics package.

Install the maintained upstream framework skills:

```bash
npx skills add heygen-com/hyperframes
npx hyperframes init my-video
cd my-video
npx hyperframes lint
npx hyperframes preview
npx hyperframes render
```

AIgent adds the surrounding product and delivery contract through:

- [`skills/hyperframes-video/SKILL.md`](skills/hyperframes-video/SKILL.md)
- [`integrations/hyperframes/README.md`](integrations/hyperframes/README.md)
- [`creative-production/pipelines/hyperframes.md`](creative-production/pipelines/hyperframes.md)

Use HyperFrames for HTML-native and website-to-video work. Keep Remotion for React-first programmatic media. Use a direct screen recording when literal interaction documentation is the whole job and authored motion adds no value.

## Inspiration Intelligence

Inspect public URLs or local references:

```bash
npx github:wrg32786/aigent-design-system inspire add https://example.com --label example
npx github:wrg32786/aigent-design-system inspire add reference.png
npx github:wrg32786/aigent-design-system inspire add reference.mp4
```

A public URL capture records desktop, tablet, and mobile screenshots; DOM hierarchy and geometry; computed typography and material roles; sticky regions; media; animation timing; responsive transformations; and browser errors.

Whole-surface synthesis requires at least three references so no single source controls the result:

```bash
npx github:wrg32786/aigent-design-system inspire compose \
  --brief design-intelligence/example-brief.json \
  --refs structure-source,type-source,motion-source \
  --out .aigent/inspiration-plan.json
```

The output includes Design DNA, a reference matrix, required transformations, source exclusions, production requirements, originality thresholds, and an influence ledger. Source copy, assets, marks, exact section order, type pairing, keyframes, camera paths, and implementation are never reused.

## AIgent Resolve

AIgent Resolve supplies browser facts:

```text
RENDER → DETECT → RANK → REPAIR → RERENDER → REVIEW
```

```bash
npx github:wrg32786/aigent-design-system resolve --init --target .

npx github:wrg32786/aigent-design-system resolve \
  --target . \
  --url http://127.0.0.1:3000/
```

It checks desktop, tablet, mobile, 200% text sizing, reduced motion, runtime failures, overflow, focus, touch targets, contrast, clipping, media, and request behavior. It ranks one coherent repair group so the agent fixes the shared cause rather than polishing random symptoms.

## AIgent Vision

AIgent Vision requires the operating agent, a human reviewer, or an explicit vision adapter to open every original and annotated capture. A screenshot existing on disk is not proof that it was inspected.

```bash
npx github:wrg32786/aigent-design-system vision prepare --target .

npx github:wrg32786/aigent-design-system vision check \
  --target . \
  --review .aigent/resolve/latest.visual-review.json

npx github:wrg32786/aigent-design-system vision finalize \
  --target . \
  --review .aigent/resolve/latest.visual-review.json
```

The `vision-critic` system reviews product clarity, hierarchy, composition, typography, color/material, motion/media, interaction, specificity, originality, responsive quality, trust/usability, and finish. Completion requires a passing mechanical gate, every required viewport reviewed, no open P0/P1 finding, and an explicit verdict.

## Creative production

`creative-production/` covers free and paid sources, AI generation, Blender, HyperFrames and Remotion rendering, video and GLB optimization, licensing, provenance, mobile derivatives, and reduced-motion fallbacks.

| Requirement | Preferred route |
| --- | --- |
| Controlled visual state | image + CSS |
| Atmospheric movement | short encoded video |
| Existing website / HTML → video | HyperFrames render |
| React/data-driven multi-format media | Remotion render |
| Exact scroll progression | frame sequence or scrub-ready video |
| Rotatable product | `model-viewer` |
| Visually authored 3D | Spline |
| Live shaders, geometry, or manipulation | Three.js |
| Photoreal fixed-camera scene | Blender render |
| Interactive vector state | Rive |

External primitives come from curated sources such as shadcn/ui, Radix Primitives, Base UI, Ark UI, Floating UI, Motion Primitives, Magic UI, React Bits, and TanStack Virtual. Install only what the project needs and restyle it into one visual world.

## Verification

Current repository contract:

| Contract | Current proof |
| --- | ---: |
| Installable registry items | **17** |
| Agent skills | **26** |
| Layout / type / motion systems | **15 / 8 / 14** |
| Curated component sources | **10** |
| Creative resources / integrations | **31 / 9** |
| Resolve on canonical starter | **100/100 · 0 errors · 0 warnings** |
| Vision review | **4 viewports · 12 dimensions · no open P0/P1** |
| Native packages | **Windows x64 · macOS arm64 · macOS x64** |

```bash
npm run catalogs
npm run assets
npm run intelligence
npm run inspiration
npm run resolve:check
npm run vision:check
npm run registry
npm run eval
npm run audit -- path/to/page path/to/shared.css
npm run check
npm run smoke
npm run inspiration:smoke
npm run capture
npm run desktop:check
npm run publish:check
```

GitHub Actions validates the registry, clean installer, planner, Inspiration Intelligence, AIgent Resolve, AIgent Vision, AIgent Studio, AIgent Desktop, evals, browser matrix, native packages, packaged application boot, and visual captures.

## Local development

```bash
npm install
npx playwright install chromium
npm run serve
```

Open:

```text
http://127.0.0.1:4177/
http://127.0.0.1:4177/vault/
http://127.0.0.1:4177/inspiration/lab/
```

<details>
<summary><strong>Repository architecture</strong></summary>

```text
PRODUCT.md
DESIGN.md
registry.json

desktop/                native installer, setup, updates, diagnostics
design-intelligence/    deterministic design decisions
inspiration/            forensics, Design DNA, synthesis, originality, lab
creative-production/    media sources, briefs, pipelines, standards
patterns/                ready-to-use interactions
templates/               complete reference surfaces
resolve/                 ranked mechanical render-repair contract
vision/                  annotated captures and structured visual critique
assets/                  provenance manifests and optimized outputs
integrations/            optional runtime and build-time guidance
recipes/                 production recipes
skills/                  primary and specialist agent skills
evals/                   fixed briefs and scoring contracts
case-studies/            production decision maps
vault/                   visual install catalog
scripts/                 CLI, planner, audits, checks, browser proof
tokens/                  semantic visual system
modules/                 dependency-free motion core
```

</details>

## Production proof

- **[theaigent.xyz](https://theaigent.xyz)** — cinematic Persuade + Experience surface
- **[tools.theaigent.xyz](https://tools.theaigent.xyz)** — dense Operate + Read surface

They set the craft bar. They are not universal templates or palettes. The reusable core remains brand-neutral; the AIgent visual language is one included preset.

## Third-party material

The repository links to external code, assets, references, and services but does not vendor them unless redistribution rights are clear. Read [`THIRD_PARTY.md`](THIRD_PARTY.md) and verify the active license and terms before use.

## License

MIT for AIgent-authored code and documentation.
