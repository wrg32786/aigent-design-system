---
name: aigent-design
description: Turn Claude or another coding agent into a professional design studio for immersive websites, 3D experiences, cinematic decks, product interfaces, inspiration synthesis, creative media, ranked repair, and production verification.
---

# AIgent Design

Use this as the single entry point for the flagship design system. It routes to specialist inspiration, video, 3D, GSAP, Spline, Three.js, Remotion, provenance, resolve, and browser-QA skills only when needed.

## Start once

```bash
node skills/aigent-design/scripts/context.mjs --command <command> --target <path>
```

Then read:

1. `PRODUCT.md`
2. `DESIGN.md`
3. the target surface brief, if present
4. `design-intelligence/README.md`
5. the one reference that owns the command
6. `reference/craft-floor.md` immediately before implementation or final review

Do not load every reference into context.

## Commands

| Command | Owns |
| --- | --- |
| `shape` | clarify the design brief, then stop |
| `inspire` | inspect references, create Design DNA, synthesize a direction, and record influence |
| `create` | new surface or replacement visual world |
| `page` | cinematic page, story, gallery, or landing surface |
| `deck` | immersive sales, launch, sponsorship, or presentation deck |
| `interface` | product UI, dashboard, editor, command center, or resource system |
| `asset` | video, 3D, frame sequence, poster, texture, or rendered media |
| `layout` | hierarchy, grouping, density, structure, responsive adaptation |
| `typeset` | font roles, hierarchy, reading, and delivery |
| `color` | palette strategy, semantic roles, contrast, and material |
| `animate` | focal motion, continuity, feedback, and reduced motion |
| `critique` | design review with evidence and priorities |
| `polish` | final pass on an already working surface |
| `resolve` | render, rank, repair, rerender, and verify until the gate and visual review pass |
| `audit` | deterministic, inspiration, browser, asset, registry, and rights checks |
| `extract` | convert proven work into a reusable recipe or registry item |
| `install` | choose and install the smallest useful system or component source |
| `eval` | score a finished result without faking visual judgment |

## Core laws

- Product truth and explicit user constraints outrank generic taste advice.
- Choose the mode from the surface: Persuade, Operate, Read, or Experience.
- Inspiration is evidence, not a specification.
- Whole-surface inspiration uses at least three references; no source controls more than two design dimensions.
- Show the reference matrix, transformations, and exclusions before implementation.
- Never reuse source copy, assets, marks, section order, exact type pairing, exact keyframes, or source code.
- Generate multiple viable structures before committing to a whole new surface.
- One dominant composition and one signature motion idea carry the surface.
- Media is part of the direction, not decoration added later.
- Use the first medium, runtime, component, or browser feature that carries the requirement.
- Mobile is recomposed, not shrunk.
- Reduced motion preserves meaning and hierarchy.
- Real browser evidence decides whether the work is done.
- Mechanical checks rank problems; they do not get to erase the selected visual world.

## Planning contract

For open whole-surface work:

1. Complete a product brief.
2. When references are involved, run Design Forensics and compose the inspiration plan first.
3. Run `npm run plan -- <brief.json> --out .aigent/design-plan.json`.
4. Inspect the recommended direction, seeded exploration, and conventional fallback.
5. Record:

```text
THESIS
OWN WORLD
STRUCTURE
INSPIRATION AND TRANSFORMATIONS
MOTION
PROOF AND FALLBACKS
```

## Inspiration routing

- `design-forensics` — live URL, screenshot, motion, or structured reference to Design DNA
- `reference-synthesis` — reference matrix, required transformations, AIgent pattern mapping, and influence ledger
- `inspiration-originality-audit` — source dominance, copy overlap, asset reuse, and weak transformation review

Primary commands:

```bash
node scripts/inspire.mjs add <url-or-file>
node scripts/inspire.mjs compose --brief brief.json --refs a,b,c
node scripts/inspire.mjs apply plan.json --target .
node scripts/inspire.mjs audit --target-dna target.json --plan plan.json --refs a,b,c
```

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

## Resolve routing

Use `design-resolver` after the surface works end to end:

```bash
npx github:wrg32786/aigent-design-system resolve --init --target .
npx github:wrg32786/aigent-design-system resolve --target . --url <local-url>
```

The resolver combines source and rendered evidence, ranks the highest-value repair group, compares each run, and stops the agent from declaring completion before desktop, tablet, mobile, text zoom, reduced motion, runtime behavior, and explicit visual judgment are complete.

## Completion

A finished result includes product-specific content, a committed visual world, working desktop and mobile states, reduced motion, complete UI states, optimized and manifest-backed media, an influence ledger when references were used, a passing Resolve mechanical gate, explicit visual review, and no unresolved rights or private records.

A prompt, mood board, screenshot imitation, partial component list, technically working effect, or green mechanical report without rendered judgment is not a finished design.
