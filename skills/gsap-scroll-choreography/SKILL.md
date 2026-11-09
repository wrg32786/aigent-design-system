---
name: gsap-scroll-choreography
description: Design and implement one coherent GSAP scroll timeline for cinematic websites, pinned media, scene transitions, copy beats, and video state. Use when native reveals no longer express the page sequence clearly.
---

# GSAP Scroll Choreography

Use GSAP for coordination, not decoration.

## Read

- page context and dominant visual idea
- `integrations/gsap/README.md`
- `docs/cinematic-scroll-deck-playbook.md` when video is involved
- `skills/aigent-design/reference/scroll.md` for the feeling curve, page grammar, device families, and scroll QA

## Timeline design

Define before code:

- page boundary
- chapter boundaries
- pinned ranges
- approved rest states
- active media
- copy source of truth
- forward and reverse behavior
- mobile adaptation
- reduced-motion state

Build one inspectable timeline per sequence. Do not scatter unrelated ScrollTriggers across every element.

## Rules

- content is readable before it leaves
- copy motion follows composition
- one property owner per state
- use labels for meaningful beats
- video seeks at a bounded cadence: lerp the playhead toward a target, never queue a seek while one resolves
- map clip time across the stage's whole visible life, not only its pinned range, so media never freezes while the stage slides
- scrubbed media is encoded with a dense keyframe interval and no audio
- transitions receive enough distance to read
- reverse travel restores state
- pinning does not trap the page
- mobile does not inherit desktop scroll distances blindly
- reduced motion keeps every chapter available
- the hero is readable at load; every pinned section opens on a ground or a visible first state
- only the page's last section may hold its final state; middle sections close theirs

## Performance

- animate transforms, opacity, masks, clip paths, and deliberate material properties
- avoid layout reads and writes inside repeated callbacks
- do not leave broad `will-change`
- load media near use
- kill timelines and listeners when the surface unmounts

## Verify

Use actual page copy and actual media. Click and scroll through every state at desktop and mobile sizes. Check keyboard controls for guided experiences.

Tool syntax belongs in official GSAP documentation. This skill owns the page choreography and quality bar.
