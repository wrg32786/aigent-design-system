---
name: aigent-design
description: Use automatically for requests to design, redesign, build, improve, critique, polish, animate, or visually direct websites, product interfaces, dashboards, decks, landing pages, and immersive web experiences. Aigent provides art direction, design planning, browser QA, inspiration analysis, and structured visual review while Claude Code remains the interface.
---

# Aigent Design

Aigent is the design entry point for this repo. The user should speak normally. Do not require Aigent command vocabulary or pretend an optional capability is installed when it is not.

## Authority order

Before substantial work, inspect the real repo and use authority in this order:

1. explicit user constraints and current request
2. existing product, brand, design-system, and implementation truth
3. `.aigent/design-direction.md` when the user has actually approved one
4. `.aigent/project-context.md` when present
5. Aigent design guidance

Aigent must never treat its own brand or examples as the target project's product truth.

## Operating model

When a design request arrives:

1. Understand what exists before proposing changes.
2. Infer the surface: page, interface, dashboard, deck, asset, or immersive experience.
3. Ask only questions that materially change the direction.
4. Invite references when useful; never block solely because none were supplied.
5. Infer **Variance**, **Motion**, and **Density** from 1–10. They describe expression, not quality.
6. For substantial greenfield or redesign work, develop multiple viable directions before committing.
7. Persist `.aigent/design-direction.md` only after the user selects a direction.
8. Use the lightest medium, runtime, component, and tool that carries the requirement.
9. Build in the real project.
10. Render and inspect the result.
11. Run the relevant Aigent checks, repair root causes, rerender, and polish.

## High-leverage questions

Use existing repo context instead of asking the user to repeat it. When information is genuinely missing, prefer questions such as:

- Who is this for and what should they do or understand?
- What brand, copy, product UI, media, or technical constraints must remain?
- What is the strongest proof, mechanism, or visual asset this experience can center on?
- Show me 2–3 references you like, if you have them. What specifically works in each?

Do not turn this into an intake form.

## Creative controls

```text
VARIANCE  1 = familiar / conventional     10 = highly unconventional
MOTION    1 = nearly static               10 = cinematic / motion-led
DENSITY   1 = sparse / focused            10 = information-dense
```

Natural-language refinements update these controls. “Make it wilder” usually raises Variance. “Calm the animation down” lowers Motion. “Show me more at once” raises Density.

## Approved design direction

After the user chooses a substantial direction, create or update `.aigent/design-direction.md` with:

```markdown
# Approved design direction

## World
<physical, cultural, or product-specific visual world>

## Creative controls
- Variance: <1-10>
- Motion: <1-10>
- Density: <1-10>

## Composition
<dominant hierarchy and structural grammar>

## Typography
<roles and character>

## Palette / material
<color strategy and material behavior>

## Motion
<one primary motion thesis and restraint rules>

## Media / proof
<what visual evidence carries the product>

## Preserve
- <approved truths that must survive later edits>

## Avoid
- <category clichés, anti-references, rejected directions>
```

Do not manufacture approval. Record assumptions as provisional until the user chooses.

## Preservation contract

For scoped work, identify:

```text
TARGET
What should improve and what success looks like.

PRESERVE
Which approved content, layout, interactions, media, palette, components, and regions should remain unchanged.
```

After the edit, verify both target improvement and preservation. Broaden scope only when the root cause requires it.

## Visual calibration

The installed `visual-exemplars/` directory is a tiny calibration set, not a style library.

- Open only the 2–4 examples relevant to the current problem.
- Learn relationships such as hierarchy, asymmetry, product proof, and coherence.
- Never copy exact geometry, copy, palette, typeface, assets, or section structure.
- User references and approved project direction outrank Aigent examples.

## Read only what the task needs

Use the relevant file in `reference/` plus `reference/craft-floor.md` for substantial implementation or final review. Do not load every reference into context.

Useful references:

- `shape.md` — brief and product truth
- `inspiration.md` — references and transformations
- `new-work.md` — new whole-surface work
- `layout.md` — hierarchy, grouping, density, responsiveness
- `type.md` — typography
- `color.md` — palette and semantic color
- `motion.md` — motion and continuity
- `media.md` — image, video, 3D, and production choice
- `interface.md` — product UI
- `deck.md` — presentations and guided decks
- `resolve.md` — rendered mechanical QA
- `vision.md` — structured visual review
- `publish.md` — export and deployment

## Core laws

- Product truth and user constraints outrank generic taste advice.
- Choose the mode from the surface: Persuade, Operate, Read, or Experience.
- Inspiration is evidence, not a specification.
- Whole-surface inspiration should synthesize multiple references rather than clone one.
- Never reuse source copy, assets, marks, exact section order, exact type pairing, exact keyframes, or source code from references.
- One dominant composition and one signature motion idea should carry a surface.
- Media is part of the direction, not decoration added afterward.
- Use native platform features and existing project dependencies before adding new runtime weight.
- Mobile is recomposed, not shrunk.
- Reduced motion preserves meaning and hierarchy.
- The browser is the mechanical ground truth.
- First render is not final.

## Aigent tooling

Run Aigent tooling through the package so the host repo does not need copied runtime scripts or Aigent's dependencies.

Initialize project-specific context without replacing existing authority files:

```bash
npx github:wrg32786/aigent-design-system init
```

Prepare Chromium once for browser-backed features:

```bash
npx github:wrg32786/aigent-design-system setup-browser
npx github:wrg32786/aigent-design-system doctor
```

### Inspiration

```bash
npx github:wrg32786/aigent-design-system inspire add <url-or-file>
npx github:wrg32786/aigent-design-system inspire compose --brief brief.json --refs a,b,c
npx github:wrg32786/aigent-design-system inspire audit --target-dna target.json --refs a,b,c
```

Use `--allow-private` only when the user explicitly authorizes capture of a private or local network target.

### Taste

For the source-level generated-design smell check:

```bash
npx github:wrg32786/aigent-design-system add aigent-design-skill --dry-run
node .claude/skills/aigent-design/../../../../scripts/design-audit.mjs --taste-only .
```

If that local script path is not present, do not pretend Taste ran. Use the design principles manually or run the repository package's supported checks when available.

### Resolve

```bash
npx github:wrg32786/aigent-design-system resolve --init --target .
npx github:wrg32786/aigent-design-system resolve --target . --url <local-url>
```

Resolve is a mechanical floor: runtime, responsive, focus, contrast, touch-target, clipping, reduced-motion, and related browser evidence. It is not aesthetic judgment.

### Vision

```bash
npx github:wrg32786/aigent-design-system vision prepare --target . --url <local-url>
npx github:wrg32786/aigent-design-system vision check --target . --review .aigent/resolve/latest.visual-review.json
npx github:wrg32786/aigent-design-system vision finalize --target . --review .aigent/resolve/latest.visual-review.json
```

Vision is a structured review protocol for a capable image-reviewing agent or human. Open the captures and judge the rendered result; a JSON file existing is not proof of visual inspection.

### Publish

```bash
npx github:wrg32786/aigent-design-system publish export --project-dir . --entry /index.html
```

Use only the provider requested by the user and authenticate through the provider's official flow.

## Completion

A substantial result is complete only when it has:

- product-specific content and a coherent approved direction when one was chosen
- working desktop and mobile states
- meaningful reduced-motion behavior when motion exists
- complete interaction states for the scope
- appropriately sourced and optimized media
- browser QA for the scope
- actual rendered visual review for substantial work
- preservation of unrelated approved work
- no unresolved rights or secret-safety issues

A prompt, mood board, technically working effect, or first render is not a finished design.
