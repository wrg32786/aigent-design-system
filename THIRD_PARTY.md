# Third-Party Notes

This repo is intended to be open-source safe.

## Included Directly

- AIgent-authored docs, tokens, templates, and skills are MIT licensed.
- Runtime template dependencies are loaded from public CDNs by example pages:
  - `@splinetool/viewer`
  - `gsap`

## Not Vendored

The local `3d-scroll-website-skill-pack.zip` was inspected as inspiration for workflow shape, but its files are not vendored into this repo. The AIgent skills here are rewritten around our own design rules, Spline/GSAP experience-page pattern, and mobile QA lessons.

Before adding outside skill packs, templates, images, fonts, or frame sequences directly to this repo, verify:

1. License permits commercial and open-source redistribution.
2. Attribution requirements are satisfied.
3. Generated assets are cleared for reuse.
4. No API keys, tracking IDs, private URLs, or customer data are present.

## Spline Scenes

The example templates use a public Spline scene URL as a placeholder. Replace it with a scene you own before shipping a production site.
