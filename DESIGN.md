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

## 4. Inspiration before synthesis

A reference is evidence, not an implementation specification.

### Capture

Prefer a live URL when it is public and authorized because it can reveal:

- DOM and reading order
- layout geometry
- computed visual roles
- fixed and sticky regions
- responsive changes
- interaction states
- media and runtime hints
- animation timing and keyframes
- loading, network, and browser errors

A screenshot cannot prove hidden states, breakpoints, exact fonts, DOM order, accessibility, or animation timing. A motion clip cannot prove interaction semantics, responsive behavior, or source implementation. Record confidence by dimension instead of filling gaps with invented certainty.

Store local captures under `.aigent/inspiration`. Do not commit third-party screenshots, authenticated pages, private records, extracted source copy, or downloaded source packages.

### Normalize

Every reference becomes Design DNA across six dimensions:

```text
structure
typography
material
motion
interaction
media
```

Keep deterministic measurements separate from interpretation. Preserve source identity, capture date, evidence paths, confidence, and a copy fingerprint rather than copied content.

### Synthesize

Whole-surface work uses at least three references. No source controls more than two dimensions.

Every reference-matrix assignment records:

- source
- extracted principle
- target-product reason
- required transformation
- excluded source expression
- mapped AIgent patterns
- mobile and reduced-motion implications

The result must replace:

- source copy and claims
- photographs, video, 3D assets, audio, icons, logos, and marks
- exact section order
- exact typography pairing and scale
- exact animation timing, keyframes, camera path, and transition sequence
- source HTML, CSS, JavaScript, shaders, and private implementation

The target must make sense without knowing the references.

### Influence ledger

Every reference-driven project records:

- which source influenced each dimension
- which source elements were explicitly excluded
- transformations planned and implemented
- original asset and copy ownership
- audit status

The ledger is a design and governance record, not a claim of legal clearance.

### Originality review

After implementation, compare target Design DNA against every reference. Review:

- source dominance
- copy overlap
- structural similarity
- palette and typography convergence
- repeated animation logic
- reused source assets or marks
- whether each required transformation was actually implemented
- whether mobile and reduced motion are original and product-appropriate

Similarity scores are review heuristics, not legal conclusions. Rights-sensitive work still requires appropriate human and legal review.

## 5. Media is part of the direction

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

## 6. Surface modes

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

## 7. Component-source discipline

Use mature accessible primitives for standard interaction before inventing replacements.

- choose one visible component language
- prefer headless behavior for interfaces
- install only what the task needs
- restyle external components into the project's type, spacing, surface, icon, and state system
- do not combine multiple libraries' default skins
- record the source and current license
- do not vendor restricted code through the AIgent registry

The product-specific value comes from composition, content, media, interaction, and finish—not another custom button implementation.

## 8. Motion thesis

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

## 9. Direction before styling

Before building:

1. Who is here and what success means.
2. What the surface must prove.
3. Which mode owns it.
4. Which physical or cultural scene shapes the world.
5. The category default and anti-references.
6. Which references inform each dimension.
7. What must be transformed and excluded.
8. Palette strategy and type character.
9. Dominant composition.
10. Primary asset system.
11. One signature interaction.
12. Component-source strategy.
13. Mobile and reduced-motion plan.

Use `docs/project-context.md`, Design Forensics, the reference matrix, and the design planner.

## 10. Production quality floor

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
- inspiration influence and transformations are recorded
- source dominance and copy overlap are reviewed
- no private records, captures, or credentials are public
- the page could not be relabeled for an unrelated product
- the result does not depend on recognizing its references
- browser smoke and visual capture complete
- the Resolve gate passes and its top-ranked findings are cleared or explicitly reviewed
- every required original and annotated capture has a structured Vision review
- no open P0/P1 visual finding remains

Mechanical checks are a floor. Human review decides product clarity, specificity, composition, typography, motion/media, originality, and final coherence.

## 11. Resolve before completion

The final loop is:

```text
render → detect → rank → repair → rerender → review
```

Resolve must read product truth, visual authority, and the current inspiration plan before ranking changes. It checks desktop, tablet, mobile, 200% text sizing, reduced motion, runtime failures, focus, hit areas, contrast, overflow, clipping, fixed chrome, and media stability.

Repair one coherent root-cause group at a time. Fix shared primitives before instances. Do not flatten a distinctive composition, remove meaningful motion, hide overflow, or change the visual world merely to silence a detector.

Mechanical passage requires the configured score, error, and warning limits. Completion still requires explicit review of product clarity, specificity, composition, typography, motion/media, originality, and finish.

## 12. See the rendered result

AIgent Vision must open both original and annotated desktop, tablet, mobile, and reduced-motion captures. The numbered overlay is evidence, not decoration: every visual finding should point to `E###` elements when the issue has an identifiable rendered owner.

Review product clarity, hierarchy, composition, typography, color/material, motion/media, interaction, product specificity, originality, responsive quality, trust/usability, and finish. Do not replace this with a hidden taste score or infer it from DOM metrics.

A valid finding states the visible relationship, evidence, priority, repair, confidence, and preservation contract. Merge mechanical and visual findings, then repair the highest shared cause. Completion requires no open P0/P1 visual finding and a final verdict of `pass` or `pass-with-notes`.

## 13. Reuse

Extract only after the same intent appears in multiple real surfaces. Reuse existing tokens, modules, patterns, registry items, recipes, and skills before adding another layer. Keep inspiration evidence local unless the source and redistribution rights are explicitly clear.

## Studio interface

Studio is an Operate surface. The live preview is the dominant region; the brief and agent room are supporting rails. Controls stay dense, explicit, and keyboard reachable. The UI must not impersonate a canvas editor: it exposes real project state, real agent output, and real browser preview. Mobile stacks the brief, preview, and agent room rather than shrinking three desktop columns.

## Studio Canvas design contract

- The preview is the real website, not a design-only scene graph.
- Selection overlays live outside the iframe and never ship with the project.
- Every direct edit records a structured, reversible operation.
- Responsive changes explicitly target base, tablet, or mobile.
- Design tokens and shared components outrank arbitrary values.
- Element comments remain unresolved authority until addressed or resolved.
- Multi-user presence provides context; it does not overwrite product or design authority.
- Distillation fixes the shared source owner instead of copying runtime overrides into production.
- Resolve establishes the mechanical floor; Vision judges the rendered result.

## Desktop setup design contract

The installer and first-run wizard are calm Operate surfaces, not marketing pages. One decision owns each step: workspace, system check, agent, preferences, launch. The interface exposes the actual local state, never fabricates successful installation, keeps credentials out of browser forms, and makes repair and diagnostics first-class. Windows and macOS installer artwork uses the AIgent visual language without reducing setup clarity or native platform expectations.

## Ship panel design contract

Ship is a calm final-stage Operate surface. It shows one gate, one provider decision, one channel decision, one optional domain, and explicit completion checks. Deployment history must expose the real URL, provider, commit, QA result, and exact-artifact redeploy without presenting hosting complexity as visual decoration. A blocked Canvas journal is visible before the publish button, not after an avoidable failure.
