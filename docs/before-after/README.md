# Before and after

Fictional brief for the README visuals: a fiberglass repair yard called Saltglass Marine. Facts and direction are in `brief.md`.

- `stock-ai.html` is a typical unguided-agent landing page (purple gradient, Inter, emoji cards, invented proof).
- `aigent.html` is the same brief built with the Aigent tokens, paper theme, and Taste rules. `npx ... taste docs/before-after/aigent.html` reports 0 warnings. The stock page reports 12.
- `direction.html` and `taste.html` are the README section diagrams.
- `before.html` / `after.html` are the older token-layer demo: identical markup, with and without `tokens/system.css`.

Regenerate the WebP captures from the repo root:

```bash
node scripts/capture-readme-visuals.mjs
```

That script needs Playwright Chromium (`node node_modules/playwright/cli.js install chromium`).
