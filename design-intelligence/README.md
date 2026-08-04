# Design Intelligence

This directory is the decision layer behind the AIgent design system.

It does not generate a page by choosing random aesthetics. It converts product truth into a bounded recommendation for:

- surface mode
- layout grammar
- type system
- motion thesis
- media route
- interface system
- optional ready-to-use component sources
- mobile and reduced-motion behavior
- anti-patterns and verification

## Plan a surface

Copy `example-brief.json`, edit it, then run:

```bash
npm run plan -- design-intelligence/example-brief.json
```

The planner writes JSON to stdout by default. Use `--out path/to/plan.json` to save it.

```bash
npm run plan -- my-brief.json --out .aigent/design-plan.json
```

The plan is a starting contract, not an excuse to ignore real content or an established brand. A brief-pinned direction always wins.

## Catalogs

- `layouts.json` — structural page and interface grammars
- `type-systems.json` — freely licensed starting systems with role rules
- `motion-systems.json` — animatics with purpose, cost, and fallback
- `interface-systems.json` — complete product and deck patterns
- `component-sources.json` — external open-source or source-available building blocks
- `brief.schema.json` — machine-readable brief contract

## Rules

1. Choose mode from the surface, not the company.
2. Preserve established visual authority unless the request is a redesign.
3. Generate several viable structures before committing to one.
4. Reject category defaults and their predictable opposites.
5. Use one dominant media and motion idea.
6. Use external components as engineering acceleration, then restyle them into one world.
7. Prefer familiar interaction primitives in product UI.
8. Verify rendered hierarchy, not only source-level compliance.
