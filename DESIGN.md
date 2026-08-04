# Design System

This file records the durable visual and interaction decisions for the repository itself. Product truth lives in `PRODUCT.md`. Route-specific exceptions belong in the template or page they affect.

## 1. Two layers, one repository

### Neutral core

The public `ds-*` API is brand-neutral. It provides semantic roles, not a finished identity:

- color roles rather than brand color names
- display, body, accent, and mono font roles
- restrained surface, rule, spacing, radius, and motion tokens
- small primitives for containers, controls, status text, lists, and panels
- motion modules that publish scroll and viewport state through CSS variables

The neutral starter must demonstrate craft without becoming a second house style. Its default world is architectural print and layered material—not “AI neon.”

### The AIgent preset

The AIgent identity remains an included theme and a compatibility layer. It is an established world, not the default answer for outside projects.

## 2. The AIgent visual world

**Creative north star:** an editorial command center at night.

The world combines a late-night operations room, an independent technology publication, and a cinematic control deck. It should feel built by operators rather than sold by a SaaS template.

### Color

- Green-black ground, never flat neutral black.
- Warm cream text rather than cold white.
- Cyan is a signal: active state, direction, proof, and system status.
- Amber is secondary: warmth, caution, or an editorial counterpoint.
- Glow is sparse and tied to emitted light or active instrumentation.

### Typography

- Condensed or tightly composed grotesk display type carries identity and scale.
- Body copy uses a readable workhorse sans.
- Mono is reserved for status, measurements, labels, code, and instrumentation.
- A serif accent is allowed only when it creates a deliberate editorial contrast; it is never the automatic “premium” move.
- Headings should remain legible with real copy at every breakpoint. Tracking should not go tighter than `-0.04em`.

### Composition

- The first viewport is the identity or artifact, not a stack of marketing cards.
- One dominant focal point leads each chapter.
- Fixed instrumentation may persist across a narrative page when it communicates progress or state.
- Numbered chapters are permitted when the visitor is moving through an actual sequence.
- Dense utility surfaces use rules, lists, and direct labels before they use cards.
- Negative space is structural. It is not an empty region waiting for another widget.

### Material

- Matte dark surfaces and crisp rules are the base.
- Glass is reserved for controls or content that must remain readable over valuable moving media.
- Borders and shadows should not both announce the same elevation.
- Pills are for compact controls and status chips. Primary page actions may use them inside the AIgent world, but neutral primitives default to smaller radii.

### Motion

- One continuous authored motion idea should carry a page.
- On `theaigent.xyz`, that idea is descent through a cinematic system.
- On `tools.theaigent.xyz`, motion supports orientation and access without slowing utility.
- Reveals are subordinate to the main scene. Avoid an identical fade-up on every block.
- Use transforms, opacity, clip paths, masks, light, and material changes only when they preserve smoothness.
- Reduced motion must preserve hierarchy, state, and access to all content.

## 3. Surface modes

Choose the mode from the surface, not from the company:

- **Persuade** — the visitor decides and acts. The offer, proof, and primary action must read immediately.
- **Operate** — the visitor completes a task. Scanability, state, and familiar controls outrank spectacle.
- **Read** — the visitor understands material. Structure, measure, rhythm, and wayfinding lead.
- **Experience** — the artifact or world is the product. Interface chrome recedes and the work leads from the first viewport.

A marketing page for a tool is still Persuade. A resource directory is Operate + Read. A cinematic portfolio is Experience.

## 4. Direction before styling

Before building a new surface, record:

1. Who is here and what success means.
2. What the page must prove with real content or assets.
3. Which mode owns the surface.
4. The physical or cultural scene that should shape the design.
5. The category default and the visual habits this project refuses.
6. The palette strategy, type character, composition, material, and one signature interaction.

Use `docs/project-context.md` as the short template.

## 5. Quality floor

A result is not ready until the built page passes these checks:

- **Clarity:** the first viewport explains the offer, artifact, or task within seconds.
- **Contrast:** body text reaches WCAG AA; secondary text is tinted from the surface or foreground, not arbitrary gray.
- **Hierarchy:** type, spacing, and composition create an obvious reading order.
- **Measure:** long body copy stays near 65–75 characters per line.
- **Spacing:** related items sit together; sections receive visibly larger separation.
- **Motion:** the page has one signature motion and restrained supporting transitions.
- **States:** focus, hover, disabled, loading, error, and empty states exist where the product needs them.
- **Responsive:** real copy and real controls work at desktop and mobile widths without overflow.
- **Integrity:** the page expresses this product and could not be relabeled for an unrelated one without obvious mismatch.

Run `npm run audit -- <path>` and inspect the page in a real browser before publishing.

## 6. Reuse rules

Extract a token, primitive, or module only after the same intent appears in at least two real pages. Reuse existing helpers before adding another one. Preserve established page behavior when refining; replace a visual world only when the task is explicitly a redesign.
