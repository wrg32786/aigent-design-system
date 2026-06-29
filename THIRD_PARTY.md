# Third-Party Notes

This repo is intended to be open-source safe.

## Included Directly

- AIgent-authored docs, tokens, templates, and skills are MIT licensed.
- Demo video assets in `assets/video/` are treated as AIgent-authored/generated demonstration media for this kit. Replace them before client work if your project requires a different asset provenance or commercial media warranty.
- Runtime template dependencies are loaded from public CDNs by example pages:
  - `@splinetool/viewer`
  - `gsap`

## Not Vendored

The local `3d-scroll-website-skill-pack.zip` was inspected as inspiration for workflow shape, but its files are not vendored into this repo. The AIgent skills here are rewritten around our own design rules, Spline/GSAP experience-page pattern, and mobile QA lessons.

The source stack listed in `docs/source-stack-intake.md` is treated the same way: links and lessons are recorded, but third-party code, templates, and skill files are not copied into this repo unless their licenses are reviewed first.

Before adding outside skill packs, templates, images, fonts, or frame sequences directly to this repo, verify:

1. License permits commercial and open-source redistribution.
2. Attribution requirements are satisfied.
3. Generated assets are cleared for reuse.
4. No API keys, tracking IDs, private URLs, or customer data are present.

## Spline Scenes

The example templates use Spline's documented web embed pattern through `<spline-viewer>`. Spline's docs describe Viewer exports as code snippets that can be pasted into a web builder and used as a native HTML component.

For public production use, replace placeholder scene URLs with a Spline scene you own, have permission to embed, or have exported yourself. Do not assume that any random `prod.spline.design` URL found online is redistribution-safe just because it loads.
