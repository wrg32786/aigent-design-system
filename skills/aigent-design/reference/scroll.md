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
| kinetic | a heading assembles by line or word | lines almost always; one kinetic head per section; re-split after the font stylesheet's load event and a non-empty `document.fonts.load()` for each face (see `type.md`), not on `document.fonts.ready` |
| parallax | layers move at different rates | adjacent planes differ by 10 to 30%; copy rides at 1x; never body text on a moving layer |
| count | a real number lands | 1.2 to 1.8s, hard ease-out, fires once at half visibility; no verified figure means no counter |
| flow | ordinary sections with reveal-once | 30 to 80ms stagger, roughly 14px rise; content never re-hides on scroll-up |
| pointer | tilt, magnet, light follows the cursor | gated to `(hover: hover) and (pointer: fine)`; magnet on the primary action only |
| drift | the page ground interpolates between sections | three to five small stops in one colour family; paint hard edges instead when several short sections overlap |

One thing is the reason each section exists. Everything else in it is support.

## Mechanics that break quietly

These failures look correct in any single screenshot.

- **Clip time vs. pin time.** A pinned stage is visible for a viewport before its pin starts and after it ends. Map clip time across the stage's whole visible life, not only the pinned travel, or the film freezes while a still frame slides past.
- **Lerp the playhead.** Scroll sets a target time; a requestAnimationFrame loop eases toward it (around 0.18 per frame), skips sub-frame seeks, and never queues a seek while one is resolving. Writing `currentTime` directly on every scroll event stutters. Clamp the target to the stage's range and stop the loop once it settles. Let resize, load, and pageshow wake the loop rather than snap the playhead to the target: phones fire resize as the address bar hides mid-scroll, and a slow network fires load while the visitor is already scrolling, so a snap on either puts the jump back. Snap only on a jump of more than about a tenth of the run, such as a link back to the start, which would otherwise play the story backwards in front of the visitor.
- **Encode for seeking.** Scrubbed video needs a dense keyframe interval (a keyframe every few frames), no audio track, and a separate portrait encode for phones. A normal web encode plays fine and scrubs badly. Keep a poster visible until a real frame has painted, and make it the film's first frame as the page renders it: re-shoot it after any change to the look, and force the first seek even when the target equals `currentTime`, or a poster cut from another frame stays up at the start. iOS leaves a muted video blank until it has played once, so prime each scrubbed film at `loadedmetadata`: call `play()`, call `pause()` once the play promise resolves (a pause in the same task aborts the play before a frame decodes), and retry on the first touch end or click (a touch `pointerdown` does not count as a user activation).
- **Ground or greet.** A pinned section's first content must be visible when the stage enters: either a ground that already carries the screen, or a first copy state that starts at full opacity. The hero headline is present at load.
- **Only the last section holds.** A middle section whose final copy state never fades can ride up through the next section and under fixed chrome. Close every state except the page's last.
- **Clip paths follow the box, not the ink.** Wiping tight display type (line-height under 1) shears ascenders and descenders. Wipe a padded wrapper instead.
- **One writer per transform.** Magnet, parallax, and entrance rises all write `transform`. Give each its own element.
- **Moving planes transition opacity only.** A `transition: transform` on a parallaxed plane makes it lag the thumb on phones.
- **Pan rails crop copy.** Card headings are read half-visible at the edges; keep them to one or two short words.
- **Depth layers run on film time.** Particles, snow, dust, or bubbles laid over a scrubbed film take their motion from the film's playhead, not from raw scroll. They then hold still where the film holds a frame, and keep the film's pace where the scroll-to-time map speeds up or slows down. Driven by raw scroll, they stream past a frozen frame and show where the map stalls.
- **One progress model drives every readout.** Map the film, any drawn line, readouts, counts, and step labels through one table of event landmarks: mapped straight to progress, one film showed its main event 66 seconds early by the page's own clock. Round a readout by the same rule as the state boundaries, count an item only once it is fully drawn and uncovered, and let the copy state a figure only once the element on screen shows it.
- **Scrim the words, not the frame.** Text over a film or scene that changes brightness gets a soft scrim anchored to its own words: a blurred plate on the text block, or a `::before` inside the element that carries the text's slide, so the scrim moves with it. A gradient keyed to fixed fractions of the screen misses the words once their position depends on the window's height (a phone date line over one read 1.93 to 3.05:1), and a text-shadow glow alone lifted contrast about 1.3 times and never reached 4.5:1.
- **Thin the drawing under the words, in the canvas.** When a canvas draws behind text, measure the text boxes and take the drawing under them down to about a quarter with a few soft `destination-out` passes, then paint the ground behind everything with `destination-over`. A CSS scrim over the same canvas showed as a dark blotch at the scene's bright hour and still let lines through at its weak edge, where one label read 2.3:1.
- **A bright band in a drawn ground starts below the words.** Place a horizon glow or any lighter band from the measured lower edge of the lowest text box, not at a fixed fraction of the stage. In a short window a list wrapped onto a dusk band placed by fraction, and its last entry read 3.63:1.
- **One instrument per reading.** Two gauges on a page never show the same unit with different values. If a section needs an instrument of its own, give it its own quantity (the room in degrees while the page-long gauge reads pressure), so the page-long reading keeps its payoff at the end.

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

