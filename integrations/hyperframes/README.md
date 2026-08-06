# HyperFrames

HyperFrames is an optional build-time integration for turning HTML, CSS, media, and seekable animation into deterministic video. It is the preferred AIgent route for website-to-video, product tours, launch films, README walkthroughs, social variants, animated explainers, and reusable motion-graphics systems when plain HTML is the right source of truth.

The AIgent repository does not vendor HyperFrames. Install the official upstream skills and run the maintained CLI:

```bash
npx skills add heygen-com/hyperframes
npx hyperframes init my-video
cd my-video
npx hyperframes lint
npx hyperframes inspect
npx hyperframes preview
npx hyperframes render
```

Requirements:

- Node.js 22 or newer
- FFmpeg

## Why it fits AIgent

HyperFrames can translate an existing website, Studio project, design system, or data surface into video without rebuilding it as a proprietary timeline or React-only composition. Agents already understand HTML and CSS, while HyperFrames supplies frame-accurate seeking, media synchronization, linting, inspection, local preview, rendering, and reusable blocks.

Useful upstream capabilities include:

- website-to-video capture and production workflow;
- HTML composition authoring;
- GSAP, CSS, Lottie, Three.js, Anime.js, and WAAPI adapters;
- captions, transcription, TTS, audio-reactive motion, and transitions;
- reusable catalog blocks and components;
- local, Docker, and AWS Lambda rendering;
- a browser Studio and embeddable player.

## Use when

- the source is already a website or HTML interface;
- the same composition needs several aspect ratios or campaign variants;
- deterministic CI rendering matters;
- HTML, media, captions, sound, data, and motion must share one timeline;
- a design system should extend from browser surfaces into branded video.

## Avoid when

- a literal one-take screen recording is the complete deliverable;
- a short manually edited clip is faster and no variants are needed;
- a React-first Remotion project already owns the durable production source;
- video adds no value over a still image or native browser interaction.

## AIgent ownership boundary

Use [`../../skills/hyperframes-video/SKILL.md`](../../skills/hyperframes-video/SKILL.md) and [`../../creative-production/pipelines/hyperframes.md`](../../creative-production/pipelines/hyperframes.md) for product truth, visual direction, asset rights, variant selection, web delivery, and final QA. Use the official upstream skills for HyperFrames syntax and tooling.

## License

HyperFrames is licensed under Apache-2.0. Verify the license and current upstream release before production use:

- Repository: https://github.com/heygen-com/hyperframes
- License: https://github.com/heygen-com/hyperframes/blob/main/LICENSE
- Documentation: https://hyperframes.heygen.com/introduction
