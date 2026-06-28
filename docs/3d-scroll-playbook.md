# 3D Scroll Playbook

## Choose The Technique

### Spline Embed

Use when you have an interactive or hosted Spline scene and want fast implementation.

Best for:
- landing pages
- immersive backgrounds
- proof-of-taste pages
- scroll-linked scene transforms

### Frame Sequence

Use when the scene needs to look photoreal and perform smoothly on mobile. Render 80-140 frames from Blender, then scrub a canvas based on scroll.

Best for:
- product hero shots
- cinematic transitions
- exact art direction
- mobile-safe 3D

### Three.js

Use when the user needs live interaction, procedural geometry, or real-time 3D behavior. Do not reach for it just because the site should feel 3D.

## Scroll Mapping

Treat the background animation like a track:

```js
const maxScroll = document.body.scrollHeight - window.innerHeight;
const raw = window.scrollY / maxScroll;
const sceneProgress = Math.min(1, Math.max(0, raw * 1.8));
```

If the user reaches the page bottom and the scene only feels 30 percent complete, increase the multiplier. If the scene finishes too early, lower it.

## Anchor The Focal Point

For vortex or tunnel backgrounds:

- Keep `scene-x` and `scene-y` at `0px`.
- Use scale and rotate for motion.
- Set `transform-origin` to the visual center.
- Avoid sideways drift unless the copy explicitly moves to a new zone.

## Copy Legibility

- Put text over the quiet part of the scene.
- Add a dark veil behind the full page, not a box behind every line.
- Use `text-shadow` sparingly.
- Pause background intensity behind dense cards.

## QA Checklist

- Desktop: scene center does not drift.
- Desktop: scroll track reaches the intended final state by the final content section.
- Mobile: text and cards appear early enough.
- Mobile: sticky nav does not cover section headers.
- Reduced motion: page remains readable without animation.
