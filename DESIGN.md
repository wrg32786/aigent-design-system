# Design System

This file records durable visual, media, and interaction decisions. Product truth lives in `PRODUCT.md`. Route-specific exceptions belong with the page.

## 1. Two visual layers

### Neutral core

The public `ds-*` API provides semantic roles, not a finished identity:

- color roles rather than brand names
- display, body, accent, and data type roles
- restrained surface, rule, spacing, radius, and motion tokens
- small accessible primitives
- motion modules that publish scroll and viewport state

The neutral starter demonstrates craft without becoming a second house style.

### The AIgent preset

The AIgent identity remains an included theme and compatibility layer. It is an established world, not the default answer for outside projects.

## 2. The AIgent visual world

**Creative north star:** an editorial command center at night.

It combines a late-night operations room, an independent technology publication, and a cinematic control deck.

### Color

- Green-black ground, never flat neutral black.
- Warm cream text.
- Cyan signals active state, direction, proof, and system status.
- Amber adds warmth, caution, or editorial counterpoint.
- Glow belongs to emitted light or active instrumentation.

### Typography

- Condensed or tightly composed grotesk display type carries identity and scale.
- Body uses a readable workhorse sans.
- Mono is reserved for status, measurements, labels, code, and instrumentation.
- Serif contrast is deliberate, never an automatic premium move.
- Tracking does not go tighter than `-0.04em`.

### Composition

- The first viewport is the identity, offer, or artifact.
- One focal point leads each chapter.
- Fixed instrumentation may persist when it communicates progress or state.
- Numbered chapters are allowed when sequence carries meaning.
- Utility surfaces use rules and lists before cards.
- Negative space is structural.

### Material

- Matte dark surfaces and crisp rules are the base.
- Glass is reserved for controls or content over valuable moving media.
- Border and shadow do not both announce the same elevation.
- Pills are compact controls or intentional brand actions, not the default container.

### Motion

- One continuous authored idea carries a page.
- On `theaigent.xyz`, the idea is descent through a cinematic system.
- On `tools.theaigent.xyz`, motion supports orientation and access.
- Supporting reveals remain subordinate.
- Reduced motion preserves hierarchy, state, and access.

## 3. Media is part of the direction

A cinematic page needs one dominant asset system, not a collection of effects.

Define:

- medium
- subject
- physical material
- camera
- focal point
- motion
- text-safe region
- start and end state
- loop, scrub, interaction, or still behavior
- desktop and mobile composition
- reduced-motion state
- loading and failure state

### Medium ladder

Use the lightest route that carries the idea:

1. still
2. CSS motion
3. encoded video
4. frame sequence
5. model-viewer
6. Spline
7. Three.js
8. custom renderer

Offline Blender or Remotion rendering is often preferable to live 3D when the camera is fixed and art direction matters more than manipulation.

### Asset coherence

A page usually needs one family:

- one environment
- one camera language
- one material family
- one grade
- one transition logic

Random stock clips, floating objects, and unrelated overlays destroy the world.

## 4. Surface modes

- **Persuade** — the visitor decides and acts.
- **Operate** — the visitor completes a task.
- **Read** — the visitor understands material.
- **Experience** — the artifact or world leads.

A homepage can be Persuade while its dashboard is Operate. A resource directory is Operate + Read.

## 5. Direction before styling

Before building:

1. Who is here and what success means.
2. What the page must prove.
3. Which mode owns the surface.
4. Which physical or cultural scene shapes the design.
5. The category default and anti-references.
6. Palette strategy and type character.
7. Dominant composition.
8. Primary asset system.
9. One signature interaction.
10. Mobile and reduced-motion plan.

Use `docs/project-context.md`.

## 6. Production quality floor

A result is not ready until:

- first viewport is clear within seconds
- body contrast reaches WCAG AA
- hierarchy and measure are deliberate
- related items group tightly and chapters separate generously
- motion has one primary idea
- focus, loading, error, empty, and disabled states exist where needed
- real copy works at desktop and mobile widths
- media loading follows use
- video has poster and failure states
- 3D has loading, fallback, bounded pixel ratio, and offscreen pause
- every public asset has a manifest
- rights and attribution are resolved
- no private records or credentials are public
- the page could not be relabeled for an unrelated product

Run the repository checks and inspect the actual browser result.

## 7. Reuse

Extract only after the same intent appears in multiple real pages. Reuse existing tokens, modules, recipes, and skills before adding another layer.