A pointer-driven signature also works under a finger and from the keyboard. Set `touch-action: pan-y` so a sideways drag paints while a vertical one scrolls (`none` only where the effect owns the screen), let a focusable slider drive the same effect, and word the hint for the input in use (drag on touch, move the pointer with a mouse), hiding only a hover-only hint under `(hover: none)`.

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

## Pinned stages, hand-overs, and reveals

Rules from review rounds on pages that pin a live stage and swap a still for a live model.

- **Reparenting can replay an entrance.** Removing a node and inserting it somewhere else restarts its CSS animations; only `moveBefore()` keeps their state. Before a script moves an animated hero into a pinned wrapper, remove the entrance class, and make sure the element's resting style is its final state.
- **Hand over from the still in the still's own pose.** Render the still from the same code and camera as the live model. Fade the live canvas in over the still and remove the still only once it is covered. Give the model no turn-in of its own on take-over, and hold pointer input until the still has gone. Then measure it: compare the frame before take-over with the frame after, with the pointer still, and treat a visible jump as a defect.
- **Controls in a pinned stage stay reachable on short screens.** A pinned stage with a minimum height taller than the screen, as on a phone held sideways, can clip its own controls, and focus then lands on something the visitor cannot see. Keep the pin to the screen and cut its copy to the heading and controls, move the rest outside the pin, or drop the pin at that size. A pinned box with `overflow: hidden` passes only when its `scrollHeight` equals its `clientHeight`; one panel's last row sat below an 800px screen with nothing able to bring it into view.
- **The peak pins on the screens people use.** A stage that pins only when its content fits one screen can lose its pin on most phones (390 x 664 with the browser bars showing, 375 x 667, 360 x 640, any phone held sideways) and on 1366 x 768 laptops, so size its type and controls in `svh` until it pins down to about 360 x 640 and 1280 x 600. On short and turned phones, drop secondary panels and rows before cards cover the subject: opaque cards hid 85 to 95% of one 3D model at 375 x 667. Design the unpinned version as a composition of its own, since a cover film stretched behind a long list crops into blur.
- **Measure a pinned stage with its hold off.** Once a stage holds, its box is the screen, so a test for "fits one screen" always passes and the pin never lets go after a resize or rotation. Remove the hold, read the height, and restore the hold in the same task, with `overflow-anchor: none` on the section so the swap cannot move the scroll, and measure again on every resize.
- **Pinned-layout rules stay in the pinned layout.** Scope every sticky offset, stage height, and absolute placement to the live mode and the widths it serves (a selector such as `html.live` that only that mode carries), because `.js` stays on the root under reduced motion and specificity outranks media order: leaked rules left about 4,900px of empty scroll on one phone and clipped a finished stage to 12px. Reset `top: auto` wherever a sticky or absolute box goes relative, and never give a sticky layer a negative bottom margin, which lets it run a full screen into the next section. After any change to a sticky rule, scroll through the pinned span and look: moving `position: sticky` onto a shared class let a later rule of equal weight unpin one stage and leave four screens of empty ground.
- **Keep what a run shows apart from what the visitor picked.** A scroll run that steps through colours or options changes its own words and highlight only. The order summary, the form, and aria-checked stay on the visitor's pick. Test at the scroll position where the run's last screen and the order button are both in view.
- **Keep the place through reloads and geometry changes.** When a script builds the page's height after load, the browser's own restore can land short. If you measure that, set `history.scrollRestoration` to manual. The page is then responsible for reload and Back alike: save the position on leaving, restore it after the build, and build at once when there is a place to restore. Turn scroll anchoring off (`overflow-anchor: none`) where a script adds a pin's height, or the browser adds it a second time (one reload landed five screens further down); hold a pinned stage's progress whenever its length changes, so a rotation keeps the frame; scroll a hash target into place again once the pin is built; and refresh a scroll library after the browser restores the position (`ScrollTrigger.refresh()`). On a touch device, rebuild a pin's length only when the width changes or the height moves by more than about 120px, since a phone fires resize as its toolbar hides; re-measuring placements takes no threshold (`layout.md`).
- **Smooth scrolling for chosen navigation only.** With CSS smooth scrolling on for the whole page, a Tab that moves focus far down the page animates there, and the focused field can be off screen while it travels. Scroll smoothly from a link's own click, leave focus scrolling immediate, and skip the animation under reduced motion. On a page with a measured pin, smooth root scrolling also breaks the pin, because a scroll library that re-measures by scrolling lands its measurements mid-scroll: after a reload or a resize, one stage pinned over the hero or left three empty screens.
- **A reveal fails open.** Hide reveal targets only after the observer has reported once, and run the reveal from a small script of its own. If the observer never calls back, or a later script throws, everything stays visible. A target that takes focus shows at once.
- **Reduced motion is a finished, still page.** Under reduced motion and with scripting off, unpin the sequence and show its end state: every step listed, films on their first frame and never fetched for scrubbing, eased values at their targets, runways down to one screen, and no instruction or control that would do nothing there ("Scroll to run", an animate toggle). The override undoes every property the motion used to hide (opacity, visibility, clipping, stacking). Add `autoplay` from script once motion is allowed, since the attribute plays with scripting off and ignores reduced motion.
- **Text can move in on wide screens while the stage stays.** On a full-bleed film or canvas, elements placed against the picture (a rail, callouts) belong to the picture's edge. If the text column moves toward the centre on wide screens, give it a gutter token of its own, because a shared one can carry an overlay across the thing it annotates. Check each overlay against the picture at every width.
- **The stage marks itself.** Set the class that turns on a stage's pinned layout from the stage's own script, after it has its canvas and context, never from a script in the head. A head class stays on when the stage script fails: on one phone layout that showed only the current entry, a failed script then showed none. Marked by its own script, a stage that fails stays the plain section.
- **Steps keep their stretch of scroll in every mode.** The spacing between steps beside a sticky panel is layout, not motion. Keep it with motion reduced and with scripting off: packed, five steps sat on one screen, and the panel had nothing to hold beside.
- **Hold the first step.** Put the line that lights a step where the second step crosses it most of a step's scroll after the pin starts (a third of the way down the window did it). With the line at the middle, the first step's state flashed past within 24px of the pin.
- **Dim steps by colour, never by opacity.** Entries waiting at 30 percent opacity read 1.8:1 over a drawn sky. Give each state its own colour that clears 4.5:1 on the brightest ground it can meet, and measure every state on the composited page.

