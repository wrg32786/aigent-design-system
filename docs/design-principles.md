# Design Principles

## Build the experience first

The first screen is the offer, artifact, task, or world. Do not lead with generic marketing scaffolding when the user asked for a tool, gallery, product, deck, or experience.

## Product truth before styling

Read the product and design context. Determine the surface mode, proof, primary action, content ranges, constraints, and anti-references before choosing a palette, component source, or animation library.

## Structure before decoration

Use the squint test to identify what reads first, second, and as a group. Use proximity before another container. Use tight spacing inside a thought and generous spacing between thoughts.

Choose a topology from the job:

- narrative sequence
- guided deck
- evidence spine
- product theatre
- editorial dossier
- spatial gallery
- operator command center
- split workspace
- dense vault
- data observatory
- progressive workflow
- object inspection

A three-column card grid is one valid structure, not the default answer.

## One visual world

A strong surface uses one coherent family of:

- material
- palette
- type
- camera
- lighting
- spatial composition
- media
- transitions
- controls and state

Do not combine unrelated stock clips, 3D objects, component-library skins, overlays, and effects merely because they are available.

## Use mature behavior, author the identity

Use accessible headless primitives and established utilities for dialogs, menus, popovers, forms, tables, virtualization, and placement. Install only what the task needs.

Then make the result one system:

- one typography vocabulary
- one spacing rhythm
- one surface and elevation model
- one icon language
- one state vocabulary
- one motion thesis

External components accelerate behavior. They do not choose composition or art direction.

## Use media as structure

Video and 3D should establish place, reveal state, compare, orient, inspect, or reward. They are not decorative proof that the site is modern.

Prefer the lightest medium that carries the idea:

```text
still → CSS → video → sequence → model-viewer → Spline → Three.js
```

Offline rendering often beats live 3D when the camera is fixed.

## Keep language human

Use product language. Controls name the action. Errors name the problem and recovery. Do not repeat the same promise in the heading, subhead, cards, and CTA.

## Typography is a role system

Define only the roles the surface needs:

- display
- heading
- body
- label and control
- metadata
- data or code

Keep prose near 45–75 characters. Test real long headings, localization, 200% zoom, narrow containers, missing weights, and fallback metrics. Operate surfaces often need one stable family and a fixed scale; marketing surfaces can earn a more expressive display voice.

## One motion thesis

Write:

- focal moment
- continuity relationships
- feedback states
- performance budget

Supporting motion stays subordinate. Reveal content while it is readable. Reverse travel restores state. Mobile does not inherit desktop timing blindly. No autoplay audio. Reduced motion preserves hierarchy and access. The presence of GSAP or Three.js does not justify an effect.

## Product UI disappears into the task

Operate surfaces prioritize familiar interaction, complete states, stable density, and fast feedback.

- no theatrical page-load sequence
- no display type in controls or data
- no custom affordance where a standard one is clearer
- loading, empty, error, disabled, selected, and success states are designed
- overlays escape clipping ancestors
- routine transitions stay around 120–250ms

The impressive moment in a product interface may be instant search, fluid state continuity, or a table that never hesitates—not a particle field.

## Media production is part of design

- brief the asset before sourcing or generating
- record source and rights
- edit generated output
- create desktop and mobile compositions
- create poster and reduced-motion states
- optimize for the selected runtime
- load assets near use
- keep source masters outside Git

## Material and depth

- use one elevation signal: border or shadow
- use glass only over media worth seeing
- use glow only when light or active state earns it
- use small radii for neutral systems
- use pills for compact controls or an intentional brand decision
- use texture only from the chosen world

## Mobile is a composition

- focal point survives the crop
- asset variant fits the device
- controls remain reachable
- text remains readable
- navigation changes structure when needed
- 3D has a bounded fallback
- video does not block first content
- no horizontal page overflow

## Verification

Mechanical checks are a floor. Screenshots and browser behavior decide.

Run catalog, asset, intelligence, registry, eval, design-audit, smoke, and capture checks. Inspect desktop, intermediate width, mobile, 200% zoom, reduced motion, keyboard, slow loading, empty content, long content, media failure, and real product states.
