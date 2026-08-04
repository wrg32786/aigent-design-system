# Immersive Sales Deck

A deck is a controlled argument, not a landing page cut into full-screen sections.

## Story spine

A strong default sequence is:

1. hook
2. problem or opportunity
3. mechanism
4. proof
5. operating model
6. economics or scope
7. decision and next action

Use fewer slides when the argument does not need all seven. One slide carries one claim.

## Navigation model

Choose explicitly:

- **guided:** next and previous controls land on approved pause points
- **free scroll:** scroll itself is part of the story
- **hybrid:** guided controls with optional direct chapter navigation

Do not accidentally combine free scroll, snapping, nested sticky sections, and a second guided timeline.

Controls remain visible, keyboard-operable, and labeled. Escape any focus trap. Preserve the current slide on resize.

## Media

- opening media establishes the world but does not hide the offer
- scene transitions receive enough time to read
- video-to-video transitions move opaque media when they are meant to push
- sticky evidence migrates only after its source slide has left
- later media warms near its transition, not at initial load
- scrub video uses frequent keyframes and verified range requests
- mobile receives authored crops or alternative media

## Copy

Keep headlines short enough to land as a presented statement. Supporting copy appears before the approved pause point ends. Avoid duplicate overlays and generic scroll cues.

## Build

Start from `templates/immersive-sales-deck/` or `templates/free-design-stack/`. Use `video-scrub-deck` and `gsap-scroll-choreography` only when their complexity is earned.

## Verify

Click every forward and reverse path. Test keyboard, mobile viewport height, resize, reduced motion, unavailable video, and direct chapter navigation.
