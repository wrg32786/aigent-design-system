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

Preserve `PRODUCT.md`, `DESIGN.md`, the current inspiration plan, and the selected medium. Fix the highest shared cause first and rerun after each coherent repair group.
