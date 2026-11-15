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

## Screen rhythm

Some pages are built in whole screens, with each section exactly one or two viewports tall. Scroll stories and one-idea-per-screen pages often work this way. When the direction chooses that rhythm, hold it at every rhythm width: 1440, 820, 768, and 390 wide.

- A section is 1 or 2 screens at each of those widths. Anything in between is a defect.
- A two-screen section is two groups. The second group starts one top padding below the screen line, and nothing crosses the line. A photograph, card, form, or paragraph split across two screens is a defect, even when a checker passes.
- On phones shorter than the rhythm height (a 360 x 640 screen, or any phone held sideways), a section may grow past its screens to hold its content. Nothing may overlap. Say so in the handoff instead of shrinking type to force the fit.
- Reach whole screens through the composition, never by stretching the section. Content centred in a section stretched to two screens leaves an empty band above and below it, worst on phones. Fit the chapter to one screen, or give the second screen a group of its own.
- A pinned section is a whole number of screens too. A pin 6.5 screens tall puts every later section off the screen grid; make it 7 and set the hold inside its six screens of pinned travel (the story over 4.5, the finished frame held for the last 1.5), so the motion ends well before the pin releases.

Common checkers measure section height, not crossings. Run this in the browser console at each rhythm width. Each row is one block in a section of two or more screens, with its top and bottom measured from the screen line (negative is above). It returns the blocks that cross.

```js
(() => {
  const vh = innerHeight, rows = [];
  for (const s of document.querySelectorAll("main > section")) {
    const top = s.getBoundingClientRect().top + scrollY, screens = s.offsetHeight / vh;
    for (let k = 1; k < Math.round(screens); k++) {
      const line = top + k * vh;
      for (const el of s.querySelectorAll("h2, h3, p, li, img, video, figure, form, blockquote")) {
        const r = el.getBoundingClientRect();
        if (!r.height) continue;
        const above = Math.round(r.top + scrollY - line), below = Math.round(r.bottom + scrollY - line);
        rows.push({ section: s.id, screens: +screens.toFixed(2), block: el.tagName.toLowerCase(), top: above, bottom: below, crosses: above < 0 && below > 0 });
      }
    }
  }
  console.table(rows);
  return rows.filter((row) => row.crosses);
})();
```

Add your own block selectors if the page uses others. The smallest non-negative `top` should equal the section's top padding, and `screens` should be a whole number.

## Overrides and edges

- A phone override uses the same selector as the rule it overrides. A more specific base rule wins without a warning: one item kept `grid-column: 1 / span 6` on phones, the grid grew five implicit columns of zero width, and their gaps took 120px of a 324px row. After an override, read the computed `grid-template-columns` at phone width.
- A phone held sideways is still a phone. A breakpoint on width alone gives an 844 x 390 screen the desktop nav, which then covers the headline on load, so key the phone layout to `(orientation: landscape) and (max-height: 500px)` as well. Check what a stage draws there, not only what overlaps: one fit-to-gap scale went negative and drew the signature 9px tall while the overlap probe passed.
- Fixed and absolute elements (the nav, a pinned panel, a progress meter, the footer) line up with the container's edges, with scripting on and off: one page had three different left edges at 1920. To run a layer full-bleed from inside a capped, centred container, make the full-width ancestor a size container (`container-type: inline-size`), set the layer to `left: calc(50% - 50cqw); width: 100cqw`, and declare `left: 0; width: 100%` before it for browsers without container units; `100vw` includes the scrollbar and scrolls the page sideways. Fit a 3D or transformed subject against the capped text column and its largest extent over the whole animation, not against the full-bleed box.
- Queries that split a range must not both match at the boundary. The `min-` and `max-` forms are both inclusive, so `(max-aspect-ratio: 3/2)` and `(min-aspect-ratio: 3/2)` both applied at 900 x 600; write one side as a range (`(aspect-ratio < 3/2)`), and allow for a classic 17px scrollbar, which media queries count and the layout does not.
- Size a box whose content swaps (a caption per phase, a row that lights up, a readout that changes) for its tallest state at every width, or stack the states in one grid cell (`grid-area: 1 / 1`) so the box takes the tallest: one row measured once at 156px grew to 175px and covered the pins docked beneath it. Re-measure anything placed from a measured box, such as leader lines and dock targets, on every resize and state change, with no size threshold; a 2px threshold skipped a breakpoint that moved rows by 64px. (The 120px allowance in `scroll.md` is only for rebuilding a pin's length on touch devices.)

## Verify

- Squint test passes at desktop and mobile.
- Primary path remains obvious with long real copy.
- Grouping survives the removal of borders and background panels.
- Density matches task frequency and complexity.
- Localization, 200% zoom, empty states, and sticky elements do not break the surface.
