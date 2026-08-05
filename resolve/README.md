# AIgent Resolve

AIgent Resolve is the final production loop for a website, deck, or product interface:

```text
RENDER → DETECT → RANK → REPAIR → RERENDER → VISION
```

It combines source audit and rendered browser evidence into a ranked mechanical repair contract. AIgent Vision then requires the agent to inspect annotated captures and record structured aesthetic judgment. Neither layer blindly rewrites arbitrary UI code.

## Start

```bash
npx github:wrg32786/aigent-design-system resolve --init --target .
```

The first run creates `aigent.resolve.json` and adds generated proof paths to `.gitignore`.

For a static project:

```bash
npx github:wrg32786/aigent-design-system resolve --target .
```

For an app that already has a development server:

```bash
npx github:wrg32786/aigent-design-system resolve \
  --target . \
  --url http://127.0.0.1:3000/
```

## Evidence

Resolve checks:

- source-level accessibility, hierarchy, responsive, performance, and taste drift
- desktop, tablet, mobile, and reduced-motion rendering
- runtime and request failures
- horizontal overflow
- 200% text-size overflow
- sampled focus visibility
- control hit areas
- computable text contrast
- clipped required text
- fixed-interface coverage
- missing intrinsic image dimensions

Generated evidence is stored under:

```text
.aigent/resolve/
  latest.json
  latest.md
  runs/<timestamp>/
    report.json
    report.md
    desktop.png
    tablet.png
    mobile.png
    reduced-motion.png
    desktop.annotated.png
    tablet.annotated.png
    mobile.annotated.png
    reduced-motion.annotated.png
    element-map.json
```

## Repair contract

The report ranks the top three failures and records what the agent must preserve:

- product truth from `PRODUCT.md`
- visual authority from `DESIGN.md` or the current rendered product
- the current Inspiration Intelligence plan, when present

The coding agent fixes one coherent root-cause group, reruns Resolve, and compares resolved, introduced, and persistent findings.

## Gate

Default mechanical gate:

```json
{
  "minimumScore": 90,
  "maxErrors": 0,
  "maxWarnings": 5,
  "requireHumanReview": true
}
```

Mechanical passage is not a declaration of taste. Run `aigent-design vision prepare`, inspect every capture, write `.aigent/resolve/latest.visual-review.json`, and run `vision finalize`. Completion requires no open P0/P1 visual finding and a final structured verdict.

## Useful options

```text
--config aigent.resolve.json
--url http://127.0.0.1:3000/
--entry /index.html
--gate 92
--max-warnings 3
--max-actions 3
--no-browser
--no-contrast
--no-fail
--json
```

`--no-fail` is useful when a CI job should always upload the evidence. The report still records whether the gate passed.
