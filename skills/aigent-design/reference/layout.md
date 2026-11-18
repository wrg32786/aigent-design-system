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
- A one-screen hero whose group has fixed caps (a headline size, an object size in px) leaves the rest of a tall window empty once the caps bind. Centre the group in the screen, or let the caps grow with the window's height: one hero with every size capped, at `min-height: 100svh`, left 33 percent of a 2560 x 1440 screen and 44 percent of a 1024 x 1366 one as flat ground under the group.
- A pinned section is a whole number of screens too. A pin 6.5 screens tall puts every later section off the screen grid; make it 7 and set the hold inside its six screens of pinned travel (the story over 4.5, the finished frame held for the last 1.5), so the motion ends well before the pin releases. Work the hold out before review: it is the block's height less one screen, times the share of the run left after the motion ends. One 520svh block whose count ended at 86 percent of the run held its finished frame for 0.59 of a screen, one or two wheel flicks; at 610svh, with the count over 70 percent, it held 1.53 screens.

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
- A picture's small-screen treatment uses the same breakpoint as the layout change it serves. One hero stacked to a single column at 859px while its film's phone rule stopped at 760px, so from 761 to 859 the desktop film ran at full strength under a full-width text column and the sentence over it read 3.49:1. When a layout query moves, search for every other query that depends on the same condition.
- Inside a capped, centred container, size from the container, never from `100vw`. A horizontal run whose frames were sized from the window grew past the content edge above 1320px and cut the product names at both ends of the run at 1920. Use `min(100cqw, <cap>)` in the formula, on the size container the full-bleed rule above sets up, or make each frame `flex: 0 0 100%` of the content box, and set the gap between frames to at least the page's side margin so no neighbour shows when the run rests. That holds for a held stage's giant word, its object and the pieces that part from it: placed as shares of a full-width sticky (`left: 34%`, a centre at 0.67 of the window's width), one giant word slid under the capped text column from about 1740px wide, and step text sat on its olive letters at 2.0:1. Take both edges from the container's own box in script, and shoot 1920 and 2560 before review.
- A window-wide canvas inside a capped stage needs a resize trigger of its own. One page laid its canvas out again only when the stage changed size, and above the cap (about 1455px wide) a width-only resize changes no stage, so the canvas kept its old backing size and stretched: resized from 1536 to 1920 wide, its `width` stayed 1536 while its CSS width was 1920, and at 2400 the drawing crossed a heading. Size such a layer in script from the stage's own width (no viewport-width literal), lay it out again on the window's own resize, and read `canvas.width` against its CSS width at 1536, 1920 and 2400.
- When script and CSS both branch on a layout mode, decide it once in script and mark the root with a class the CSS reads. A media query on the window and a script test on a canvas 144px shorter than the window disagreed whenever the width fell between the two heights, and two copies of one blade showed at once (900 x 1000, 960 x 1000, 1280 x 1340). Where a query and a script test must both stand, give them the same bounds: a shade switched on width alone while the script also tested the shape, so 844 x 390 and 880 x 720 got the upright shade with the wide layout.
- A box placed absolutely inside a grid is positioned against its grid area when it has one, and the grid's own box only when it has none. A pane that kept its area from a shared rule sat too low until it was given `grid-area: auto`. Read the box's top after placing anything absolutely inside a grid.
- An item wider than its grid area can stay held to the area's start edge. In one phone column a 470px film sat against the left edge of its narrower area, ran past the window's right edge, and cut the bag it showed. Centre it with `justify-self: unsafe center` or a negative margin, and measure its left and right edges.
- Negative margins on either side of an empty block collapse into one. A 4px overlap set as `margin-top: -4px` on a sheet's lower piece collapsed through an empty join (height 0, `margin-top: -64px`) into a single -64px margin, so the two pieces met with no overlap and a grey hairline showed along the join. A flex column stops the collapse; measure the two boxes.
- Anything drawn between two pictures takes its size from them, as a share of their width. A stream of beans sized in fixed px came out two to three times the size of the beans in the picture it left on a phone (about 15px there, 33 to 45px in the stream), and it no longer read as coming from that picture.
- `max-width: 100%` on a grid item resolves against its grid area. In a grid with an implicit `auto` column the track grows to fit the item, so the cap does nothing: a 280px dial overflowed a 157px column. Declare the track as `minmax(0, 1fr)`.
- An override inside a media query comes after the base rule it overrides. At equal specificity the later rule wins, whatever the query says: a sideways-phone block written mid-sheet hid the fixed bar in the source and showed it in the browser, because the bar's base rule sat further down.
- A sticky panel gives up its picture before its button leaves the window. Set the picture's height from the window (`clamp(180px, calc(100svh - <header and the rest of the panel>), 380px)`), and check at 650 and 768px tall that the panel's last control is inside the window while the panel holds.

## Verify

- Squint test passes at desktop and mobile.
- Primary path remains obvious with long real copy.
- Grouping survives the removal of borders and background panels.
- Density matches task frequency and complexity.
- Localization, 200% zoom, empty states, and sticky elements do not break the surface.
