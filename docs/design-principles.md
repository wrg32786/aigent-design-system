# Design Principles

## Begin with product truth

Read `PRODUCT.md`, `DESIGN.md`, the target page, and one representative source of the existing visual system before editing. A missing design document does not erase a coherent identity already present in code or production pages.

## Choose the surface mode

- **Persuade:** make the offer, proof, and action immediately legible.
- **Operate:** prioritize task completion, state, and familiar controls.
- **Read:** prioritize structure, line length, rhythm, and wayfinding.
- **Experience:** let the artifact or world lead from the first viewport.

The mode determines the hierarchy. The company category does not.

## Build an own-world page

A strong direction comes from the audience and subject, not from the default look of its category. Define a concrete visual world, the category rut, and the anti-references before choosing colors.

A palette swap is not a new direction. Type, composition, material, navigation, motion, and responsive behavior must agree.

## Show the proof

The page itself should demonstrate the quality it claims. Use real product behavior, real media, real copy, or honestly labeled illustrative material. Do not invent customers, benchmarks, prices, or capabilities.

## Use the lightest renderer that carries the idea

- CSS for graphic or abstract depth.
- Spline for a fast interactive 3D scene.
- Video scrub for controlled photoreal direction.
- Frame sequences for exact playback and mobile consistency.
- Three.js or WebGL only when live geometry, lighting, or manipulation matters.

The renderer is a scene implementation, not the page architecture.

## Motion has a job

Choose one authored motion idea for the page. Supporting reveals should stay quiet. Motion may reveal, orient, compare, explain state, or reward; it should not exist because every section needs an entrance.

Keep the default state readable, honor `prefers-reduced-motion`, and avoid bounce or elastic easing unless the product’s physical behavior genuinely calls for it.

## Refuse the common generated tells

Unless the brief specifically earns them:

- no identical icon-heading-text card grid as the page scaffold
- no nested cards
- no repeated eyebrow above every heading
- no gradient text
- no glass used as generic decoration
- no pure neutral black ground when a tinted dark belongs to the world
- no mono used merely to signal “technical”
- no random floating 3D object
- no glow without an emitted-light or active-state reason
- no section numbers unless the sequence itself matters

## Treat typography as structure

Use a display face with a point of view on Persuade and Experience surfaces. Use workhorse faces where operating or reading speed matters. Maintain clear scale and weight steps, keep body copy near 65–75 characters per line, and test real copy at every breakpoint.

## Use fewer surfaces

Prefer rules, spacing, lists, and composition before adding another card. A border and shadow should not both explain the same elevation. Pills are for compact controls; they are not the default shape for every object.

## Verify the built result

Check desktop and mobile together, fix the whole batch, then confirm once. Verify:

- first-viewport clarity
- WCAG AA contrast
- keyboard focus and semantic controls
- touch targets
- real-copy overflow
- horizontal overflow
- reduced-motion completeness
- media loading and seek behavior
- one coherent product-specific visual system

Run:

```bash
npm run audit -- <path>
npm run smoke
```
