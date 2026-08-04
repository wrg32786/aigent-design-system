# Source Stack Intake

This repository converts outside references into original, reusable design rules and production assets. It does not become a pile of copied templates or skill files.

## Added References

- `greensock/GSAP` — production animation engine for text reveals, card choreography, and scroll timelines.
- `petekp/tw-fade` — scroll-edge fade ideas for horizontal navigation and overflow rails.
- `rdev/liquid-glass-react` — reference for refraction, edge highlights, elastic glass behavior, and higher-quality transparent surfaces.
- `freshtechbro/claudedesignskills / gsap-scrolltrigger` — scrubbed timelines, pinned moments, and reveal timing.
- `davila7/claude-code-templates / scroll-experience` — treating a page as a scene sequence rather than stacked blocks.
- `alirezarezvani/claude-skills / epic-design` — pressure against generic generated UI.
- `freshtechbro/claudedesignskills / motion-framer` — motion language, sequencing, and interaction feel.
- `davila7/claude-code-templates / 3d-web-experience` — scene planning, camera beats, and 3D web structure.
- `mcpmarket / scroll-animation-studio` — reference category for scroll-animation production.
- `openai/skills / figma-implement-design` — design-to-code fidelity checks.
- `figma/mcp-server-guide` — wiring Figma MCP into the design and build loop.
- `mrdoob/three.js` — native 3D scenes when Spline or rendered media is insufficient.
- `theatre-js/theatre` — timeline thinking and cinematic scene direction.
- `cloudai-x/threejs-skills` — agent-readable Three.js workflows.
- `Fasani/three-js-resources` — examples, assets, and technical references.
- `anthropics/frontend-design skill` — practical frontend polish and non-generic design guidance.
- `pbakaus/impeccable` — product/design context files, surface modes, anti-references, purposeful restraint, bounded verification, and deterministic detector thinking.
- `zarazhangrui/frontend-slides` — slide-grade composition and presentation patterns.
- `leonxlnx/taste-skill` — an explicit taste check against generic generated output.
- `nextlevelbuilder/ui-ux-pro-max-skill` — UI and UX polish prompts.
- `VoltAgent/awesome-claude-design` — design-workflow reference index.

## Impeccable Intake

Useful lessons adopted in original form:

1. Product truth and durable visual decisions belong in separate context files.
2. The surface mode—Persuade, Operate, Read, or Experience—should determine hierarchy.
3. Anti-references are as useful as positive references.
4. A visual system must include type, composition, material, state, motion, and responsive behavior, not only colors.
5. Common generated-design tells can be checked deterministically before visual review.
6. Verification should happen in bounded desktop/mobile passes rather than endless polishing loops.
7. Established visual authority in production pages should be preserved during refinement.

Implementation in this repository:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/project-context.md`
- `docs/design-principles.md`
- `skills/cinematic-web-director/SKILL.md`
- `scripts/design-audit.mjs`

The wording and code are AIgent-authored. The original project is credited in `THIRD_PARTY.md`.

## How A Reference Becomes An Asset

1. Save the source in this file.
2. Record the transferable lesson in plain language.
3. Confirm it fits the real production pages or a known user need.
4. Implement the smallest original token, module, template section, skill rule, or audit check that captures it.
5. Test the result in a real page.
6. Do not extract a generic abstraction until the same intent appears in at least two pages.
7. Review the license before including any outside file directly.

## Production Visual Authority

The primary reference pages are:

- `https://theaigent.xyz` — cinematic narrative descent, fixed instrumentation, editorial display type, and chapter-based motion.
- `https://tools.theaigent.xyz` — the same identity adapted to a dense operator library with direct wayfinding and restrained interaction.

These pages establish The AIgent preset. They do not determine the palette or composition of the neutral starter.

## Video Scrub Assets

The free design-stack showcase currently uses:

- `assets/video/design-stack-01-cave.mp4`
- `assets/video/design-stack-02-ink.mp4`
- `assets/video/design-stack-03-drone.mp4`
- `assets/video/design-stack-03-fracture.mp4`
- `assets/video/design-stack-dust.mp4`

The page maps scroll progress to `video.currentTime` and uses the dust layer across the full sequence. Smooth scrubbing requires short MP4 files with frequent keyframes or all-intra encoding. Fix the media encoding before hiding seek problems in the scroll code.
