# Aigent

**Turn Claude Code into a professional design team for your repo.**

Install Aigent into a project, open Claude Code, and talk normally. Aigent gives Claude the design judgment, visual references, specialist skills, production routes, browser QA, and visual-review loop to design and build the real project.

No separate app. No new IDE. No Aigent account.

## Install

From the repo you want to design:

```bash
npx github:wrg32786/aigent-design-system install
claude
```

Then say:

```text
Use Aigent to help me redesign this site.
```

That is the normal workflow.

## What Claude becomes

After install, Claude can act more like a small design team than a coding assistant. It can:

- help shape a vague brief instead of blindly generating a page
- ask for designs you like when references would help
- develop distinct visual directions and recommend one
- calibrate how **unconventional, animated, and dense** the design should be
- use a small visual exemplar library to improve hierarchy and avoid common AI-design defaults
- persist the approved visual world so later pages stay coherent
- choose layout, typography, color, media, motion, and interaction systems
- route image, video, 3D, GSAP, Spline, Three.js, Remotion, and HyperFrames work when justified
- build the real project and inspect it in the browser
- run Aigent Taste, Resolve, and Vision before calling substantial work finished
- improve one area without casually redesigning unrelated approved work

You do **not** need to know which Aigent skill to invoke. The installed `aigent-design` skill routes the specialist knowledge internally.

## Example

You have a basic SaaS site and say:

```text
I want this to feel like a premium product launch.
The product automates repetitive office work.
I don't want generic AI SaaS design.
Help me figure out the direction before you build it.
```

Claude can respond like a creative director:

```text
A few things would materially improve the direction:

1. Who is the primary buyer?
2. What existing brand or product UI should I preserve?
3. Show me 2–3 designs you like, if you have them.
4. Should this feel more editorial, cinematic, product-focused, or restrained?
```

Then it can offer alternatives:

```text
A — Editorial Precision
Large typography, restrained motion, strong proof hierarchy.

B — Cinematic Utility
Product demonstrations become the visual spine with richer transitions.

C — Product Confidence
Cleaner application UI, interactive proof, less atmosphere.

I recommend B because this product becomes easier to understand when the automation is shown in motion.
```

You can simply say:

```text
B, but keep the typography from A.
```

Aigent records that direction in `.aigent/design-direction.md`, builds against it, renders the result, reviews it, and iterates.

Later you can speak normally:

```text
The hero still feels generic. Make it bolder.

Calm the animation down a little.

Use these sites as inspiration, but don't copy them.

The mobile version feels cramped.

Polish the whole thing without changing the sections that already work.
```

## How Aigent works

For substantial work the default loop is:

```text
SHAPE → INSPIRE → DIRECT → BUILD → TASTE → RESOLVE → SEE → POLISH
```

Aigent keeps three lightweight creative controls behind the scenes:

```text
VARIANCE  how conventional ↔ unconventional
MOTION    how static ↔ motion-led
DENSITY   how sparse ↔ information-dense
```

It also ships a small visual calibration set for hierarchy, product proof, cinematic coherence, typography, and common generated-design failure modes. Those examples are used as **visual principles, not templates**.

Once you approve a direction, Aigent persists the visual world, typography, palette/material, motion thesis, media strategy, things to preserve, and things to avoid. Scoped edits use a preservation contract so improving the hero does not accidentally redesign the footer.

The first successful render is not considered finished.

## What it can build

- landing pages and product stories
- dashboards, editors, and product interfaces
- immersive sales, sponsorship, and launch decks
- editorial media experiences
- interactive 3D product stages
- video-led and scroll-driven experiences

The templates and exemplars are starting evidence, not a house style. The product, brand, references, and user constraints determine the visual world.

## What is inside

- **Design Intelligence** — layout, typography, motion, interface, and component guidance
- **Inspiration Intelligence** — reference forensics, Design DNA, synthesis, and originality checks
- **Creative Production** — image, video, 3D, motion, asset budgets, fallbacks, and provenance
- **Aigent Taste** — deterministic checks for common AI-design defaults
- **Aigent Resolve** — browser-measured mechanical QA
- **Aigent Vision** — rendered visual critique
- **Publishing** — constrained export and deployment guidance

## Existing or new repo?

Both.

For an existing project, install Aigent in the project root and ask Claude to improve or redesign what is there.

For a new project, create the repo first, install Aigent, and ask Claude to establish the brief and visual direction before implementation.

Local checkouts and cloud development environments both work as long as Claude Code can read and edit the repo.

## Update Aigent

Run the same command again:

```bash
npx github:wrg32786/aigent-design-system install
```

Unchanged Aigent files are left alone. Conflicting project files are not silently overwritten; use `--force` only when you intentionally want to replace installed Aigent files.

## For contributors

```bash
npm install
npm run check
npm run registry
npm run intelligence
npm run inspiration
npm run resolve:check
npm run vision:check
npm run publish:check
npm run eval
```

## License

MIT for Aigent-authored code and documentation. Third-party tools and assets retain their own licenses; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
