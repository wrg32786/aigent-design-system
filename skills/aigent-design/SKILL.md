---
name: aigent-design
description: Turn Claude or another coding agent into a professional website and interface designer for immersive 3D sites, cinematic landing pages, sales decks, galleries, dashboards, tools, and complete product UI. Routes product context, layout, typography, media, motion, open-source components, implementation, and QA through one coherent design workflow.
---

# AIgent Design

Use this as the single entry point for the flagship design system. It routes to the repository's specialist production skills when a task needs video, 3D, GSAP, Spline, Three.js, Remotion, provenance, or browser QA.

## Start once

Run:

```bash
node skills/aigent-design/scripts/context.mjs --command <command> --target <path>
```

Then read:

1. `PRODUCT.md`
2. `DESIGN.md`
3. the target surface brief, if present
4. `design-intelligence/README.md`
5. the one reference that owns the requested command
6. `reference/craft-floor.md` immediately before implementation or final review

Do not load every reference into the context window.

## Commands

| Command | Owns |
| --- | --- |
| `shape` | clarify the design brief, then stop |
| `create` | new surface or replacement visual world |
| `page` | cinematic page, story, gallery, or landing surface |
| `deck` | immersive sales, launch, sponsorship, or presentation deck |
| `interface` | product UI, dashboard, editor, command center, or resource system |
| `asset` | video, 3D, frame sequence, poster, texture, or rendered media |
| `layout` | hierarchy, grouping, density, structure, responsive adaptation |
| `typeset` | font roles, type hierarchy, reading, delivery |
| `color` | palette strategy, semantic roles, contrast, material |
| `animate` | focal motion, continuity, feedback, reduced motion |
| `critique` | design review with evidence and priorities |
| `polish` | final pass on an already working surface |
| `audit` | deterministic, browser, asset, registry, and rights checks |
| `extract` | convert proven work into a reusable recipe or registry item |
| `install` | choose and install a local kit or external component source |
| `eval` | score a finished result without faking visual judgment |

Unknown or broad requests route to `create`, `page`, `interface`, or `deck` based on the surface.

## Core laws

- The brief wins. Pinned product truth, constraints, and visual commitments outrank generic taste advice.
- Choose the mode from the surface: Persuade, Operate, Read, or Experience.
- Refinement preserves. Redesign replaces. Do not split the difference.
- Existing visual authority can live in code, assets, and production surfaces even when `DESIGN.md` is incomplete.
- Generate multiple viable structures before committing to a whole new surface.
- The first viewport must make the offer, artifact, or task legible.
- One dominant composition and one signature motion idea carry the surface.
- Media is part of the design direction, not a decorative dependency added later.
- Use the first medium and runtime that carries the requirement.
- External components accelerate engineering; they never choose the visual world.
- Operate and Read surfaces favor familiar behavior, complete states, and stable density.
- Mobile is recomposed, not shrunk.
- Reduced motion preserves meaning and hierarchy.
- Real browser evidence decides whether the work is done.

## Planning contract

For open whole-surface work:

1. Complete `design-intelligence/example-brief.json` or an equivalent brief.
2. Run `npm run plan -- <brief.json> --out .aigent/design-plan.json`.
3. Inspect the recommended layout, seeded exploration direction, and conventional fallback.
4. Select one direction based on audience identification and product clarity.
5. Record a short direction contract in the surface:

```text
THESIS
OWN WORLD
STRUCTURE
MOTION
PROOF AND FALLBACKS
```

The planner is a forcing function against habitual output. It does not overrule a clear brief.

## Production routing

- `creative-asset-director` — missing media or asset choice
- `video-asset-pipeline` — video, posters, mobile, scrub exports
- `web-3d-asset-pipeline` — model source, Blender cleanup, GLB optimization
- `gsap-scroll-choreography` — coordinated DOM and media timeline
- `threejs-web-scene` — live geometry, shaders, lighting, manipulation
- `spline-web-scene` — visually authored 3D
- `remotion-web-assets` — code-rendered media
- `asset-provenance-audit` — rights, attribution, manifests, secret safety
- `cinematic-site-qa` — final browser and production verification

## Completion

A finished result includes:

- product-specific content and structure
- a committed visual world
- a working desktop state
- an authored mobile state
- reduced-motion behavior
- complete loading, empty, error, and failure states where applicable
- optimized and manifest-backed production media
- deterministic and browser checks
- no unresolved claims, rights, or credentials

A prompt, mood board, partial component list, or technically working effect is not a finished design.
