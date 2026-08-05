# AIgent Vision

AIgent Vision is the visual-judgment layer that sits after mechanical Resolve.

```text
RENDER → MEASURE → CAPTURE → SEE → CRITIQUE → RANK → REPAIR → RERENDER → COMPARE
```

Resolve proves browser behavior. Vision requires the operating agent, a human reviewer, or an optional vision-model adapter to actually open the rendered images and record an evidence-backed critique.

## Why it exists

A page can have zero runtime errors, no overflow, accessible focus, and correct reduced motion while still feeling generic, badly balanced, visually noisy, weakly branded, or unfinished. Those are not DOM facts. They require rendered judgment.

AIgent Vision does not invent a mysterious taste score. It produces inspectable findings across twelve dimensions:

1. Product clarity
2. Hierarchy
3. Composition
4. Typography
5. Color and material
6. Motion and media
7. Interaction
8. Product specificity
9. Originality
10. Responsive quality
11. Trust and usability
12. Finish

## Workflow

Run mechanical Resolve first:

```bash
npx github:wrg32786/aigent-design-system resolve \
  --target . \
  --url http://127.0.0.1:3000/
```

Prepare visual evidence:

```bash
npx github:wrg32786/aigent-design-system vision prepare --target .
```

Vision creates:

```text
.aigent/resolve/
  latest.visual-review-task.json
  latest.visual-review.template.json
  latest.visual-review.prompt.md

  runs/<resolve-run-id>/
    desktop.annotated.png
    tablet.annotated.png
    mobile.annotated.png
    reduced-motion.annotated.png
    element-map.json
    visual-review-task.json
```

The original Resolve screenshots remain beside the annotated versions. The operating agent must open both versions for every required viewport. Numbered overlays map visual observations back to stable selectors and computed styles in `element-map.json`.

Copy the template to:

```text
.aigent/resolve/latest.visual-review.json
```

Fill every viewport and every dimension, then validate:

```bash
npx github:wrg32786/aigent-design-system vision check \
  --target . \
  --review .aigent/resolve/latest.visual-review.json
```

Merge the critique with Resolve:

```bash
npx github:wrg32786/aigent-design-system vision finalize \
  --target . \
  --review .aigent/resolve/latest.visual-review.json
```

The combined report is written to:

```text
.aigent/resolve/latest.combined.json
.aigent/resolve/latest.combined.md
```

## Completion gate

Completion requires all of the following:

- mechanical Resolve passes;
- every required original and annotated capture was actually opened;
- every critique dimension has a concrete rationale;
- no open P0 or P1 visual finding remains;
- the final verdict is `pass` or `pass-with-notes`;
- the result still preserves product truth, selected visual direction, inspiration transformations, accessibility, and performance.

A host that cannot inspect images must not mark the review complete. Use a human or an explicit `vlm-adapter` reviewer instead.

## Finding quality

Bad:

> The mobile page feels crowded.

Good:

```json
{
  "id": "mobile-theme-control-dominance",
  "viewport": "mobile",
  "severity": "P1",
  "dimension": "composition",
  "finding": "The theme controls compete with the product statement in the first viewport.",
  "evidence": "E003 occupies most of the upper third before E011 establishes the primary hierarchy.",
  "recommendation": "Collapse the mobile theme choices behind one compact accessible control.",
  "elementIds": ["E003", "E011"],
  "suspectedOwner": ".ds-theme-picker",
  "preserve": ["theme switching", "keyboard access", "the selected visual identity"],
  "confidence": 0.94,
  "status": "open"
}
```

## Severity

- **P0:** broken, unsafe, deceptive, or unusable surface.
- **P1:** ship-blocking visual or product problem.
- **P2:** meaningful polish that materially improves the experience.
- **P3:** optional refinement.

## Privacy

Generated screenshots, element maps, and reviews live under `.aigent/resolve/`, which is ignored by default. Do not commit private applications, reference captures, customer data, or authenticated states.
