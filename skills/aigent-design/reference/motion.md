# Motion

Motion explains state, relationship, hierarchy, or one authored focal moment. Decoration without purpose is animation debt.

## Motion thesis

Write:

- **focal moment** — the one sequence that deserves authorship
- **continuity** — state, layout, or navigation changes that need explanation
- **feedback** — controls and outcomes needing acknowledgment
- **budget** — expensive effects, frequency, devices, and fallback

A fade-and-rise on every section is not a thesis.

## Material by meaning

- relationship: shared elements, View Transitions, FLIP, spatial movement
- focus: bounded blur, light, contrast, depth
- reveal: masks, clip paths, controlled occlusion
- material: texture, color, shader, distortion when the world supports it
- state: the smallest change that makes cause and result clear

Use `design-intelligence/motion-systems.json` to choose an animatic with explicit purpose and reduced-motion behavior.

## Timing

- 100–150ms immediate feedback
- 150–300ms routine state
- 300–500ms layout or overlay transition
- 500–900ms authored focal sequence

Exit faster than entrance. Prefer strong deceleration. Bounce or elastic motion requires a physical reason.

## Runtime

- CSS for declarative states and bounded sequences
- Web Animations API for interruption and sequencing without a dependency
- View Transitions for semantic continuity
- GSAP for coordinated DOM, media, and scroll timelines
- Three.js, Spline, Rive, or shaders only when their material is the point
- Remotion for rendered media, not routine browser UI

Content is visible by default. Pause nonessential loops offscreen. Apply `will-change` only around known work.

## Verify

Removing the motion should lose meaning or authored character. If it only loses decoration, remove it.
