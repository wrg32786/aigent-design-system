# AIgent Cinematic Web System

A modular, agent-native production system for creating high-end scroll websites: art direction, video and 3D asset production, motion runtimes, reusable page systems, provenance, performance budgets, and browser QA.

The goal is not to make every site look like The AIgent. The goal is to give builders and coding agents the complete path from a product brief to an authored, production-ready cinematic website.

> **The neutral core remains dependency-free.** GSAP, Three.js, Spline, Remotion, Theatre.js, Rive, React Three Fiber, Blender, FFmpeg, and other tools are opt-in routes selected only when the page earns them.

## Production proof

The system is grounded in live products:

- **[The AIgent](https://theaigent.xyz)** — a Persuade + Experience surface built as a cinematic narrative descent.
- **[The AIgent Tools](https://tools.theaigent.xyz)** — an Operate + Read surface that adapts the same identity into a useful public vault.

They define the craft level, not a universal palette or template.

## One system, four stages

```text
DIRECT
Product truth, surface mode, visual world, composition, one signature motion

PRODUCE
Source, generate, model, animate, render, edit, clear, and optimize media

BUILD
Semantic tokens, static templates, GSAP, model-viewer, Spline, Three.js,
Remotion outputs, Theatre.js, Rive, or React Three Fiber

VERIFY
Provenance, asset budgets, accessibility, responsive behavior,
reduced motion, browser smoke tests, and visual judgment
```

| Stage | Start here |
| --- | --- |
| Direct | `PRODUCT.md`, `DESIGN.md`, `docs/project-context.md` |
| Produce | `creative-production/README.md`, `creative-production/catalog.json` |
| Build | `templates/`, `integrations/`, `recipes/`, `tokens/`, `modules/` |
| Verify | `scripts/`, `assets/manifests/`, `skills/cinematic-site-qa/` |

## Start

Requirements:

- Node.js 20 or newer
- npm
- a modern browser

```bash
npm install
npm run serve
```

Open:

```text
http://127.0.0.1:4177/
http://127.0.0.1:4177/templates/modular-scroll-starter/
```

Run the production checks:

```bash
npm run catalogs
npm run assets
npm run audit -- templates/modular-scroll-starter tokens/system.css
npm run check
npm run smoke
```

## Choose a page system

| System | Use it for | Default runtime |
| --- | --- | --- |
| `templates/modular-scroll-starter/` | A new brand-neutral cinematic page | Native CSS + JavaScript |
| `templates/free-design-stack/` | Pinned media and video-scrub narratives | GSAP + local video |
| `templates/spline-scroll-landing/` | A visually-authored 3D background | Spline + GSAP |
| `templates/asset-scroll-gallery/` | Resource libraries and editorial galleries | Spline + native JavaScript |
| `recipes/video-hero/` | One cinematic shot carrying the first viewport | HTML video |
| `recipes/interactive-3d-object/` | Inspectable or configurable product object | model-viewer or Three.js |
| `recipes/video-scrub-deck/` | Exact copy and media beats | GSAP + scrub-ready video |
| `recipes/remotion-hero-loop/` | Code-driven multi-format media | Remotion at build time |

Start with the modular starter unless a richer system solves a known requirement.

## Produce the media

Cinematic pages depend on the right media, but the asset must serve the page rather than decorate it.

```text
creative-production/
  catalog.json                 current source and tool directory
  briefs/                      hero, scene, 3D, and frame-sequence briefs
  sources/                     free, paid, hosted, and local routes
  pipelines/                   video, GLB, Blender, Remotion, runtime choice
  standards/                   budgets, provenance, mobile fallbacks
```

### Resource catalog

`creative-production/catalog.json` contains a curated, machine-readable directory of:

- CC0 models, textures, and HDRIs
- free and item-licensed 3D marketplaces
- free stock video, VFX, audio, and subscription libraries
- hosted AI video and AI 3D platforms
- local open generation models and ComfyUI
- Blender, DaVinci Resolve, FFmpeg, and glTF Transform

Every entry records:

- route and category
- cost tier
- license clarity
- commercial-use posture
- attribution expectations
- web readiness
- official source, license, and pricing pages
- cautions
- date last checked

Pricing, model availability, and rights change. The exact asset page and plan active at production time always override the summary.

Validate the catalog:

```bash
npm run catalogs
```

### Asset directories

```text
assets/
  manifests/          source, rights, production, outputs
  source/             ignored local working files
  web/
    models/           optimized GLB
    video/            encoded website video
    textures/         delivery textures
    posters/          poster and reduced-motion images
    sequences/        bounded frame sequences
  video/              existing showcase assets
```

Keep `.blend`, EXR, FBX, raw footage, marketplace downloads, caches, and private generation records outside Git.

Copy the example manifest:

```text
assets/manifests/example.asset-manifest.json
```

Then run:

```bash
npm run assets
```

## Select the medium before the library

| Requirement | Preferred route |
| --- | --- |
| Controlled still state | Image + CSS |
| Atmospheric movement | Short encoded video |
| Exact scroll frames | Frame sequence or scrub-ready video |
| One rotatable product | model-viewer |
| Visually-authored 3D | Spline |
| Live shaders, geometry, lighting, or manipulation | Three.js |
| React product with justified live 3D | React Three Fiber |
| Code-driven loops, diagrams, titles, and variants | Remotion render |
| Complex modeling, lighting, or photoreal scene | Blender render |
| Interactive vector state machine | Rive |

A pre-rendered Blender or Remotion asset is often more cinematic, lighter, and more predictable than live 3D. Live 3D earns its cost only when interaction matters.

## Optional integrations

The root package does not install these.

| Integration | Role | Install |
| --- | --- | --- |
| GSAP | Coordinated scroll and timeline choreography | `npm install gsap` |
| Three.js | Live WebGL and interactive 3D | `npm install three` |
| model-viewer | Simple GLB orbit, hotspots, and AR | `npm install @google/model-viewer` |
| Spline | Visual 3D authoring and embedding | `npm install @splinetool/runtime` |
| Remotion | Programmatic rendered web media | `npx create-video@latest` |
| Theatre.js | Visual keyframes for Three.js and DOM | `npm install @theatre/core @theatre/studio` |
| Rive | Interactive vector state machines | `npm install @rive-app/canvas` |
| React Three Fiber | Three.js inside an existing React product | `npm install three @react-three/fiber` |

Read `integrations/README.md` and `integrations/catalog.json` before adding one.

### Dependency rule

Use the first rung that carries the requirement:

```text
native platform
→ existing module
→ optional integration
→ custom runtime code
```

Do not make every template depend on every tool.

## Agent skills

`skills/cinematic-studio/` routes the complete workflow.

### Full production

| Skill | Responsibility |
| --- | --- |
| `cinematic-studio` | Direct → produce → build → verify |
| `cinematic-web-director` | Surface mode and visual direction |
| `creative-asset-director` | Medium, source, generation, and production brief |
| `video-asset-pipeline` | Web video, posters, mobile, scrub exports |
| `web-3d-asset-pipeline` | 3D source, Blender cleanup, GLB optimization |
| `asset-provenance-audit` | Rights, attribution, manifests, secret safety |
| `cinematic-site-qa` | Final mechanical and visual QA |

### Runtime and motion

| Skill | Responsibility |
| --- | --- |
| `gsap-scroll-choreography` | Coordinated scroll timelines |
| `threejs-web-scene` | Three.js and React Three Fiber |
| `spline-web-scene` | Spline production and integration |
| `remotion-web-assets` | Programmatic rendered media |
| `video-scrub-deck` | Guided and free-scroll video decks |

### Existing systems

| Skill | Responsibility |
| --- | --- |
| `modular-scroll-page` | Neutral starter |
| `cinematic-asset-gallery` | Neutral resource/gallery page |
| `aigent-3d-scroll-system` | The AIgent 3D and deck system |
| `aigent-landing-page-polish` | The AIgent conversion and polish rules |
| `aigent-asset-gallery-system` | The AIgent gallery identity |

Read `skills/README.md` for the complete index.

Install a skill by copying its folder into the agent's skills directory.

Claude Code:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Recurse .\skills\cinematic-studio "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\creative-asset-director "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\cinematic-site-qa "$HOME\.claude\skills\"
```

Codex:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills"
Copy-Item -Recurse .\skills\cinematic-studio "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\creative-asset-director "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\cinematic-site-qa "$HOME\.codex\skills\"
```

Suggested prompt:

```text
Use this repository as a complete cinematic web studio.

Read PRODUCT.md, DESIGN.md, docs/project-context.md, and the cinematic-studio
skill. Determine the surface mode and one signature visual idea. If required
media does not exist, use the creative-asset-director and the resource catalog
to choose a commercially usable source, generation, or render route. Produce
desktop, mobile, poster, and reduced-motion outputs with a provenance manifest.

Use the lightest runtime that carries the interaction. Preserve the ds-* API,
verify 1440px and 390px, run catalogs, assets, design audit, and browser smoke,
and do not copy The AIgent palette unless the project context earns it.
```

## Define product and design truth

The repository carries two durable context contracts:

- `PRODUCT.md` — users, purpose, proof, voice, anti-references, constraints
- `DESIGN.md` — visual world, composition, typography, media, motion, quality floor

Copy the project template:

```text
docs/project-context.md
```

Choose the surface mode:

| Mode | Visitor success | Priority |
| --- | --- | --- |
| Persuade | Decides and acts | Offer, proof, desire, visible action |
| Operate | Completes a task | Scanability, state, familiar controls |
| Read | Understands material | Structure, measure, rhythm, wayfinding |
| Experience | Enters the work | Artifact first, interface recedes |

A homepage can be Persuade while its product UI is Operate. Do not force one composition or motion language across every route.

## Use the neutral core

```html
<html lang="en" data-theme="graphite">
  <head>
    <link rel="stylesheet" href="/tokens/system.css" />
  </head>
  <body class="ds-shell">
    <a class="ds-skip-link" href="#content">Skip to content</a>
    <main id="content" class="ds-container">
      <p class="ds-status">Experience surface</p>
      <section class="ds-panel">...</section>
      <a class="ds-button" data-variant="solid" href="#start">Start</a>
    </main>
  </body>
</html>
```

The public API uses semantic roles:

- `--ds-color-*`
- `--ds-font-*` and `--ds-size-*`
- `--ds-space-*` and `--ds-radius-*`
- `--ds-scroll` and `--ds-scene-*`
- `.ds-shell`, `.ds-container`, `.ds-panel`, `.ds-button`, `.ds-status`, `.ds-rule-list`, `.ds-skip-link`

The included Graphite, AIgent, Ember, Cobalt, and Paper themes prove the contract. They are starting examples, not substitutes for art direction.

## Native motion modules

```html
<script type="module">
  import {
    mountReveals,
    mountScrollProgress,
    mountScrollScene,
    mountThemePicker
  } from "/modules/motion.js";

  mountScrollScene({
    progressMultiplier: 1.35,
    scale: 0.48,
    rotation: -18,
    translateY: -36,
    brightness: [0.9, 1]
  });

  mountReveals();
  mountThemePicker();
</script>
```

The scene helper publishes CSS variables. Content does not know whether the scene is CSS, video, Spline, a frame sequence, or WebGL.

## Quality floor

Before publishing:

- the first viewport explains the offer, artifact, or task
- real proof or product behavior appears early
- one focal point leads each chapter
- one authored motion idea carries the page
- the media belongs to the product world
- body text meets readable contrast and measure
- keyboard focus is visible
- touch targets are usable
- reduced motion preserves content and state
- mobile receives an authored composition
- assets load when they become useful
- video and 3D have loading and failure states
- every production asset has resolved rights
- no credentials or private records are public
- desktop and mobile have no horizontal overflow
- the page is inspected in a browser

## Validation commands

```bash
npm run catalogs
npm run assets
npm run audit -- path/to/page path/to/shared.css
npm run check
npm run smoke
```

- `catalogs` validates source and integration records.
- `assets` validates manifests, public output paths, file existence, budgets, and basic secret safety.
- `audit` catches deterministic frontend drift.
- `check` validates the repository contract and all skills.
- `smoke` opens key pages at desktop and mobile sizes.

GitHub Actions runs the repository check and browser smoke suite.

## Architecture

```text
PRODUCT.md
DESIGN.md

creative-production/
assets/
integrations/
recipes/

tokens/
modules/
templates/
skills/
scripts/
docs/
```

The system layers remain separate:

1. **Truth** — product, users, proof, constraints.
2. **Direction** — mode, visual world, composition, motion.
3. **Production** — source, generate, model, render, edit.
4. **Delivery** — optimize, encode, manifest, fallback.
5. **Runtime** — page, motion, video, 3D.
6. **Verification** — rights, budgets, accessibility, browser QA.

## Reuse rule

Extract a token, module, recipe, or skill only when the same intent appears in more than one real page.

Do not build framework adapters, generic components, or animation abstractions for hypothetical future work.

## Third-party material

This repository links to external tools, marketplaces, and generation services but does not vendor their code, models, assets, or agent skills.

Read `THIRD_PARTY.md`. Verify the exact license and plan before using any external asset or service in production.

## License

MIT for AIgent-authored code and documentation.
