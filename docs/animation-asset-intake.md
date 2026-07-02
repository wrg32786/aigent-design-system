# Animation Asset Intake

Use this note when reviewing local animation packs, Awwwards-style references, or frontend templates before turning them into AIgent-authored patterns.

## Current Local Packs

Local files inspected:

- `C:/Users/will/Downloads/Awwwards Pack-20260629T194044Z-3-003.zip`
- `C:/Users/will/Downloads/Animmaster Vite Template.zip`

These files are source references. Do not vendor them directly into this repo unless the license and redistribution rights are clear.

## Awwwards Pack

Observed structure:

- `Scroll Animation` - largest category, best source for pinned scenes, scrub timing, section reveals, and high-end movement references.
- `Webgl _ ThreeJS Effects` - useful for shader, distortion, particle, image-plane, and WebGL interaction ideas.
- `Page Transitions` - useful for blinds, curtains, masks, route reveals, and scene-to-scene choreography.
- `Text Animations` - useful for character reveals, blur-to-sharp, kinetic masks, and editorial headline motion.
- `Sliders` - useful for carousel physics, drag feel, and project-card movement.
- `Grid Animations` - useful for asset galleries and resource pages.
- `3D Animation` - useful for camera movement and object staging references.

Recommended workflow:

1. Extract only one small candidate folder at a time into a temp workspace.
2. Run it locally if it includes source code.
3. Record what the effect teaches in plain English.
4. Rebuild the useful part as AIgent-authored code in a template or skill.
5. Add a screenshot or short note, not the original third-party source, unless license review permits it.

Best fits for this repo:

- Text reveal variants for `templates/free-design-stack`.
- Transition variants for the pinned video scrub page.
- Gallery/card entrance effects for `templates/asset-scroll-gallery`.
- WebGL distortion references for a future Three.js template.

Deck effects adapted as AIgent-authored patterns:

- Block wipe for hero-to-deck transitions. Use dark charcoal/steel tones when the hero loop is black/grey, and overlap rows by 1px to avoid hairline gaps.
- Side reveal for deck copy. Text should enter from the side closest to its layout anchor, not default bottom-up on every slide.
- Fact migration for sticky header metrics. Facts pin only after their large source slide leaves, and migrate from source element to header pill.
- Word fall for the second-to-last slide before a final CTA, used as a release/lock-in moment rather than a generic text reveal.

See `docs/cinematic-scroll-deck-playbook.md` for the production rules learned while implementing these effects in a live video-scrub deck.

## Animmaster Vite Template

Reference docs:

- `https://animmaster.github.io/docs/presentation.html`
- `https://animmaster.github.io/docs/install.html`
- `https://animmaster.github.io/docs/settings.html`

The template is more useful as a production-pipeline reference than as an effects library.

Notable ideas worth adapting:

- Video optimization pipeline with MP4/WebM outputs, audio stripping, and size variants.
- Responsive image generation and HTML attribute rewriting.
- SVG sprite/iconfont generation.
- Local font download workflow.
- Auto-connected JS modules.
- Component and page generators.
- Dev navigation panel.
- Zip/export and GitHub publishing scripts.

Recommended AIgent adaptations:

- Add a script that re-encodes scrub videos for smoother `currentTime` seeking.
- Add a script that creates desktop/mobile screenshots for each template.
- Add an optional project manifest for templates, assets, and source credits.
- Add reusable docs for publishing static pages to `tools.theaigent.xyz`.

Avoid copying wholesale:

- PHP/WordPress/mail components.
- FTP config.
- Generic form components unless a template needs them.
- Any licensed/premium source code.

## Intake Template

When evaluating a candidate effect, capture:

```md
## Candidate

- Source:
- Local path:
- Category:
- License status:
- What it does:
- Why it is useful:
- What to rebuild:
- What to avoid:
- Target AIgent artifact:
- QA notes:
```

## Rule

References teach taste. AIgent ships owned implementations.
