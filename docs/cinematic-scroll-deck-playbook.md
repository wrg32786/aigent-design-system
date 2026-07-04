# Cinematic Scroll Deck Playbook

Use this playbook for AIgent-style sponsorship decks, investor decks, product tours, and any page where a hero loop hands off into a pinned video-scrub sequence.

These notes come from the live AIgent deck iteration. They are rules now, not guesses.

## Core Principle

The browser is the source of truth. Figma can storyboard motion states, but scroll scrub, MP4 seeking, sticky pinning, and transition timing must be verified in the real page.

## Production Pattern

The strongest version of this deck pattern is a guided deck, not a normal scroll page.

Rules:

- The hero can loop as a normal page, but entering the deck should be a click action.
- Once the deck is active, block wheel, touch, scrollbar, and keyboard scroll input unless the experience explicitly calls for free scrub.
- Use `Next` and `Previous` controls to move the internal scroll timeline to approved pause points.
- Pause points should land near the end of each scrub clip, after the scene motion and copy reveal have completed.
- A click to the next scene should animate the current copy out, play the last part of the current clip, transition into the next clip, and settle near the next scene's completed-copy pause point.
- Decelerate into pause points so motion does not stop abruptly.
- Keep the top-left brand link scoped to the deck hero/home state, not the main site homepage, when the user is inside a deck.

Avoid:

- Letting users freely scroll from the hero into the deck while the CTA is also wired to enter the deck.
- Jumping directly to nested scrub scene anchors from header navigation.
- Mixing free-scroll expectations with button-guided timing unless both modes have been deliberately designed and tested.

## Hero To Deck Entry

The first click should not jump into the middle of the scrub timeline.

Required behavior:

- The hero CTA targets the deck boundary, not the first sticky scene content.
- The hero-to-deck transition plays during the scroll to the deck boundary.
- The first scrub video lands at frame 0 or the intended start offset.
- Opening copy reveals immediately once the deck boundary is reached.
- The opening copy reveal is controlled by one source of truth.

Avoid:

- Linking the CTA directly to a scene nested inside the scrub sequence.
- Running delayed duplicate reveal calls after the first reveal has completed.
- Adding a second overlay copy layer unless the original scene copy is removed or hidden.
- Showing a generic `Scroll` cue on the first deck slide after the hero.

Implementation rule:

```js
engageButton.addEventListener("click", (event) => {
  event.preventDefault();
  revealOpeningCopyOnce();
  lenis.scrollTo(deckStage, { duration: 1.2, easing: easeOutCubic });
});
```

The reveal function should kill any active tweens for the opening copy, set the opening stage visible, and run one side-based reveal. It should not schedule multiple delayed replays.

In a button-guided deck, the hero entry may use the same pause-point logic as the rest of the deck after the first interaction model is clear. If the deck is designed to pause near the end of each scrub clip, the hero entry should also land on the first clip's approved pause point with copy fully revealed, not on frame 0 with a blank screen.

## Mobile Hero Loop

If the hero video contains the brand mark or readable product object, mobile cannot simply crop the video like a generic background.

Rules:

- Use `object-fit: contain` for the mobile hero loop when the full mark must be readable.
- Keep the desktop crop cinematic, but prioritize full-width readability on narrow screens.
- Use a poster image and preload it with high priority so mobile has a crisp first paint.
- Test mobile in an actual browser viewport around 390px wide and confirm the brand mark is readable before tapping the CTA.

Avoid:

- Cropping the hero mark to fill mobile height.
- Solving a mobile crop problem by lowering video resolution.
- Letting browser chrome hide the CTA or make it feel detached from the hero.

## Opening Copy

Opening copy should feel like it belongs to the first scrub frame. It should not wait for the user to scroll again.

Recommended reveal:

- Copy enters laterally from the side closest to its layout anchor.
- Headline lines and lead copy stagger by 40-80 ms.
- Blur resolves quickly, within the first half of the motion.
- Final transform must be exactly reset: `x: 0`, `y: 0`, `xPercent: 0`, `yPercent: 0`, `opacity: 1`, `filter: blur(0px)`.

