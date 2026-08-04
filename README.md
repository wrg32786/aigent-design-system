# AIgent Design System

An installable, agent-native studio for creating distinctive websites and interfaces: immersive 3D pages, cinematic sales decks, product UIs, resource vaults, media pipelines, design intelligence, and production QA.

The system is built to make Claude, Codex, Cursor, and other coding agents operate more like a senior design-and-production team:

```text
SHAPE → DIRECT → PRODUCE → BUILD → VERIFY
```

The neutral core stays framework- and dependency-light. GSAP, Three.js, Spline, Remotion, Rive, React Three Fiber, Theatre.js, Blender, FFmpeg, and external component registries are selected only when the work earns them.

## Production proof

- **[The AIgent](https://theaigent.xyz)** — cinematic Persuade + Experience surface.
- **[The AIgent Tools](https://tools.theaigent.xyz)** — dense Operate + Read surface.

They set the craft bar. They are not a universal color palette or page template.

## Instant install

This repository is a GitHub-native shadcn registry. It can distribute static HTML, CSS, JavaScript, documentation, project conventions, agent skills, and complete page systems—not only React components.

### Start with the studio core

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/studio-core
```

### Install a complete page or interface

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/immersive-sales-deck
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/command-center-interface
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/threejs-product-stage
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/cinematic-page
```

### Install everything

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
```

Review an item before writing files:

```bash
pnpm dlx shadcn@latest view wrg32786/aigent-design-system/immersive-sales-deck
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/immersive-sales-deck --dry-run
```

Browse every item in `vault/` or run:

```bash
pnpm dlx shadcn@latest list wrg32786/aigent-design-system
```

## Repository CLI

The zero-dependency CLI provides a local install path and design planner:

```bash
npx github:wrg32786/aigent-design-system list
npx github:wrg32786/aigent-design-system add studio-core --target .
npx github:wrg32786/aigent-design-system plan brief.json --out design-plan.json
npx github:wrg32786/aigent-design-system doctor
```

The GitHub registry is the preferred public distribution path. The local CLI is useful in repositories that do not use shadcn.

## What ships

### Complete reference systems

| System | Surface | Runtime |
| --- | --- | --- |
| `templates/modular-scroll-starter/` | Brand-neutral cinematic page | Native CSS + JavaScript |
| `templates/immersive-sales-deck/` | Guided sales and sponsorship deck | Native JavaScript |
| `templates/command-center-interface/` | Operator command center | Native product UI |
| `templates/threejs-product-stage/` | Progressive live 3D product stage | Three.js loaded on demand |
| `templates/free-design-stack/` | Pinned video narrative | GSAP + encoded video |
| `templates/spline-scroll-landing/` | Visually authored 3D page | Spline + GSAP |
| `templates/asset-scroll-gallery/` | Editorial resource gallery | Spline + native JavaScript |

Every new reference system includes a complete first view, mobile treatment, keyboard path, reduced-motion behavior, and a clear use/avoid contract.

### Ready-to-use interaction patterns

| Pattern | Job |
| --- | --- |
| `guided-deck` | Chapter navigation, keyboard control, focus, and progress |
| `command-palette` | Native dialog search and command events |
| `focus-reveal` | Bounded blur, mask, and focus material reveal |
| `scene-stage` | Global, chapter, and local scroll progress |
| `object-stage` | Progressive loading for model-viewer, Spline, or Three.js |

Install all five:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/patterns-core
```

## The AIgent design brain

`design-intelligence/` converts a product brief into a deterministic starting plan rather than letting every agent fall back to the same hero, card grid, typeface, and animation.

It currently includes:

- 15 layout grammars
- 8 typography systems
- 14 motion systems
- 5 interface systems
- a curated external component-source catalog
- a seeded exploration direction and a conventional fallback
- runtime, media, mobile, anti-pattern, and verification decisions

Create a brief from `design-intelligence/example-brief.json`, then run:

```bash
npm run plan -- design-intelligence/example-brief.json --out design-plan.json
```

The plan selects:

- surface mode: Persuade, Operate, Read, or Experience
- primary layout grammar
- alternate exploration and conventional fallback
- type roles and stress tests
- one focal motion plus restrained supporting motion
- media route and runtime
- compatible open-source component sources
- production deliverables
- anti-patterns and browser checks

The planner does not replace taste. It prevents habitual convergence and makes the starting decisions inspectable.

## One Claude skill, specialist depth

Install the consolidated project skill:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-design-skill
```

It installs to:

```text
.claude/skills/aigent-design/
```

The skill exposes a compact command vocabulary:

```text
shape      resolve the brief without writing code
create     create or replace a visual world
page       build a marketing, editorial, or experience page
deck       build a guided immersive deck
interface  build product UI with complete states
asset      source, generate, render, and optimize media
layout     fix hierarchy, grouping, rhythm, and responsive structure
typeset    establish role-based typography
color      establish palette, material, contrast, and semantic roles
animate    author one focal motion and useful state transitions
critique   identify the highest-value design failures
polish     finish the rendered result
extract    turn proven patterns into reusable assets
audit      run mechanical and browser checks
install    choose and install registry systems
```

The umbrella skill reads only the reference needed for the task and routes into the existing specialist skills for video, 3D, GSAP, Spline, Remotion, provenance, and QA.

## Component sources without visual soup

The system deliberately uses mature open-source primitives instead of rebuilding standard controls. `design-intelligence/component-sources.json` records when and how to use sources such as:

- shadcn/ui
- Radix Primitives
- Base UI
- Ark UI
- Floating UI
- Motion Primitives
- Magic UI
- React Bits
- TanStack Virtual

Rules:

1. Use a headless or accessible primitive before inventing standard behavior.
2. Install only the component that solves the task.
3. Restyle external components into one typography, spacing, surface, icon, and state system.
4. Do not mix the visible design language of several libraries.
5. Review the current source license before redistribution or commercial use.
6. React Bits is linked as an external source and is not vendored because its license includes additional restrictions.

The repository provides the direction, composition, media, and finish. External libraries provide proven primitives where they are stronger than another custom implementation.

## Creative production

High-end pages need more than frontend code. `creative-production/` covers:

- free and paid video, VFX, 3D, texture, HDRI, and audio sources
- hosted and local AI video and 3D generation
- hero, scene, object, and frame-sequence briefs
- Blender, Remotion, video, and GLB production pipelines
- mobile derivatives and reduced-motion fallbacks
- licensing and provenance
- web performance budgets

Start with:

```text
creative-production/README.md
creative-production/catalog.json
```

Use the lightest medium that carries the idea:

| Requirement | Preferred route |
| --- | --- |
| Controlled visual state | Image + CSS |
| Atmospheric movement | Short encoded video |
| Exact scroll progression | Frame sequence or scrub-ready video |
| Rotatable product | model-viewer |
| Visually authored 3D | Spline |
| Live shaders, geometry, or direct manipulation | Three.js |
| Programmatic loops and multi-format media | Remotion render |
| Photoreal scene and fixed camera | Blender render |
| Interactive vector state | Rive |

A complete asset has a manifest under `assets/manifests/` recording source, rights, production tools, desktop/mobile outputs, fallback, and file size.

## Production case studies

`case-studies/` documents how the live AIgent surfaces make different structural choices inside one established visual world:

- the homepage uses a progressive narrative descent for Persuade + Experience
- the tools vault uses direct categories, stable wayfinding, and restrained motion for Operate + Read

The case studies identify what is transferable, what is brand-specific, the mobile contract, relevant registry systems, and what should not be copied.

## Product and design context

Every serious project starts with two durable contracts:

- `PRODUCT.md` — users, purpose, proof, voice, anti-references, constraints
- `DESIGN.md` — visual world, composition, typography, media, motion, interface rules, quality floor

Copy the compact project template:

```text
docs/project-context.md
```

The system recognizes four surface modes:

| Mode | Success |
| --- | --- |
| Persuade | Visitor understands, believes, and acts |
| Operate | User completes a task quickly and confidently |
| Read | Reader understands and navigates material |
| Experience | Artifact or world leads from the first viewport |

A company can use all four. A marketing page should not force its theatrical composition into an operator dashboard.

## Evals

`evals/` contains five stable briefs for:

- developer-tool launch
- operations dashboard
- research dossier
- cinematic product story
- resource vault

The benchmark separates deterministic mechanical evidence from human design judgment.

```bash
npm run eval
npm run score -- --brief evals/briefs/developer-tool-launch.json --target path/to/site
```

A full comparison uses the same model, source content, time budget, asset allowance, and viewport with and without the system. Human reviewers explicitly score clarity, product specificity, composition, typography, motion/media, and finish. The script never fabricates a taste score.

## Verification

```bash
npm run catalogs
npm run assets
npm run intelligence
npm run registry
npm run eval
npm run audit -- path/to/page path/to/shared.css
npm run check
npm run smoke
npm run capture
```

- `catalogs` checks external source and runtime records.
- `assets` checks manifests, rights fields, output paths, budgets, and possible secrets.
- `intelligence` checks the layout/type/motion/interface catalogs and planner.
- `registry` checks every installable item and target.
- `eval` checks benchmark briefs and generated plans.
- `audit` catches deterministic frontend drift.
- `smoke` verifies key pages at desktop and mobile widths.
- `capture` creates reviewable desktop, mobile, and reduced-motion screenshots.

GitHub Actions runs the repository contract, Chromium smoke tests, and visual capture artifact on every pull request.

## Local development

```bash
npm install
npm run serve
```

Open:

```text
http://127.0.0.1:4177/
http://127.0.0.1:4177/vault/
```

## Architecture

```text
PRODUCT.md
DESIGN.md
registry.json

design-intelligence/    deterministic design decisions
creative-production/    media sources, briefs, pipelines, standards
assets/                  manifests and optimized public outputs
integrations/            optional runtime guidance
patterns/                ready-to-use interactions
recipes/                 production recipes
templates/               complete reference surfaces
skills/                  umbrella and specialist agent skills
evals/                   fixed briefs and scoring contract
case-studies/            production decision maps
vault/                   visual install catalog
scripts/                 planner, CLI, audits, checks, browser proof
tokens/                  semantic visual system
modules/                 dependency-free motion core
```

## Reuse rule

Extract a token, pattern, recipe, or skill only when the same intent appears in multiple real surfaces. Use an existing browser feature, repository module, or mature accessible primitive before adding another abstraction.

## Third-party material

The repository links to external code, assets, and services but does not vendor them unless redistribution rights are clear. Read `THIRD_PARTY.md` and verify the exact license and plan active when you use an external source.

## License

MIT for AIgent-authored code and documentation.
