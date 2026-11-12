# Scroll

Load when the page is a scroll story: pinned chapters, scrubbed video, layered heroes, lateral rails, or any surface where scroll position drives what the visitor sees. Ordinary reveal-on-entry pages only need `motion.md`.

Adapted from `nateherkai/scroll-craft` and `nutlope/hallmark` (both MIT). See `../NOTICE.md`.

## Plan the feeling before the sections

A scroll page is a sequence of states someone passes through with a hand on the wheel. Write these into the direction before choosing a single device:

- **Journey**: four to seven beats, each a shift in what the visitor knows (recognition, tension, turn, substance, range, commitment). A section that serves no beat is cut.
- **Feeling curve**: one line per section, the emotion first and the on-screen cause second. Two adjacent sections with the same feeling means one is filler.
- **One peak**: the moment a visitor would describe to a friend, written as that sentence. It gets the best asset, a quieter section before it, and the most scroll distance on the page. Three impressive sections flatten each other into none.
- **The tell-someone test**: complete "it's the site where ___" with something that happened to the visitor, not a device name. "It has a scrub video" fails.
- **A resolved ending**: the last screen holds content and stops. Fading into a footer overwrites the peak.

Silence is allowed only when it is authored. Note any intentional empty viewport in the direction so QA can tell it from dead scroll.

## Pick a structure on purpose

Variety of effect is not variety of page. Choose the structural grammar first; nav, hero, and close follow from it.

| Grammar | Fits | Refuses |
| --- | --- | --- |
| Filmic one-shot | one linear argument, consumer product | visible sequence counters, chapter indexes |
| Chaptered editorial | method, manifesto, long-form substance | continuous colour drift; each chapter is a hard change |
| Live surface | software where the demo is the argument | marketing chrome, fake dashboards; the product UI is real |
| Continuous world | real geography or physical process | section boundaries; it is the expensive, fragile option |
| Typographic poster | a brand whose asset is a sentence | photographic grounds, scrims |
| Gallery / catalog | a range, a portfolio, a menu | a single hero claim, argument-shaped pinned type |
| Split stage | two sides: before/after, manual/automated | full-bleed media before the resolve, centred copy |
| Rhythmic cutlist | energy brands, events, sport | long pins, dwell, parallax; the peak is the one held frame |

Filmic one-shot is the habitual default. Choosing it should come with a reason the others lost.

## Device families

Assign a device per beat, never per page. A good scroll page uses at least four families and never the same family twice in a row.

| Family | What scroll does | Tuning that matters |
| --- | --- | --- |
| scrub | video or frame sequence follows the wheel | 2.2 to 3 viewport-heights per hero; at most two scrub sections per page |
| pin | the frame holds while content states change | span at least about 1.2 viewports, or progress snaps; overlap copy states by about 15% |
| pan | vertical scroll drives lateral travel | about one viewport per item plus one; measure `scrollWidth - innerWidth`, aim for at least half a viewport of overflow |
| reveal | a clip-path wipe marks a change of state | use it big; an iris at most once per page |
| kinetic | a heading assembles by line or word | lines almost always; one kinetic head per section; re-split after `document.fonts.ready` |
| parallax | layers move at different rates | adjacent planes differ by 10 to 30%; copy rides at 1x; never body text on a moving layer |
| count | a real number lands | 1.2 to 1.8s, hard ease-out, fires once at half visibility; no verified figure means no counter |
| flow | ordinary sections with reveal-once | 30 to 80ms stagger, roughly 14px rise; content never re-hides on scroll-up |
| pointer | tilt, magnet, light follows the cursor | gated to `(hover: hover) and (pointer: fine)`; magnet on the primary action only |
| drift | the page ground interpolates between sections | three to five small stops in one colour family; paint hard edges instead when several short sections overlap |

One thing is the reason each section exists. Everything else in it is support.

## Mechanics that break quietly

These failures look correct in any single screenshot.

- **Clip time vs. pin time.** A pinned stage is visible for a viewport before its pin starts and after it ends. Map clip time across the stage's whole visible life, not only the pinned travel, or the film freezes while a still frame slides past.
- **Lerp the playhead.** Scroll sets a target time; a requestAnimationFrame loop eases toward it (around 0.18 per frame), skips sub-frame seeks, and never queues a seek while one is resolving. Writing `currentTime` directly on every scroll event stutters.
- **Encode for seeking.** Scrubbed video needs a dense keyframe interval (a keyframe every few frames), no audio track, and a separate portrait encode for phones. A normal web encode plays fine and scrubs badly. Keep a poster visible until a real frame has painted; iOS leaves seeked muted video blank.
- **Ground or greet.** A pinned section's first content must be visible when the stage enters: either a ground that already carries the screen, or a first copy state that starts at full opacity. The hero headline is present at load.
- **Only the last section holds.** A middle section whose final copy state never fades can ride up through the next section and under fixed chrome. Close every state except the page's last.
- **Clip paths follow the box, not the ink.** Wiping tight display type (line-height under 1) shears ascenders and descenders. Wipe a padded wrapper instead.
- **One writer per transform.** Magnet, parallax, and entrance rises all write `transform`. Give each its own element.
- **Moving planes transition opacity only.** A `transition: transform` on a parallaxed plane makes it lag the thumb on phones.
- **Pan rails crop copy.** Card headings are read half-visible at the edges; keep them to one or two short words.
- **Depth layers run on film time.** Particles, snow, dust, or bubbles laid over a scrubbed film take their motion from the film's playhead, not from raw scroll. They then hold still where the film holds a frame, and keep the film's pace where the scroll-to-time map speeds up or slows down. Driven by raw scroll, they stream past a frozen frame and show where the map stalls.