## Verify by scrolling

A scroll page has no single state. Check it mechanically and by eye:

- Sample several positions inside each section, not uniformly down the document, so findings do not move when an unrelated section changes height.
- Look for dead scroll (nothing changes across consecutive samples), frozen clips (a stage moves but its playhead does not), copy states that never reach full opacity, and contrast measured against the brightest frame under each line. Count the film frames between presented frames with `requestVideoFrameCallback`: an eased playhead moves one or two a step on a wheel notch, where writing the target directly cut nine.
- Measure contrast on the composited page with the text hidden by its colour (not its container, or the probe reads the film instead of the text's plate): sample a thin ring around the glyphs of every line not under a fixed header, and grade light text against the brightest 5% of that ring and dark text against the darkest 2%. Sample several moments of each loop, a live scene at fixed phases of its clock, and text while it slides in or out; one sample caught a loop at its darkest and missed labels under 3:1. Repeat in each theme, under reduced motion, and in short laptop windows (1366 x 650, 1280 x 650, 1536 x 730).
- Serve over http and use a browser with the codecs the media needs; `file://` and codec-less Chromium silently fall back to posters and prove nothing.
- Review a contact sheet of the samples at desktop, phone, and reduced motion.
- Run a cold feel check: scroll once at reading pace, write one word per section, then compare to the planned curve. Where they disagree, the page is wrong.
- Say what was not covered. Headless Chrome does not reproduce a real phone's decoder, autoplay policy, Low Power Mode, or touch scrolling.

Resolve and Vision (`resolve.md`, `vision.md`) still own the mechanical floor and the rendered review.
