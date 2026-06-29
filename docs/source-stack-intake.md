# Source Stack Intake

This repo is the AIgent free design stack: a public, copyable layer for building premium AI-generated web experiences.

## Added References

- `greensock/GSAP` - use as the production animation engine for text reveals, card choreography, and scroll timelines.
- `petekp/tw-fade` - use for scroll-edge fade ideas on horizontal navs, overflow rails, and long resource lists.
- `rdev/liquid-glass-react` - use as a reference for frosted refraction, edge highlights, elastic glass behavior, and higher-quality glass surfaces.
- `freshtechbro/claudedesignskills / gsap-scrolltrigger` - use for scrubbed scroll timelines, pinned moments, and reveal timing.
- `davila7/claude-code-templates / scroll-experience` - use for treating a page as a scene sequence, not stacked blocks.
- `alirezarezvani/claude-skills / epic-design` - use as a reminder to push past generic AI UI.
- `freshtechbro/claudedesignskills / motion-framer` - use for motion language, sequencing, and interaction feel.
- `davila7/claude-code-templates / 3d-web-experience` - use for scene planning, camera beats, and 3D web structure.
- `mcpmarket / scroll-animation-studio` - use as a reference category for scroll animation production.
- `openai/skills / figma-implement-design` - use for design-to-code fidelity checks.
- `figma/mcp-server-guide` - use when wiring Figma MCP into the design/build loop.
- `mrdoob/three.js` - use for native 3D web scenes when Spline or video is not enough.
- `theatre-js/theatre` - use as a reference for timeline thinking and cinematic scene direction.
- `cloudai-x/threejs-skills` - use as reference material for agent-readable Three.js workflows.
- `Fasani/three-js-resources` - use as a source index for examples, assets, and inspiration.
- `anthropics/frontend-design skill` - use for frontend polish rules and practical AI design guidance.
- `pbakaus/impeccable` - use as a design language reference for higher-quality AI interfaces.
- `zarazhangrui/frontend-slides` - use for slide-grade composition and presentation patterns.
- `leonxlnx/taste-skill` - use as an explicit taste check against generic AI output.
- `nextlevelbuilder/ui-ux-pro-max-skill` - use for UI/UX polish prompts.
- `VoltAgent/awesome-claude-design` - use as a reference list for Claude design workflows.

## How These Become Assets

Every outside skill or design reference should enter through this path:

1. Save the source link in this file.
2. Record what it teaches in plain English.
3. Convert that lesson into an AIgent rule, prompt, template section, or QA check.
4. Do not vendor third-party files unless the license clearly allows redistribution.
5. Add only AIgent-authored output to `templates/`, `skills/`, and `docs/`.

## Current Product Page

The free front-door page is:

`templates/free-design-stack/index.html`

It showcases the stack as a product rather than a documentation page. It uses a video-scrub background slot, GSAP letter and line reveals, borderless fog glass cards, and linked source assets. The page should stay fast, static, and easy for an agent to inspect.

## Video Scrub Slots

The free design stack page currently uses a multi-scene scrub sequence:

- `assets/video/design-stack-01-cave.mp4`
- `assets/video/design-stack-02-ink.mp4`
- `assets/video/design-stack-03-drone.mp4`
- `assets/video/design-stack-03-fracture.mp4`
- `assets/video/design-stack-dust.mp4`

The page loads each scene video, pauses it, and maps scroll progress to `video.currentTime`. The dust layer sits above the full page with `mix-blend-mode: screen`.

For smooth scrubbing, export short MP4 files with frequent keyframes or all-keyframe encoding. If a video feels choppy, re-encode it before changing the scroll code.

Current transition pattern:

1. Horizontal blinds reveal.
2. Crossfade.
3. Two-panel vertical reveal.
