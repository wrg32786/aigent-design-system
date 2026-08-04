# AIgent Design System

A modular cinematic web system for building authored landing pages, product stories, resource libraries, galleries, decks, and scroll experiences with humans or coding agents.

The repository contains:

- semantic design tokens and five distinct theme presets
- small native motion modules
- static HTML templates for CSS, Spline, and video-scrub experiences
- product and design context files for agents
- a neutral design-director skill
- cinematic production playbooks
- a deterministic design audit and browser smoke tests

> **The core is brand-neutral.** The AIgent's cyan, cream, and green-black visual language is one included preset. Outside projects should keep the system and create their own visual world.

## Production Proof

The key showcases are live products, not mockups:

- **[The AIgent](https://theaigent.xyz)** — a Persuade + Experience surface built as a cinematic narrative descent.
- **[The AIgent Tools](https://tools.theaigent.xyz)** — an Operate + Read surface that adapts the same identity into a dense public vault.

They demonstrate the quality bar: product-specific composition, large editorial type, purposeful motion, useful instrumentation, mobile behavior, and one coherent visual world across different jobs.

They are proof of the system—not universal page templates.

## Start Here

Requirements:

- Node.js 20 or newer
- npm
- a modern browser

```bash
npm install
npm run serve
```

Open:

- `http://127.0.0.1:4177/`
- `http://127.0.0.1:4177/templates/modular-scroll-starter/`

Run the checks:

```bash
npm run check
npm run audit -- templates/modular-scroll-starter tokens/system.css
npm run smoke
```

Use another port when needed:

```bash
PORT=8788 npm run serve
```

PowerShell:

```powershell
$env:PORT = "8788"; npm run serve
```

## What To Open

| Surface | Use it for | Runtime |
| --- | --- | --- |
| `templates/modular-scroll-starter/` | A new brand-neutral cinematic page | Native CSS + JavaScript |
| `templates/free-design-stack/` | Controlled video scrubbing and scene transitions | GSAP + local MP4 assets |
| `templates/spline-scroll-landing/` | A scroll-mapped interactive 3D background | Spline + GSAP |
| `templates/asset-scroll-gallery/` | Resource libraries and editorial galleries | Spline + native JavaScript |
| `index.html` | The system dossier and production showcase | Native CSS + JavaScript |

Start with the modular starter unless a richer template solves a known media requirement.

## Define The Product Before The Palette

The repository now carries two durable context files:

- `PRODUCT.md` — users, purpose, proof, voice, anti-references, and constraints
- `DESIGN.md` — the visual world, surface modes, typography, composition, materials, motion, and quality floor

For a new project, copy the compact template from:

```text
docs/project-context.md
```

Choose the mode from the surface:

| Mode | Visitor success | Priority |
| --- | --- | --- |
| Persuade | Decides and acts | Offer, proof, desire, visible action |
| Operate | Completes a task | Scanability, state, familiar controls |
| Read | Understands material | Structure, measure, rhythm, wayfinding |
| Experience | Enters the work | Artifact first, interface recedes |

A tool's homepage can be Persuade while its dashboard is Operate. Do not force one composition across every route.

## Use The Neutral Core

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

- `--ds-color-*` for surfaces, text, accents, and rules
- `--ds-font-*` and `--ds-size-*` for type roles
- `--ds-space-*` and `--ds-radius-*` for rhythm and shape
- `--ds-scroll` and `--ds-scene-*` for scroll-linked media
- `.ds-shell`, `.ds-container`, `.ds-panel`, `.ds-button`, `.ds-status`, `.ds-rule-list`, and `.ds-skip-link` for small primitives

There is no React, Tailwind, build step, or animation dependency in the neutral core.

## Themes

Set `data-theme` on the root element:

```html
<html data-theme="paper">
```

Included presets:

- `graphite` — warm mineral dark with rust and patina
- `aigent` — cyan and amber on green-black
- `ember` — orange and gold on a warm dark ground
- `cobalt` — blue and acid green on deep navy
- `paper` — light editorial paper, oxblood, and teal

These presets prove the token contract. They are not a substitute for art direction.

### Make a custom theme

Override the source triplets and the derived semantic roles update automatically:

```css
[data-theme="my-brand"] {
  color-scheme: dark;
  --ds-bg-rgb: 14 12 20;
  --ds-surface-rgb: 31 25 42;
  --ds-surface-2-rgb: 46 37 60;
  --ds-text-rgb: 246 242 252;
  --ds-accent-rgb: 236 90 124;
  --ds-accent-2-rgb: 118 205 179;
  --ds-color-accent-ink: #1d0710;
}
```

Keep the RGB values space-separated because the system derives alpha variants with expressions such as:

```css
rgb(var(--ds-accent-rgb) / 0.18)
```

Change the font roles as part of the same visual decision:

```css
[data-theme="my-brand"] {
  --ds-font-display: "Your Display Face", sans-serif;
  --ds-font-body: "Your Body Face", sans-serif;
  --ds-font-mono: "Your Data Face", monospace;
}
```

## Motion Modules

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

The scene helper only publishes CSS variables:

```css
--ds-scroll
--ds-scene-progress
--ds-scene-scale
--ds-scene-rotate
--ds-scene-x
--ds-scene-y
--ds-scene-brightness
```

The scene itself can be:

- a CSS composition
- a static image with depth transforms
- a Spline embed
- a video or frame sequence
- a Three.js canvas
- a WebGL shader

Content does not need to know which renderer is behind it.

## Architecture

```text
PRODUCT.md              product truth and anti-references
DESIGN.md               durable visual and interaction decisions

tokens/
  system.css            neutral semantic tokens, presets, primitives
  aigent-tokens.css     AIgent preset and compatibility aliases

modules/
  motion.js             scroll progress, scene mapping, reveals, themes

templates/
  modular-scroll-starter/
  free-design-stack/
  spline-scroll-landing/
  asset-scroll-gallery/

skills/
  cinematic-web-director/
  aigent-3d-scroll-system/
  aigent-landing-page-polish/
  aigent-asset-gallery-system/

scripts/
  design-audit.mjs      deterministic frontend checks
  check.mjs             repository contract and audit self-check
  smoke.mjs             desktop/mobile browser verification

docs/
  project context, taste rules, cinematic playbooks, QA, and source intake
```

The layers stay separate:

1. **Content** — copy, proof, links, product data, and actions.
2. **Theme** — type, color, spacing, surfaces, and component roles.
3. **Scene** — CSS, images, video, Spline, frame sequences, or WebGL.
4. **Motion** — small modules mapping scroll and viewport state to CSS.
5. **Template** — one composition for one use case.

A reusable page accepts new content, a new theme, and new media without rewriting its motion engine.

## Taste Rules

Read `DESIGN.md` and `docs/design-principles.md` before creating a new page.

The brief may earn any device. Habit does not. By default:

- do not use an identical card grid as the page scaffold
- do not nest cards
- do not put an eyebrow above every heading
- do not number sections unless the sequence matters
- do not use gradient text as generic emphasis
- do not use glass without valuable media behind it
- do not use mono merely to make a page feel technical
- do not add a floating 3D object without a story or job
- do not scatter glow across inactive surfaces
- do not give every section the same entrance animation

Prefer one focal point per chapter, one authored motion idea per page, fewer surfaces, stronger spacing, real proof, and product-specific composition.

## Deterministic Design Audit

Run the audit on any HTML/CSS/JS target:

```bash
npm run audit -- path/to/page path/to/shared.css
```

Strict mode fails on implementation errors:

```bash
npm run audit -- path/to/page path/to/shared.css --strict
```

The audit currently checks for issues including:

- missing document language or viewport
- missing or duplicate `h1`
- images without alt text
- non-semantic click targets
- unsafe `target="_blank"` links
- removed focus outlines
- motion without a reduced-motion alternative
- interactive pages without `focus-visible`
- `transition: all`
- bounce or elastic easing by reflex
- gradient text
- pure-black page grounds
- repeated eyebrows and likely three-card scaffolds
- excessive `will-change`

It is deliberately small. It catches mechanical drift; browser inspection still decides visual quality.

## Agent Skills

### Neutral director

Use `skills/cinematic-web-director/SKILL.md` for new brands and general cinematic frontend work. It reads the product and design context, chooses the surface mode, preserves existing visual authority, selects the lightest renderer, applies the taste floor, and verifies the result.

### AIgent-specific skills

The existing `aigent-*` skills remain useful when building inside The AIgent visual world or adapting the production showcase patterns.

Claude Code:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Recurse .\skills\cinematic-web-director "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.claude\skills\"
```

Codex:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills"
Copy-Item -Recurse .\skills\cinematic-web-director "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.codex\skills\"
```

A useful prompt:

```text
Use this repository as a cinematic web system.

Read PRODUCT.md, DESIGN.md, docs/design-principles.md, and the
cinematic-web-director skill. Determine the surface mode. Start from the
modular scroll starter, preserve the ds-* contracts, and create a new visual
world from this product's audience, proof, and anti-references. Do not copy
The AIgent palette unless the brand context earns it. Verify 1440px and 390px,
run the design audit, and keep one signature motion idea.
```

## Optional: Use Impeccable Alongside This Repo

This system's context-first workflow, anti-reference discipline, bounded visual QA, and deterministic audit were informed by [pbakaus/impeccable](https://github.com/pbakaus/impeccable), licensed under Apache 2.0.

No Impeccable code or skill files are vendored here. This repository implements its own smaller workflow around cinematic pages and the production lessons from The AIgent.

Teams already using Impeccable can install it separately and use its `init`, `critique`, `audit`, and `polish` workflows against these templates. `PRODUCT.md` and `DESIGN.md` are intentionally compatible with that context-first model.

## Existing AIgent Compatibility

The original templates use `--aigent-*` tokens and `.aigent-*` classes. They remain supported through:

```html
<link rel="stylesheet" href="/tokens/aigent-tokens.css" />
```

New work should prefer:

```html
<link rel="stylesheet" href="/tokens/system.css" />
```

The compatibility layer lets the repository improve without breaking the production showcase pages.

## Choosing A Media Technique

Use the lightest technique that carries the concept:

| Technique | Use it when | Avoid it when |
| --- | --- | --- |
| CSS transforms and masks | The scene is graphic or abstract | Photoreal art direction is required |
| Spline | You need a fast interactive 3D scene | Bundle weight or mobile GPU limits are strict |
| Video scrub | You need controlled photoreal direction | The source cannot be encoded for seeking |
| Frame sequence | Exact frames and mobile consistency matter | Asset weight cannot be managed |
| Three.js/WebGL | Live geometry, lighting, or manipulation matters | A rendered sequence would tell the same story |

## Video Scrub Rules

For smooth seeking:

- prefer short MP4 files with frequent keyframes or all-intra encoding
- load the hero poster and loop first
- warm the first scrub clip on intent or delayed idle time
- warm later clips near their transition windows
- match seek cadence to the source frame rate
- verify range requests return `206` with `Accept-Ranges: bytes`
- do not hide a seeking problem by shipping blurry media

The full production checklist is in `docs/cinematic-scroll-deck-playbook.md`.

## Quality Bar

Before publishing:

- the first viewport clearly explains the offer, artifact, or task
- real proof or product behavior appears early
- one focal point leads each chapter
- body text maintains readable contrast and measure
- keyboard focus is visible
- touch targets are usable
- reduced motion preserves all content and state
- desktop and mobile have no horizontal overflow
- media loads in the order it becomes useful
- links and controls are real, labeled, and reachable
- the page is inspected in a browser rather than judged from source alone

## Adding A Reusable Pattern

1. Confirm the same intent exists in at least two real pages.
2. Reuse an existing token, primitive, or module before creating another.
3. Record outside references in `docs/source-stack-intake.md`.
4. Implement the smallest original asset that captures the lesson.
5. Verify the source license before vendoring anything.
6. Update `THIRD_PARTY.md` when material is included directly.
7. Run `npm run check`, `npm run audit`, and `npm run smoke`.

Do not build framework adapters or generic components for hypothetical future pages.

## Publishing

The templates are static:

1. Copy the chosen template into the target site.
2. Copy `tokens/system.css` and required modules.
3. Write the project's `PRODUCT.md` and `DESIGN.md`.
4. Replace content and media.
5. Fix relative paths.
6. Confirm assets return `200`; scrub media should support range requests.
7. Run the audit and desktop/mobile checks.
8. Deploy to any static host.

## Project Direction

This is an early `0.x` public kit. It is deliberately not a large component library.

Near-term work:

- migrate the remaining AIgent showcase templates to the semantic token API without changing their visual identity
- extract only motion patterns proven across multiple production pages
- add lightweight visual-regression captures
- document additional production case studies
- add framework adapters only after the static contracts stabilize

## License

MIT for AIgent-authored code and documentation.

Read `THIRD_PARTY.md` before publishing or redistributing imported media, Spline scenes, fonts, generated assets, or outside code.
