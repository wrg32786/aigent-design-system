# Design System

This file records durable visual, media, interaction, and design-intelligence decisions. Product truth lives in `PRODUCT.md`. Route-specific exceptions belong with the page or interface.

## 1. Two visual layers

### Neutral core

The public `ds-*` API provides semantic roles, not a finished identity:

- color roles rather than brand names
- display, body, accent, and data type roles
- restrained surface, rule, spacing, radius, and motion tokens
- small accessible primitives
- native motion modules that publish scroll and viewport state

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

- The first viewport is the identity, offer, artifact, or task.
- One focal point leads each chapter or work region.
- Fixed instrumentation may persist when it communicates progress or state.
- Numbered chapters are allowed when sequence carries meaning.
- Utility surfaces use rules, lists, and direct labels before cards.
- Negative space is structural.

### Material

- Matte dark surfaces and crisp rules are the base.
- Glass is reserved for controls or content over valuable moving media.
- Border and shadow do not both announce the same elevation.
- Pills are compact controls or intentional brand actions, not the default container.

### Motion

- One continuous authored idea carries a marketing or experience surface.
- On `theaigent.xyz`, the idea is descent through a cinematic system.
- On `tools.theaigent.xyz`, motion supports orientation and access.
- Product UI uses fast motion for state and continuity, not page-load theater.
- Reduced motion preserves hierarchy, state, and access.

## 3. Design intelligence before layout code

A new surface begins with a product brief and an inspectable plan.

The planner must resolve:

- visitor mode
- primary reading or task path
- grouping and density
- layout grammar
- type roles and stress tests
- focal motion and supporting motion
- media route
- runtime
- compatible component sources
- mobile behavior
- anti-patterns
- production deliverables
- verification

The recommended direction is not the only option. Every plan also includes a seeded exploration and a conventional fallback. Product truth and user authority can override the plan.

### Layout assessment

Before moving boxes, identify:

- primary and secondary elements under a squint test
- meaningful groups and separation
- tight and generous spacing rhythm
- topology appropriate to content and task
- density appropriate to frequency and complexity
- narrow, intermediate, wide, zoomed, localized, empty, and overflow behavior
- agreement between visual, DOM, keyboard, and assistive-technology order

Use proximity before another container. Use cards only when the content is truly a set of bounded peers.

### Typography assessment

Typography is a role system:

- display
- heading
- body
- label
- metadata
- data or code

Use the fewest families and roles that make hierarchy unmistakable. Keep prose near 45–75 characters. Stress-test long headings, localization, 200% zoom, narrow containers, missing weights, and fallback metrics.

Operate surfaces usually prefer one stable family and a fixed scale. Persuade and Experience surfaces may use a more expressive display voice when the world earns it.

## 4. Media is part of the direction

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

A page usually needs one environment, camera language, material family, grade, and transition logic. Random stock clips, floating objects, and unrelated overlays destroy the world.

## 5. Surface modes

- **Persuade** — the visitor decides and acts.
- **Operate** — the visitor completes a task.
- **Read** — the visitor understands material.
- **Experience** — the artifact or world leads.

A homepage can be Persuade while its dashboard is Operate. A resource directory is Operate + Read. A cinematic sales deck is Persuade + Experience with controlled navigation.

### Operate rules

- familiar interaction is a feature
- one type family is often right
- fixed type roles beat fluid marketing scale
- complete hover, focus, active, disabled, loading, empty, error, and success states
- responsive behavior changes structure rather than merely shrinking it
- 120–250ms routine transitions
- no decorative page-load sequence
- overlays must escape clipping containers

## 6. Component-source discipline

Use mature accessible primitives for standard interaction before inventing replacements.

- choose one visible component language
- prefer headless behavior for interfaces
- install only what the task needs
- restyle external components into the project's type, spacing, surface, icon, and state system
- do not combine multiple libraries' default skins
- record the source and current license
- do not vendor restricted code through the AIgent registry

The product-specific value comes from composition, content, media, interaction, and finish—not another custom button implementation.

## 7. Motion thesis

Before implementation, state:

- focal moment
- continuity relationships
- feedback states
- performance budget

Motion must acknowledge action, explain state or spatial relationship, direct attention at a meaningful moment, or embody the chosen world. A generic fade-and-rise is not a motion thesis.

Typical timing:

- 100–150ms immediate feedback
- 150–300ms routine state change
- 300–500ms layout or view transition
- 500–900ms authored focal sequence

Exit faster than entrance. Avoid bounce and elastic curves by reflex. Pause nonessential loops offscreen and hidden.

## 8. Direction before styling

Before building:

1. Who is here and what success means.
2. What the surface must prove.
3. Which mode owns it.
4. Which physical or cultural scene shapes the world.
5. The category default and anti-references.
6. Palette strategy and type character.
7. Dominant composition.
8. Primary asset system.
9. One signature interaction.
10. Component-source strategy.
11. Mobile and reduced-motion plan.

Use `docs/project-context.md` and the design planner.

## 9. Production quality floor

A result is not ready until:

- the first viewport is clear within seconds
- body contrast reaches WCAG AA
- hierarchy and measure are deliberate
- related items group tightly and chapters separate generously
- motion has one primary idea
- focus, loading, error, empty, and disabled states exist where needed
- real copy works at desktop and mobile widths
- media loading follows use
- video has poster and failure states
- 3D has loading, fallback, bounded pixel ratio, and offscreen pause
- external components feel native to one visual world
- every public asset has a manifest
- rights and attribution are resolved
- no private records or credentials are public
- the page could not be relabeled for an unrelated product
- browser smoke and visual capture complete

Mechanical checks are a floor. Human review decides product clarity, specificity, composition, typography, motion/media, and final coherence.

## 10. Reuse

Extract only after the same intent appears in multiple real surfaces. Reuse existing tokens, modules, patterns, registry items, recipes, and skills before adding another layer.
