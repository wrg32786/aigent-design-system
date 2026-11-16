---
name: cinematic-asset-gallery
description: Build a cinematic resource, tool, repository, or media gallery that remains searchable, readable, accessible, and useful while using restrained scroll and scene motion.
---

# Cinematic Asset Gallery

Use this for the neutral form of `templates/asset-scroll-gallery/`.

## Mode

Most galleries are Operate + Read. Utility outranks spectacle.

## Structure

- clear category navigation
- real search or filters when the set requires them
- direct item names
- meaningful descriptions
- visible destination cues
- license or provenance where relevant
- lists and rules before card grids
- stable active state
- mobile horizontal navigation only when necessary

## Media

A background scene may orient the gallery, but it must not reduce scanability or block interaction.

Use motion to:

- show active category
- reveal a new chapter
- maintain place
- reward an item action

Do not animate every card independently by default.

When the gallery shows websites, show a motion site as a recorded loop of its motion (the scrub, the autoplay, the cursor effect in action), never as a still. A still of a motion site shows a lesser page than the one being offered. Each loop is muted, pauses offscreen, and shows its poster frame under reduced motion.

Name what each site shows off before recording it, because a recorder that only scrolls misses every site whose signature is a cursor, a drag, or a press. Record the scroll for a scrubbed film, a scripted pointer path with a drawn cursor for a cursor or drag effect (a scripted or headless capture has no system cursor), the press and what it changes for a signature you press, real-time playback for an autoplay demo, and WebGL in a browser with the GPU on. Re-record whenever a change falls inside the span the loop shows, under a new file name, since gallery assets are often cached as immutable; keep each loop under a byte budget (one 5.3 MB preview became the heaviest card on a phone), make its poster the loop's first frame, and let the card's line promise only what the page does at the size the gallery shows it.

Pace a loop so someone seeing the page for the first time can read it. Keep the scroll near 60 px a frame at 24 fps at its fastest, and check the largest step between two frames, because an eased move peaks well above its average. With a smootherstep ease, whose peak is 1.875 times its average, that means at least 1.2 s for every 1,000 px: a 2,567 px move in one second was a whip nobody could follow. Where the loop crossfades its ends, a rest at the start or the end has to outlast the fade (0.8 s in one recorder) to show at all. When the loop types into a field, type something other than the placeholder, pick the result that changes most on screen, and hold it for about two seconds. Park the pointer in a margin until it is needed, never over body text, and give the page's signature scene the largest share of the loop.

A gallery that embeds live pages in frames hides the frames out of view with `display: none`: a film that waits for an IntersectionObserver still loads inside a `visibility: hidden` frame, because the observer cannot see that.

## Reuse

Start from the existing gallery template, preserve useful behavior, then replace The AIgent branding through semantic tokens and project context.

## Verify

- keyboard navigation
- external-link safety
- no hidden content before observer activation
- active category on desktop and mobile
- readable measure
- touch targets
- no horizontal page overflow
- reduced-motion completeness
