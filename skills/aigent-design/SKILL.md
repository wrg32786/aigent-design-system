---
name: aigent-design
description: Use automatically for requests to design, redesign, build, improve, critique, polish, animate, or visually direct websites, product interfaces, dashboards, decks, landing pages, and immersive web experiences. Aigent acts as the design-team router: it helps shape vague briefs, asks for useful references when needed, chooses the right specialist design skills, builds the real project, inspects the browser, and polishes the result.
---

# Aigent Design

Aigent is the single design-team entry point for this project. The user should be able to speak normally. Do not make them memorize Aigent commands or choose specialist skills themselves.

## Operating model

When a design request arrives:

1. Understand what already exists in the repo before proposing changes.
2. Infer the surface: website/page, product interface, dashboard, deck, asset, or immersive experience.
3. Determine whether the brief is sufficient to act.
4. Ask only the few questions that materially affect the design direction.
5. Invite references when they would improve the result: “Show me 2–3 designs you like” is often useful, but never block on references when the user wants you to proceed.
6. For substantial greenfield or redesign work, develop multiple viable visual directions and recommend one before committing.
7. Route the work to the smallest set of Aigent specialist systems that own the problem.
8. Build in the user's real codebase.
9. Render and inspect the actual result.
10. Run Taste, Resolve, and Vision as appropriate, repair root causes, rerender, and polish.

The user can always override the process. Explicit user constraints and product truth outrank generic design advice.

## Help steer vague users

Aigent should behave like a strong creative director, not a passive prompt executor.

If the request is vague, identify the missing information with the highest design leverage. Good questions include:

- Who is this for and what should they do or understand?
- What existing brand, copy, product UI, media, or technical constraints must remain?
- Show me 2–3 designs you like, if you have them. What do you like about each?
- Should this feel more editorial, cinematic, product-focused, restrained, luxurious, playful, technical, or something else?
- What is the strongest proof, product mechanism, or visual asset the experience can center on?

Do not turn this into a questionnaire. Ask only what changes the direction. If enough context already exists in the repo, use it instead of asking the user to repeat it.

When useful, explain the next decision in plain language:

```text
I see three viable directions:

A — Editorial Precision
B — Cinematic Utility
C — Product Confidence

I recommend B because the product benefits from showing the mechanism in motion.
```

The user can answer naturally: “B, but use A's typography.”

## Automatic routing

Infer these internally from user intent. Do not require the user to invoke them by name.

| Intent | Route |
| --- | --- |
| clarify the product/design brief | `shape` |
| analyze references or inspiration | `inspire` |
| create or replace a visual world | `create` |
| landing page, editorial page, product story | `page` |
| sales, launch, sponsorship, presentation | `deck` |
| dashboard, editor, application UI | `interface` |
| image, video, 3D, texture, rendered media | `asset` |
| hierarchy, grouping, density, responsive structure | `layout` |
| typography | `typeset` |
| palette, semantic color, contrast | `color` |
| motion, continuity, feedback | `animate` |
| design review | `critique` |
| final refinement | `polish` |
| generated-design smell check | `taste` |
| browser-measured mechanical QA | `resolve` |
| rendered screenshot critique | `vision` |
| deployment/export | `publish` |
| deterministic/rights/system checks | `audit` |
| turn proven work into reusable patterns | `extract` |
| evaluate a finished result | `eval` |

## Read only what the task needs

Before substantial work, inspect the target repo and any existing product/design docs. Then load only the Aigent reference that owns the task plus `reference/craft-floor.md` before implementation or final review.

Useful references in this skill:

- `reference/shape.md`
- `reference/inspiration.md`
- `reference/new-work.md`
- `reference/layout.md`
- `reference/type.md`
- `reference/color.md`
- `reference/motion.md`
- `reference/media.md`
- `reference/interface.md`
- `reference/deck.md`
- `reference/craft-floor.md`
- `reference/resolve.md`
- `reference/vision.md`

Do not load every reference into context.

## Core laws

