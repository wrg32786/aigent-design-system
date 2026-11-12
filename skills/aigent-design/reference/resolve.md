# Resolve

Use `resolve` for the final design-engineering loop.

```text
render → detect → rank → repair → rerender → review
```

Run:

```bash
npx github:wrg32786/aigent-design-system resolve --target . --url <local-url>
```

Then route the repair cycle through `design-resolver`.

Resolve owns:

- deterministic source checks
- desktop, tablet, mobile, zoom, and reduced-motion evidence
- runtime and request failures
- ranked repair actions
- comparison with the previous run
- the mechanical quality gate

Resolve does not own:

- replacing product truth
- choosing a new visual world
- copying a reference
- inventing a human taste score
- blind source-code mutation

## Cover every width the layout changes at

By default Resolve renders 1440, 1024, and 390. Tablet portrait (820 and 768) is where a screen rhythm breaks most often, and a quick run that samples only desktop and phone misses it. For a page with a screen rhythm or a tablet layout of its own, list all five widths in `aigent.resolve.json` at the target root:

```json
{
  "viewports": [
    { "id": "desktop", "width": 1440, "height": 900 },
    { "id": "tablet", "width": 1024, "height": 768 },
    { "id": "tablet-820", "width": 820, "height": 1180 },
    { "id": "tablet-768", "width": 768, "height": 1024 },
    { "id": "mobile", "width": 390, "height": 844 }
  ]
}
```

Keep the id `mobile` on the phone viewport, because the touch-target check runs only on that id. Run the screen-line recipe in `layout.md` at the same widths; Resolve measures overflow and clipping, not blocks that cross a screen line.

A pinned or scroll-linked hero can produce findings that belong to its runway rather than to the sections. To tell them apart, run the same checks on a scratch copy of the page with the hero forced to one plain screen (no pin, no runway). Findings that disappear belong to the hero; the rest belong to the sections.

Preserve `PRODUCT.md`, `DESIGN.md`, the current inspiration plan, and the selected medium. Fix the highest shared cause first and rerun after each coherent repair group.

Mechanical passage is a floor. Route to `reference/vision.md`, inspect every original and annotated capture, and require the structured visual gate before completion.
