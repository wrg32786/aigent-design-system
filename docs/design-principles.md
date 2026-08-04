# Design Principles

## Build the experience first

The first screen is the offer, artifact, task, or world. Do not lead with generic marketing scaffolding when the user asked for a tool, gallery, product, or experience.

## Product truth before styling

Read the product and design context. Determine the surface mode, proof, primary action, constraints, and anti-references before choosing a palette or library.

## One visual world

A strong page uses one coherent family of:

- material
- camera
- lighting
- type
- spatial composition
- media
- transitions

Do not combine unrelated stock clips, 3D objects, overlays, and effects merely because they are available.

## Use media as structure

Video and 3D should establish place, reveal state, compare, orient, or reward. They are not decorative proof that the site is modern.

Prefer the lightest medium that carries the idea:

```text
still → CSS → video → sequence → model-viewer → Spline → Three.js
```

Offline rendering often beats live 3D when the camera is fixed.

## Keep language human

Use short lines and product language. Translate jargon when the audience does not already use it. Controls name the action. Errors name the problem and recovery.

## Composition over card count

Use fewer, stronger regions. Lists, rules, direct labels, and negative space are often better than identical cards. Never nest cards.

## Motion rules

- one signature motion idea per page
- supporting motion stays subordinate
- reveal content while it is readable
- reverse travel restores state
- mobile does not inherit desktop timing blindly
- no autoplay audio
- reduced motion preserves hierarchy and access
- motion libraries do not justify motion

## Media production rules

- brief the asset before sourcing or generating
- record source and rights
- edit generated output
- create desktop and mobile compositions
- create poster and reduced-motion states
- optimize for the selected runtime
- load assets near use
- keep source masters outside Git

## Typography

- clear scale and weight hierarchy
- readable body measure
- actual copy tested at every breakpoint
- mono reserved for code, data, status, and measurement
- display tracking no tighter than `-0.04em`
- no automatic italic serif as a premium shortcut

## Material and depth

- one elevation signal: border or shadow
- glass only over media worth seeing
- glow only when light or active state earns it
- small radii for neutral systems
- pills for compact controls or an intentional brand decision

## Mobile

Mobile is a composition:

- focal point survives the crop
- asset variant fits the device
- controls remain reachable
- text remains readable
- 3D has a bounded fallback
- video does not block first content
- no horizontal page overflow

## Verification

Screenshots and browser behavior decide. Run catalogs, asset checks, design audit, and smoke tests. Inspect desktop, mobile, reduced motion, keyboard, slow loading, and media failure.