Avoid:

- Bottom-up default reveals for every slide.
- Letting sticky scene opacity fight a separate media-overlay copy.
- Revealing the same copy twice.

## Scene Copy Handoffs

Text changes should happen with the video transition, not after it.

Rules:

- Start fading old copy as the transition starts.
- Begin new copy reveal during the incoming video movement.
- Do not wait until 80 percent of the next clip to reveal the new text.
- The old scene and new scene may overlap during the transition, but only intentionally.

Good pattern:

```js
const transitionProgress = clamp01((localProgress - transitionStart) / transitionWindow);
setSceneCopy(currentIndex, 1 - transitionProgress);
setSceneCopy(nextIndex, transitionProgress);
setSceneVisibility(currentIndex, nextIndex, transitionProgress);
```

## Video Scrub Readiness

Metadata is not enough for smooth scrubbing.

Rules:

- Use byte-range serving for MP4 files.
- Treat a clip as scrub-ready on `canplay` or `readyState >= 2`, not just `loadedmetadata`.
- Keep the active clip and the next one or two clips loaded.
- Do not preload every 1080p clip at once. It can overload Chrome and make later clips appear frozen.
- Seek the active clip directly to the scroll target in `requestAnimationFrame`.
- Match seek cadence to the source frame rate. For a 24 fps scrub encode, avoid seeking more often than about every 41 ms unless the drift is large.
- When the user clicks a guided `Next` or `Previous` control, prioritize only the target scene's video first, then warm the following reveal video after motion settles.
- Warm the first deck scrub clip on CTA intent, such as pointerenter, focus, touchstart, or click, and otherwise delay it until after the hero has painted.
- Gate reveal-video warmups to the transition window. Do not load the next reveal video on every scroll timeline update.
- Schedule noncritical API calls, metrics fetches, and preview work during idle time.

Required server behavior:

- MP4 requests support `Range`.
- MP4 responses return `206` for byte-range requests.
- Response headers include `Accept-Ranges: bytes`.

Useful runtime probe:

```js
[...document.querySelectorAll(".deck-video")].map((video, index) => ({
  index,
  active: video.classList.contains("is-active"),
  currentTime: video.currentTime,
  readyState: video.readyState
}));
```

If `currentTime` changes but the image looks still, inspect `readyState` and the video content itself. The controller may be working while Chrome has not decoded enough frames.

## MP4 Encoding

For scroll scrub, file quality is not the only concern. Seekability matters.

Recommended:

- 8-15 second clips.
- 24 or 30 fps.
- 1080p when visual clarity matters.
- Frequent keyframes or all-intra style encodes for scrub assets.
- Keep a dedicated `.scrub1080.mp4` export for the deck when clarity and seekability both matter.
- No hard cuts inside a scrub clip.
- Slow camera movement with clear foreground/background parallax.

Avoid:

- Long GOP encodes for scroll-scrub surfaces.
- Swapping to lower-resolution scrub files just to hide seek issues, unless approved. Re-encode the 1080p file for better seeking instead.
- Heavy simultaneous preload of many high-bitrate clips.
- Assuming "HD source" means "good scrub asset." A beautiful 1080p long-GOP export can still feel frozen when driven by `currentTime`.

## Transition Windows

If the transition window is too short, every effect reads like the final 5 percent of a crossfade.

Rules:

- Give scrub transitions enough scroll distance to be legible.
- For push transitions, keep the incoming video opaque while it moves in.
- Use opacity for blur/zoom/crossfade transitions, not for every transition.
- Clear stale `clip-path`, `filter`, `transform`, and crossfade classes when a video becomes active.

Recommended transition families:

- Block wipe for hero-to-deck.
- Push-left or push-up for video-to-video scene changes.
- Zoom reveal.
- Blur reveal.
- Subtle rotate reveal.
- Crossfade only as a fallback, not the default repeated answer.

Avoid:

- Repeating crossfade for most boundaries.
- Hard-edged clip-path transitions unless they have been verified in both directions.
- Poster-strip transitions for moving-video transitions unless the still image is intentionally part of the language.

