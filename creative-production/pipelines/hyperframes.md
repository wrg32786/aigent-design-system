# HyperFrames production pipeline

Use this pipeline when a website, product interface, design system, document, or data surface should become a deterministic video with HTML as the source of truth.

```text
PRODUCT TRUTH
  ↓
CAPTURE REAL SURFACE
  ↓
FRAME DESIGN SYSTEM
  ↓
SCRIPT + STORYBOARD
  ↓
VOICE + TIMING
  ↓
HTML COMPOSITIONS
  ↓
LINT + INSPECT + PREVIEW
  ↓
RENDER VARIANTS
  ↓
ENCODE + MANIFEST + VERIFY
```

## 1. Define the job

Before opening HyperFrames, record:

- audience and distribution channel;
- one viewer outcome;
- duration ceiling;
- required aspect ratios;
- narration, captions, music, and sound requirements;
- approved product states and claims;
- source rights and privacy boundary;
- whether the output returns to a website, README, social platform, or campaign system.

A product tour, launch teaser, README loop, and cinematic brand film are different jobs. Do not use one composition brief for all four.

## 2. Capture and understand the source

For an existing public website, install the official skills and use `website-to-hyperframes`:

```bash
npx skills add heygen-com/hyperframes
```

Capture only pages and states you are authorized to use. Record:

- product name and mechanism;
- hierarchy and key proof;
- palette, type roles, material, and motion;
- real screenshots and media assets;
- mobile transformations;
- interaction sequence;
- elements that must not appear in the video.

For an AIgent Studio project, use the actual preview and project files rather than fabricating a parallel interface.

## 3. Translate DESIGN.md for the frame

A browser layout cannot simply be scaled into video. Translate the design system into fixed-frame rules:

- title and caption safe areas;
- camera and crop language;
- display-size limits;
- contrast against moving backgrounds;
- transition grammar;
- pacing and hold duration;
- portrait and square recomposition;
- reduced-motion or static derivative.

HyperFrames `frame.md` can provide the translation layer while preserving the original tokens and visual authority.

## 4. Write the script and storyboard

The script establishes the narrative and duration. The storyboard defines each beat:

```text
Beat
- viewer takeaway
- narration and on-screen copy
- start and duration
- hero frame
- camera and depth
- entrance
- transition
- media and sound
- portrait/square change
```

Build each hero frame statically before animation. The final visible layout is the source of truth; entrances animate into it.

## 5. Generate voice and timing

When narration exists:

- generate or record voice;
- transcribe to word-level timestamps;
- map actual timing back to the storyboard;
- reserve caption-safe space;
- keep audio as a separate track from video.

Do not guess scene duration from paragraph length after animation has already been built.

## 6. Build compositions

```bash
npx hyperframes init my-video --non-interactive
```

Follow the upstream composition contract:

- unique `data-composition-id`;
- explicit start, duration, dimensions, and track index;
- paused and registered timelines;
- seekable animation only;
- deterministic values and finite repeats;
- muted inline video plus separate audio;
- transitions between scenes;
- entrances for every scene;
- no unreviewed text overflow or off-canvas content.

Prefer reusable catalog blocks before writing another transition, caption system, chart, map, overlay, or effect.

## 7. Lint, inspect, and preview

```bash
npx hyperframes lint
npx hyperframes inspect
npx hyperframes preview
```

The preview is not the completion gate. Inspect hero frames and transition boundaries for:

- clipping and overflow;
- unreadable captions;
- unintentional overlaps;
- empty frames before transitions;
- incorrect media timing;
- brand drift;
- unsupported claims;
- weak portrait or square composition.

## 8. Render only required variants

```bash
npx hyperframes render --quality draft
npx hyperframes render --quality high --output final.mp4
```

Typical outputs:

- `1920×1080` product tour or launch film;
- `1080×1920` vertical social variant;
- `1080×1080` feed variant;
- poster or thumbnail;
- short loop for a README or website;
- transparent WebM only when the delivery environment needs it.

Draft renders are for review. Final renders use the approved frame rate, codec, audio mix, and quality.

## 9. Optimize and record provenance

For every public output, record:

- HyperFrames version;
- composition commit or content hash;
- source assets and rights;
- narration and music source;
- render dimensions, frame rate, and duration;
- delivery encode;
- poster and fallback;
- mobile and reduced-motion strategy.

Use the normal AIgent asset manifest and video-delivery standards. Keep raw captures, licensed source packages, credentials, and private generation records outside Git.

## 10. Verify in context

When the video returns to a website or README:

- test the actual page width and mobile scaling;
- verify poster and failure behavior;
- confirm the loop seam when looping;
- make sure the media does not become the largest avoidable performance cost;
- run the relevant AIgent browser, Resolve, and Vision checks.

A successful HyperFrames render can still be the wrong asset for the page. The final surface decides completion.