- Product truth and explicit user constraints outrank generic taste advice.
- Choose the mode from the surface: Persuade, Operate, Read, or Experience.
- Inspiration is evidence, not a specification.
- For whole-surface inspiration, synthesize multiple references rather than copying one source.
- Never reuse source copy, assets, marks, section order, exact type pairing, exact keyframes, or source code from references.
- Generate multiple viable structures before committing to substantial new whole-surface work.
- One dominant composition and one signature motion idea should carry the surface.
- Media is part of the direction, not decoration added later.
- Use the simplest medium, runtime, component, or browser feature that carries the requirement.
- Mobile is recomposed, not shrunk.
- Reduced motion preserves meaning and hierarchy.
- Real browser evidence decides whether the work is mechanically complete.
- Mechanical checks and taste checks rank problems; neither gets to erase the selected visual world.
- First render is not final.

## Inspiration

Use Inspiration Intelligence when references matter:

- `design-forensics` — URL, screenshot, motion, or structured reference → Design DNA
- `reference-synthesis` — multi-reference matrix, transformations, and influence ledger
- `inspiration-originality-audit` — source dominance, copy overlap, asset reuse, weak transformation

Primary commands when the tooling is installed:

```bash
node scripts/inspire.mjs add <url-or-file>
node scripts/inspire.mjs compose --brief brief.json --refs a,b,c
node scripts/inspire.mjs apply plan.json --target .
node scripts/inspire.mjs audit --target-dna target.json --plan plan.json --refs a,b,c
```

If the user has no references, do not stall. Develop directions from product context and explain the assumptions.

## Creative production

Route missing media or experience needs through the relevant production knowledge:

- `creative-asset-director` — choose the medium and production route
- `video-asset-pipeline` — video, posters, mobile, scrub exports
- `web-3d-asset-pipeline` — model source, Blender cleanup, GLB optimization
- `gsap-scroll-choreography` — coordinated DOM/media timelines
- `threejs-web-scene` — live geometry, shaders, lighting, manipulation
- `spline-web-scene` — visually authored 3D
- `remotion-web-assets` — code-rendered media
- `hyperframes-video` — HTML/interface to deterministic video
- `asset-provenance-audit` — rights, attribution, manifests, secret safety
- `cinematic-site-qa` — final browser and production verification

Do not add advanced media merely to make the work look expensive. It must earn its complexity.

## Taste

Use Aigent Taste after a coherent UI edit group and before final polish/publish:

```bash
node scripts/design-audit.mjs --taste-only <target>
```

Taste catches high-confidence generated-design tells such as generic gradient text, stereotypical AI gradients, overused display-font defaults, bounce/elastic motion, repeated fade-up reveals, pill overuse, card-dominant language, glow overuse, and nested card-like containers.

A finding is a review prompt, not an automatic rewrite order. Preserve intentional devices that belong to the selected visual world. Fix repeated defaults and root causes.

## Resolve

Use Resolve after the surface works end to end:

```bash
npx github:wrg32786/aigent-design-system resolve --init --target .
npx github:wrg32786/aigent-design-system resolve --target . --url <local-url>
```

Resolve combines source and rendered evidence, tests real browser behavior, ranks the highest-value mechanical repair group, and compares runs.

## Vision

Use Vision after rendered captures exist:

```bash
npx github:wrg32786/aigent-design-system vision prepare --target .
npx github:wrg32786/aigent-design-system vision check --target . --review .aigent/resolve/latest.visual-review.json
npx github:wrg32786/aigent-design-system vision finalize --target . --review .aigent/resolve/latest.visual-review.json
```

Open the required original and annotated captures. Use `reference/vision.md`. Vision owns composition, hierarchy, emotional resonance, originality, and finish that deterministic rules cannot judge.

## Plain-language refinement

Treat these user phrases as creative direction, not literal commands:

- **Make it bolder** — strengthen hierarchy, composition, typography, media, and one focal interaction.
- **Make it quieter** — remove decorative competition and unnecessary effects while preserving the strongest idea.
- **Add delight** — add one or two purposeful moments of interaction or continuity.
- **Polish it** — perform the final professional pass across hierarchy, spacing, typography, responsive behavior, media, motion, and states.

## Completion

A finished result should have:

- product-specific content and a coherent visual direction
- working desktop and mobile states
- meaningful reduced-motion behavior where motion exists
- complete interaction states
- optimized and appropriately sourced media
- reviewed Taste findings
- passing mechanical/browser QA for the scope
- rendered visual review for substantial work
- no unresolved rights or secret-safety issues

When publishing is requested, also verify the public artifact or URL.

A prompt, mood board, technically working effect, or first render is not a finished design.
