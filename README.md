# Aigent

**Turn Claude Code into a professional design team for your repo.**

Aigent installs a design operating system into an existing project. Claude stays the interface. You describe what you want in normal language; Aigent gives Claude the design judgment, specialist skills, production routes, browser QA, and visual-review loop to build it well.

No separate Aigent app. No new IDE. No Aigent account.

## Install

Open a terminal in the repo you want to design and run:

```bash
npx github:wrg32786/aigent-design-system install
```

Then start Claude Code in that repo:

```bash
claude
```

And talk normally:

```text
Use Aigent to help me redesign this site.
```

That is the normal workflow.

## What changes after install?

Claude can use Aigent as a design team rather than only as a coding assistant.

It can:

- understand the product, audience, content, and desired outcome
- ask for references or examples when they would materially improve the direction
- develop multiple visual directions before committing to a large redesign
- synthesize inspiration without copying source sites
- choose layout, typography, color, media, motion, and interaction systems
- build websites, product interfaces, dashboards, decks, and immersive experiences
- route image, video, 3D, GSAP, Spline, Three.js, Remotion, and HyperFrames work when justified
- catch common AI-design defaults with Aigent Taste
- inspect the real browser with Aigent Resolve
- review rendered screenshots with Aigent Vision
- repair the highest-value problems and polish before calling the work finished

You do **not** need to know which Aigent skill to invoke. The installed `aigent-design` skill is the router; Claude selects the specialist knowledge it needs from your request.

## Example

Imagine you have a basic SaaS site in a repo.

You install Aigent, open Claude Code, and say:

```text
I want to turn this into a premium launch site.
The product helps small businesses automate repetitive office work.
I want it to feel sophisticated and useful, not like generic AI SaaS.
Help me figure out the design before you build it.
```

Aigent should help steer the process. For example, Claude can ask:

```text
A few things would materially improve the direction:

1. Who is the primary buyer?
2. Do you already have brand colors, type, or assets I should preserve?
3. Show me 2–3 sites whose design you like, if you have them.
4. Should this feel more editorial, cinematic, product-focused, or understated?
```

Then it can propose distinct directions:

```text
Direction A — Editorial Precision
Large typography, restrained motion, strong proof hierarchy.

Direction B — Cinematic Utility
Full-bleed product moments, richer transitions, more immersive storytelling.

Direction C — Product Confidence
Cleaner application UI, interactive demonstrations, less decoration.

I recommend B because the product benefits from showing automation in motion.
```

You can answer normally:

```text
Go with B, but keep the typography from A.
```

Claude builds the real project, renders it, checks it, and iterates.

Then refinement is conversational:

```text
The hero still feels generic. Make it bolder.

Use these three sites as inspiration, but do not copy them.

The mobile version feels cramped.

Add one memorable interaction without making the site noisy.

Run the full Aigent review and polish whatever still feels amateur.
```

## How Aigent thinks

For substantial work, the default loop is:

```text
SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → TASTE → RESOLVE → SEE → POLISH
```

**Shape** understands the product and goal.  
**Inspire** studies useful references.  
**Synthesize** creates an original direction.  
**Produce** chooses or creates the right media.  
**Build** implements the real project.  
**Taste** catches common generated-design smells.  
**Resolve** measures the actual browser.  
**See** reviews rendered screenshots.  
**Polish** fixes the most important remaining issues.

The first successful render is not considered finished.

## What it can build

Aigent includes systems and examples for:

- cinematic landing pages and product stories
- immersive sales, sponsorship, and launch decks
- dashboards, editors, command centers, and product interfaces
- interactive 3D product stages
- pinned video narratives
- Spline and GSAP experiences
- editorial media and asset galleries

The templates are starting points, not a house style. The product, brand, references, and user constraints should determine the visual world.

## What is inside

The main `aigent-design` skill routes to the systems it needs, including:

- **Design Intelligence** — layout, typography, motion, interface, and component guidance
- **Inspiration Intelligence** — reference forensics, Design DNA, synthesis, and originality checks
- **Creative Production** — image, video, 3D, motion, asset budgets, fallbacks, and provenance
- **Aigent Taste** — deterministic checks for common AI-design defaults
- **Aigent Resolve** — browser-measured mechanical QA
- **Aigent Vision** — rendered visual critique
- **Publishing** — constrained export and deployment guidance

Advanced users can still invoke specialist commands directly, but normal users should not need to.

## Existing project or new project?

Both.

For an existing repo, install Aigent in the project root and ask Claude to redesign or improve the existing implementation.

For a new project, create or clone the repo first, install Aigent, then ask Claude to establish the product brief and visual direction before implementation.

This works equally well in a local checkout or a cloud development environment as long as Claude Code can read and edit the repo.

## Update Aigent

Run the same install command again:

```bash
npx github:wrg32786/aigent-design-system install
```

Unchanged files are left alone. Aigent will not silently overwrite conflicting project files; use `--force` only when you intentionally want to replace installed Aigent files.

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

## Principles

1. The user's product truth and constraints outrank generic taste advice.
2. Design before decorating.
3. Explore meaningful alternatives before large greenfield commitments.
4. Use references as evidence, not templates.
5. Mobile is recomposed, not merely shrunk.
6. Advanced media must earn its complexity.
7. The browser is ground truth.
8. First render is not final.
9. Fix root causes rather than stacking patches.
10. Keep Aigent inside the coding workflow the user already has.

## License

MIT for Aigent-authored code and documentation. Third-party tools and assets retain their own licenses; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