## Layered heroes

For a premium marketing hero, depth is planned before assets are made:

1. Name the planes back to front: background, focal subject, foreground, optional atmosphere.
2. Build real compositing assets: a clean background plate with the subject removed, genuine alpha cutouts (check the alpha channel, not a fake checkerboard), and shared contact points that stay anchored.
3. Move planes at visibly different but restrained rates. Pause offscreen work. Load the full layer set before swapping out the poster.
4. Art-direct mobile separately: crop, subject position, type order, and travel all change. Type may sit above the subject on a phone even if it passes behind it on desktop.
5. Reduced motion keeps a complete static composition with depth and no extra pinned scroll.

Respect explicit static or simpler direction. Working surfaces such as dashboards do not need an invented hero.

## The signature move

Each scroll page earns one bespoke interaction that belongs to this product alone: a line drawing that builds from scroll progress, a running ledger of real figures that totals by the close, one control that regrades the entire page. A tuned parameter on an existing device is not a signature move. Describe it to someone who has seen your other work; if they cannot tell it apart, it is not one.

A signature that answers the visitor (a score, a slider, a question) keeps its answer on screen with the control that drives it, at every width. On a phone, measure how much of the feedback element is visible while the question and its button are in view. Anything under 100% is a defect: the visitor acts and sees nothing happen. One build measured 28% on a phone, and it stayed a defect until a phone layout brought it to 100%.

Before building, compare the plan against your earlier builds on six axes: grammar, nav, hero device, section sequence, close, signature move. Differ on at least four. If the plan fails, change the plan.

## Native scroll-driven CSS

When one scroll-linked pattern is enough, prefer CSS scroll timelines over a library.

- One scroll-linked pattern per page, on structure only: a pinned chapter, one display element, a progress hairline, a sticky diptych. Prose never moves under the reader.
- Base CSS is the finished layout. The choreography lives inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference) and (min-width: 40rem)`, so unsupported browsers, small screens, and reduced motion get the complete page.
- Declare `animation-timeline` and `animation-range` after the `animation` shorthand, which resets them.
- Use `linear` timing for scrubbed progress; easing detaches the page from the thumb.
- Elements inside a stuck pane cannot drive their own `view()` timeline. Put a named `view-timeline` on the tall track and slice it with `animation-range`.
- The only fallback is reveal-once with IntersectionObserver, hidden only under a `.js` class. Never a scroll-listener polyfill.

```css
.chapter { min-height: 280vh; }
.chapter__pin { position: sticky; top: var(--space-xl); }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 40rem) {
    .chapter { view-timeline: --chapter block; }
    .chapter li { animation: step-in linear both; animation-timeline: --chapter; }
    .chapter li:nth-child(1) { animation-range: contain 5% contain 30%; }
    .chapter li:nth-child(2) { animation-range: contain 30% contain 55%; }
    .chapter li:nth-child(3) { animation-range: contain 55% contain 80%; }
  }
}
@keyframes step-in { from { opacity: 0.2; transform: translateY(8px); } to { opacity: 1; transform: none; } }
```

Reach for GSAP (`skills/gsap-scroll-choreography`) when several media, copy, and scene states must be coordinated on one timeline.

## Verify by scrolling

A scroll page has no single state. Check it mechanically and by eye:

- Sample several positions inside each section, not uniformly down the document, so findings do not move when an unrelated section changes height.
- Look for dead scroll (nothing changes across consecutive samples), frozen clips (a stage moves but its playhead does not), copy states that never reach full opacity, and contrast measured against the brightest frame under each line.
- Serve over http and use a browser with the codecs the media needs; `file://` and codec-less Chromium silently fall back to posters and prove nothing.
- Review a contact sheet of the samples at desktop, phone, and reduced motion.
- Run a cold feel check: scroll once at reading pace, write one word per section, then compare to the planned curve. Where they disagree, the page is wrong.
- Say what was not covered. Headless Chrome does not reproduce a real phone's decoder, autoplay policy, Low Power Mode, or touch scrolling.

Resolve and Vision (`resolve.md`, `vision.md`) still own the mechanical floor and the rendered review.
