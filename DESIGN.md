# Design System

This file records durable visual, media, interaction, design-intelligence, and inspiration-synthesis decisions. Product truth lives in `PRODUCT.md`. Route-specific exceptions belong with the page or interface.

## 1. Two visual layers

### Neutral core

The public `ds-*` API provides semantic roles, not a finished identity:

- color roles rather than brand names
- display, body, accent, and data type roles
- restrained surface, rule, spacing, radius, and motion tokens
- small accessible primitives
- native motion modules that publish scroll and viewport state

### The AIgent preset

The AIgent identity remains an included theme and compatibility layer. It is an established world, not the default answer for outside projects.

## 2. The AIgent visual world

**Creative north star:** an editorial command center at night.

- Green-black ground, warm cream text, cyan active signal, amber counterpoint.
- Condensed or tightly composed display, readable workhorse body, mono only for instrumentation.
- Matte surfaces and crisp rules before decorative glass.
- One focal point leads each chapter or work region.
- Motion supports a continuous authored idea on experience surfaces and state continuity on product UI.

## 3. Design intelligence before layout code

A new surface begins with product truth and an inspectable plan. Resolve:

- visitor mode and primary path
- grouping, density, and layout grammar
- type roles and stress tests
- focal and supporting motion
- media route and runtime
- component-source strategy
- mobile behavior
- anti-patterns
- production deliverables
- verification

Use proximity before another container. Use cards only for genuinely bounded peers. Typography is a role system, not a list of fashionable fonts.

## 4. Inspiration before synthesis

A reference is evidence, not a specification.

### Capture

Prefer a live URL because it can reveal DOM order, geometry, computed styles, responsive behavior, interactions, media, animation timing, and failure states. Screenshot and motion references require lower confidence unless a visual model or reviewer supplies an annotation.

Store local captures under `.aigent/inspiration`. Do not commit third-party screenshots, private pages, authenticated flows, extracted copy, or source packages.

### Normalize

Every reference becomes Design DNA across:

```text
structure
 typography
 material
 motion
 interaction
 media
```

Keep measurements separate from interpretation and record confidence by dimension.

### Synthesize

Whole-surface work uses at least three references. No source controls more than two dimensions.

Each reference-matrix assignment must include:

- extracted principle
- target-product reason
- required transformation
- excluded source expression

The result must replace source copy, assets, marks, section order, exact type pairing, exact animation sequence, and source code.

### Audit

After implementation, compare target Design DNA against every reference. Review source dominance, copy overlap, weak transformations, original asset production, mobile composition, and reduced motion. Similarity scores are review heuristics, not legal conclusions.

## 5. Media is part of the direction

A cinematic page needs one dominant asset system, not a collection of effects. Define medium, subject, material, camera, focal point, motion, text-safe region, start/end state, desktop/mobile composition, reduced-motion state, loading, and failure.

Use the lightest route that carries the idea:

1. still
2. CSS motion
3. encoded video
4. frame sequence
5. model-viewer
6. Spline
7. Three.js
8. custom renderer

Offline Blender or Remotion rendering is often preferable when the camera is fixed and art direction matters more than manipulation.

## 6. Surface modes

- **Persuade** — the visitor decides and acts.
- **Operate** — the visitor completes a task.
- **Read** — the visitor understands material.
- **Experience** — the artifact or world leads.

Marketing composition must not become the default for operator UI. Operate surfaces favor familiar behavior, complete states, stable density, and 120–250ms routine transitions.

## 7. Component-source discipline

Use mature accessible primitives for standard interaction before inventing replacements.

- choose one visible component language
- install only what the task needs
- restyle external behavior into the project’s type, spacing, surface, icon, and state system
- do not combine multiple libraries’ default skins
- record the source and current license
- do not vendor restricted code through the registry

## 8. Motion thesis

Before implementation, state focal moment, continuity relationships, feedback states, and performance budget.

Motion must acknowledge action, explain state or spatial relationship, direct attention, or embody the chosen world. A generic fade-and-rise is not a thesis.

Typical timing:

- 100–150ms immediate feedback
- 150–300ms routine state change
- 300–500ms layout or view transition
- 500–900ms authored focal sequence

Pause nonessential loops offscreen and hidden. Reduced motion preserves hierarchy and meaning.

## 9. Direction before styling

Before building:

1. Who is here and what success means.
2. What the surface must prove.
3. Which mode owns it.
4. Which physical or cultural scene shapes the world.
5. Which references inform each dimension.
6. What must be transformed and excluded.
7. Palette strategy and type character.
8. Dominant composition and primary asset system.
9. One signature interaction.
10. Component-source strategy.
11. Mobile and reduced-motion plan.

## 10. Production quality floor

A result is not ready until:

- first viewport is clear within seconds
- body contrast reaches WCAG AA
- hierarchy, measure, and grouping are deliberate
- motion has one primary idea
- focus, loading, error, empty, disabled, and failure states exist where needed
- media loading follows use
- video and 3D have complete fallbacks
- external components feel native to one world
- every public asset has a manifest
- inspiration influence and transformations are recorded
- source dominance and copy overlap are reviewed
- no private records or credentials are public
- the page could not be relabeled for an unrelated product
- browser smoke and visual capture complete

Mechanical checks are a floor. Human review decides product clarity, specificity, composition, typography, motion/media, originality, and final coherence.

## 11. Reuse

Extract only after the same intent appears in multiple real surfaces. Reuse existing tokens, modules, patterns, registry items, recipes, and skills before adding another layer.
