# Creative Production

This directory closes the gap between a visual direction and the media a cinematic website actually needs.

The complete workflow is:

```text
DIRECT
PRODUCT.md + DESIGN.md + a page brief

PRODUCE
source, generate, model, animate, render, edit

OPTIMIZE
encode video, compress GLB, create posters and mobile fallbacks

BUILD
CSS, GSAP, Spline, Three.js, model-viewer, HyperFrames or Remotion outputs

VERIFY
provenance, budgets, accessibility, browser QA
```

The repository does not bundle a giant creative stack. The neutral site core stays dependency-free. Production tools and runtimes are opt-in and selected by the page requirement.

## Start with the medium decision

Use the lightest medium that carries the idea:

| Requirement | Preferred route |
| --- | --- |
| Atmospheric depth behind copy | Still image, CSS treatment, or short video loop |
| Controlled cinematic progression | Encoded video or frame sequence |
| Existing website or HTML interface → video | HyperFrames render |
| React/data-driven programmatic video | Remotion render |
| Simple interactive product rotation | `model-viewer` |
| Fast visually-authored 3D | Spline |
| Live geometry, shaders, lighting, or manipulation | Three.js |
| Complex offline scene, lighting, or photoreal output | Blender render |
| Interactive 2D state animation | Rive |

A video is not automatically better than a still. A live 3D runtime is not automatically better than a render. The correct asset is the smallest reliable system that makes the page's dominant visual idea possible.

HyperFrames and Remotion are build-time alternatives, not required browser dependencies. HyperFrames is the default when the durable source is HTML or an existing website. Remotion remains useful when typed React compositions and its rendering ecosystem already own the production system.

## What is here

```text
creative-production/
  catalog.json                 machine-readable source and tool catalog
  briefs/                      copyable asset briefs
  sources/                     curated acquisition and generation guides
  pipelines/                   production workflows
  standards/                   budgets, provenance, encoding, fallbacks

assets/
  manifests/                   provenance and output records
  source/                      ignored local working files
  web/                         optimized public delivery assets

integrations/
  catalog.json                 optional runtime and authoring integrations
  */README.md                  when to use, install, and avoid each tool

recipes/
  */README.md                  end-to-end website production recipes

skills/
  cinematic-studio/            routes the whole production system
  creative-asset-director/     chooses and briefs the asset route
  video-asset-pipeline/        produces web video outputs
  web-3d-asset-pipeline/       produces optimized GLB assets
  hyperframes-video/           turns websites and HTML systems into video
  ...                          runtime, choreography, QA, and provenance skills
```

## Resource catalog

`catalog.json` is designed for both humans and agents. Each resource records:

- category and production route
- free, freemium, subscription, paid, or local cost tier
- license clarity
- current commercial-use posture
- attribution expectations
- web-readiness
- use cases and cautions
- the date it was last checked
- official source, license, and pricing pages

Run:

```bash
npm run catalogs
```

The catalog is guidance, not legal advice. Marketplace item licenses and generation-plan terms always override the summary.

## Asset briefs

Use a brief before opening a generation or modeling tool:

- `briefs/hero-video.md`
- `briefs/interactive-3d-object.md`
- `briefs/cinematic-scene.md`
- `briefs/scroll-frame-sequence.md`

The brief should define the page job, camera, focal point, text-safe area, duration, loop behavior, output variants, and what would make the asset unusable. A vague asset brief produces expensive randomness.

## Production paths

- `sources/3d-assets.md` — free, paid, and generated 3D routes
- `sources/video-and-vfx.md` — stock, VFX, audio, and subscription sources
- `sources/ai-generation.md` — hosted and local AI generation with license cautions
- `pipelines/video-assets.md` — acquisition through web encoding
- `pipelines/web-3d-assets.md` — model through optimized GLB
- `pipelines/blender.md` — Blender render or export decisions
- `pipelines/hyperframes.md` — website and HTML-native video production
- `pipelines/remotion.md` — React-driven programmatic media rendering
- `pipelines/runtime-selection.md` — browser integration decision
- `standards/asset-budgets.md` — starting performance ceilings
- `standards/provenance.md` — source and license record
- `standards/mobile-fallbacks.md` — deliberate fallback design

## Required checks

Every production asset should have:

1. A source or generation record.
2. A verified commercial-use status.
3. A web-ready output.
4. A poster or static fallback where applicable.
5. A mobile strategy.
6. A manifest under `assets/manifests/`.
7. A browser check on the actual page.

Run:

```bash
npm run assets
npm run audit -- path/to/page path/to/shared.css
npm run smoke
```

Do not commit credentials, private generation URLs, customer assets, receipts containing personal data, or proprietary source files. Record a safe reference path in the manifest instead.