## Block Wipe Palette

The hero-to-deck wipe must match the hero video background.

Rules:

- Use charcoal, black, steel grey, and very faint cool highlights.
- Avoid greenish black unless the hero world itself is green.
- Slightly overlap block rows to prevent hairline gaps.
- Keep rows vertically overscaled during the wipe.

Example:

```css
.hero-block-wipe span {
  margin-block: -1px;
  background:
    linear-gradient(90deg, #020202 0%, #0b0d0d 44%, #17191a 52%, #070808 100%),
    radial-gradient(circle at 50% 50%, rgba(132, 164, 178, .08), transparent 48%);
  transform: scaleX(0) scaleY(1.08);
}
```

## Sticky Fact Migration

Facts should not pin before their source slide has done its job.

Rules:

- A stat pins only after the source slide disappears or the source group is no longer the primary visual.
- Subscribers, open rate, and CTOR pin after the metrics slide.
- Pricing pins after the inventory/pricing slide.
- Pinned facts need large, readable typography.
- Fact migration should animate from the visible source element into the header pill.
- In button-guided decks, facts should remain visible through the pause-point movement. They may resize and migrate, but should not disappear and then reappear with a gap.
- Header fact pills should be large enough to read as deck content, not tiny nav metadata.

Avoid:

- Showing the sticky header facts while the large source facts are still visible.
- Migrating from a missing selector.
- Tiny pinned fact typography that reads like debug metadata.

## Scroll Cues

Scroll cues are not decoration.

Rules:

- The hero can have one CTA cue, such as `Engage Here`.
- The scrub deck can have a small scroll cue after the opening slide only when free scrolling is allowed.
- In button-guided decks, use `Next` and `Previous` controls instead of scroll cues.
- Do not show `Scroll` on the first deck slide immediately after the hero click.
- Never show two arrow cues stacked in the same area.
- Hide the bottom cue on the final slide.

## QA Checklist

Before calling a cinematic deck done:

- Click the hero CTA and confirm the deck lands on the first scrub frame with copy visible.
- If the deck is button-guided, confirm the CTA lands on the first approved pause point with copy fully visible.
- Confirm the opening copy reveals once, not twice.
- Confirm no duplicate copy layer is visible.
- Confirm no `Scroll` cue appears on the first deck slide.
- Scrub forward through every video and confirm visible motion.
- Scrub backward through every transition and confirm no stale still frame or reversed wrong-video snap.
- Click `Next` through every pause point and confirm each clip reaches near its intended end before transitioning.
- Click `Previous` through every pause point and confirm the scene and copy stay coherent.
- Inspect active video `currentTime` and `readyState` at multiple scroll positions.
- Confirm MP4 range requests return `206`.
- Confirm initial page load requests the hero poster and hero loop first, not every deck scrub clip.
- Confirm sticky facts appear only after their source slide is gone.
- Confirm transition families do not repeat unless intentionally repeated.
- Confirm mobile hero uses a readable full-width fit when the hero video contains the brand mark.
- Hard refresh and retest in Chrome after HTML/CSS changes.

## Failure Patterns To Watch

- Blank first deck slide: CTA targets the wrong anchor or copy reveal depends on a scroll tick that has not fired.
- Blank first pause point in a button-guided deck: CTA uses the old frame-0 entry behavior instead of the shared pause-point controller.
- Copy reloads after reveal: delayed reveal calls or class toggles restart CSS animation.
- Duplicate opening text: a helper overlay was added without removing or hiding the real scene copy.
- Choppy later videos: later clips are metadata-ready but not frame-ready, or too many 1080p videos preload at once.
- Static later videos after a performance pass: initial lazy loading is too aggressive or the target video is not warmed before the guided move starts.
- Fast first transition: the entry controller uses a shorter duration than the rest of the guided moves.
- Mostly crossfade transitions: transition window is too short or push transitions also fade opacity.
- Thin lines in block wipe: rows need 1px overlap and slight `scaleY`.
- Sticky facts too early: reveal rule is based on local progress inside the source slide instead of the next scene.
