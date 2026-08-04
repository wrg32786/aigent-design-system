# Third-Party Notes

This repository is intended to remain open-source safe.

## Included Directly

- AIgent-authored documentation, tokens, templates, modules, scripts, and skills are MIT licensed.
- Demo video assets in `assets/video/` are treated as AIgent-authored or generated demonstration media for this kit. Replace them before client work when a project requires different provenance or a commercial media warranty.
- Runtime showcase dependencies are loaded from public CDNs by example pages:
  - `@splinetool/viewer`
  - `gsap`

## Impeccable

The context-first design workflow, surface-mode vocabulary, anti-reference discipline, bounded visual QA, and the idea of deterministic frontend taste checks were informed by:

- **Project:** `pbakaus/impeccable`
- **License:** Apache License 2.0
- **Source:** https://github.com/pbakaus/impeccable

No Impeccable source files, detector implementation, command framework, or skill text are vendored in this repository. The AIgent files are original implementations specialized for cinematic websites and the production lessons from `theaigent.xyz` and `tools.theaigent.xyz`.

Users who want Impeccable's full command and detector system should install it from the original project.

## Reference-Only Material

The local `3d-scroll-website-skill-pack.zip` was inspected as inspiration for workflow shape, but its files are not vendored. The skills here are rewritten around original design rules, Spline and GSAP experience-page patterns, and mobile QA lessons.

The source stack listed in `docs/source-stack-intake.md` is treated the same way: links and lessons are recorded, but third-party code, templates, and skill files are not copied unless their licenses are reviewed first.

The local Awwwards animation archive is also reference-only. The public repository may include an AIgent-authored index of effect categories and intended uses, but it must not include the original archive, nested code zips, or extracted preview media unless redistribution rights are explicitly cleared.

Before adding outside skills, templates, images, fonts, frame sequences, or code directly:

1. Verify the license permits the intended redistribution and commercial use.
2. Preserve required notices and attribution.
3. Confirm generated assets are cleared for reuse.
4. Remove API keys, tracking IDs, private URLs, customer data, and internal comments.
5. Record the source and exact material included here.

## Spline Scenes

The example templates use Spline's documented web embed pattern through `<spline-viewer>`.

For public production use, replace placeholder scene URLs with a scene you own, have permission to embed, or exported yourself. A `prod.spline.design` URL is not automatically redistribution-safe merely because it loads.
