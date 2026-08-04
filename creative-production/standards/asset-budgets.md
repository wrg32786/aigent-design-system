# Asset Budgets

These are starting warnings, not universal laws. A page may exceed one when the visual value is real and the override is recorded.

| Role | Starting warning |
| --- | ---: |
| Hero poster | 350 KB |
| Desktop ambient hero video | 8 MB |
| Mobile ambient hero video | 4 MB |
| Initial interactive GLB | 5 MB |
| Mobile interactive GLB | 2.5 MB |
| Individual texture | 2 MB |
| Full initial frame sequence | 20 MB |
| Individual sequence frame | 250 KB |
| Optional audio loop | 1.5 MB |

## Loading budget

The first viewport should request only what it needs:

1. HTML and critical CSS.
2. Fonts or a strong fallback.
3. Poster or first visual.
4. First interactive or video asset.
5. Later chapters near their transition.

A 5 MB asset loaded after intent is different from a 5 MB asset blocking the first meaningful view.

## Override rule

When an output exceeds its warning, add `budgetOverrideReason` to the manifest. Good reasons are specific:

```text
The 6.1 MB desktop GLB is the product configurator itself.
A 2.4 MB mobile poster would be wasteful, so mobile receives a 210 KB still.
```

“Looks better” is not enough. Record what the extra bytes preserve.

## Measure the page

Asset size is only one cost. Inspect:

- total initial requests
- decoding and GPU work
- layout shifts
- memory on mobile
- long tasks
- interaction delay
- whether the asset remains loaded after it is useful
