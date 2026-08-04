# Layout

Layout turns product priority into reading order, grouping, rhythm, density, and usable space.

## Inspect before moving boxes

Assess separately:

1. **Rendered hierarchy**
   - Squint: what reads first, second, and as major groups?
   - Are containers compensating for weak proximity?
   - Is spacing rhythmic or monotonous?
   - Does topology match the content and task?
   - What changes at narrow, intermediate, wide, zoomed, and localized states?
2. **Mechanical structure**
   - overflow, sticky ancestors, stacking, focus order, container behavior
   - arbitrary spacing and widths
   - long content, empty states, overlays, safe areas, touch targets

A clean scanner result cannot prove hierarchy.

## Set the spatial thesis

Name:

- primary reading or task path
- lead and supporting regions
- what belongs together and what must separate
- intended density
- spacing rhythm
- structural adaptation by viewport and container

Use the simplest structural model that expresses those relationships.

## Apply

- Use proximity before containers.
- Use deliberate contrast between tight group spacing and generous chapter spacing.
- Prefer a 4-unit base scale with named semantic roles.
- Let product priority, not framework defaults, define hierarchy.
- Use grid for two-dimensional relationships and flex for one-dimensional flow.
- Make responsive behavior structural: reorder, collapse, reveal, or change mode.
- Keep DOM and focus order aligned with visual order.
- Use cards only when items are independent, repeatable units.
- Do not place every section inside the same centered container.
- Use asymmetry only when it strengthens the selected world and reading path.
- Keep mobile controls reachable and content-first.

## Verify

- Squint test passes at desktop and mobile.
- Primary path remains obvious with long real copy.
- Grouping survives the removal of borders and background panels.
- Density matches task frequency and complexity.
- Localization, 200% zoom, empty states, and sticky elements do not break the surface.
