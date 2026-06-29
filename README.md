# AIgent Design System

Premium AI-native web design patterns, cinematic scroll templates, and agent skills from The AIgent.

This repo is a free design stack for builders who want AI-generated pages to feel less generic. It packages static HTML templates, shared CSS tokens, reusable agent skills, video-scrub landing page patterns, and QA rules that help Codex, Claude Code, and similar agents produce more polished frontend work.

The flagship demo is the free design stack page:

`templates/free-design-stack/index.html`

It uses pinned scroll, scrubbed video backgrounds, mixed scene transitions, GSAP text reveals, liquid/fog glass surfaces, and mobile-safe layout rules.

## Quick Start

Requirements:

- Node.js 20 or newer
- npm
- A modern browser

Install dependencies:

```bash
npm install
```

Run the local static server:

```bash
npm run serve
```

Open:

- `http://127.0.0.1:4177/`
- `http://127.0.0.1:4177/templates/free-design-stack/`
- `http://127.0.0.1:4177/templates/spline-scroll-landing/`
- `http://127.0.0.1:4177/templates/asset-scroll-gallery/`

Use a different port if needed:

```bash
PORT=8788 npm run serve
```

PowerShell:

```powershell
$env:PORT = "8788"; npm run serve
```

## Validate

Run the static checks:

```bash
npm run check
```

Run the browser smoke tests:

```bash
npm run smoke
```

The smoke test opens the key pages on desktop and mobile viewports and verifies that they render.

## What Is Inside

- `tokens/aigent-tokens.css` - shared type, color, spacing, motion, and surface tokens.
- `templates/free-design-stack/` - the public cinematic product page for this stack.
- `templates/spline-scroll-landing/` - a Spline + GSAP scroll landing page starter.
- `templates/asset-scroll-gallery/` - a scroll-driven resource/gallery template.
- `skills/` - Codex/Claude-compatible skills for directing agents.
- `docs/` - product framing, design principles, 3D scroll playbook, mobile QA, publishing, and source intake rules.
- `assets/video/` - local demo video scrub assets for the cinematic template.
- `screenshots/` - reference captures from desktop and mobile iterations.

## The Cinematic Page Pattern

The `free-design-stack` template is built around five layers:

1. A fixed media stage.
2. Four scrubbed scene videos.
3. One global dust/light overlay video.
4. A 2D content layer with GSAP text and card animation.
5. Glass buttons/cards that stay readable over motion.

The page uses the "pin then release" pattern:

- The media stage pins while the user scrolls through the page.
- Scroll progress drives `video.currentTime`.
- Text and cards reveal as their sections enter.
- The pinned media releases naturally when the scroll sequence is over.

Current video slots:

- `assets/video/design-stack-01-cave.mp4`
- `assets/video/design-stack-02-ink.mp4`
- `assets/video/design-stack-03-drone.mp4`
- `assets/video/design-stack-03-fracture.mp4`
- `assets/video/design-stack-dust.mp4`

Current transition order:

1. Horizontal blinds reveal.
2. Crossfade.
3. Two-panel vertical reveal.

The dust video is fixed over the whole page with `mix-blend-mode: screen`, so particles and light rays can tie the scenes together without blocking the interface.

## Swapping The Video Assets

For smooth scroll scrubbing, use short, high-quality MP4 files with all-keyframe or frequent-keyframe encoding. Long GOP video can feel choppy when the browser jumps around with `currentTime`.

Good source clips:

- Slow camera movement.
- Clear depth or texture.
- Minimal hard cuts.
- Enough negative space for text.
- Dark or medium contrast backgrounds if the copy is light.

After replacing a clip, run:

```bash
npm run serve
npm run smoke
```

Then manually check:

- Top hero loads cleanly.
- Scrubbing feels smooth.
- Transition timing works in both scroll directions.
- Text does not overlap the browser chrome on mobile.
- Glass cards remain readable over the brightest frame.

## Installing The Agent Skills

Copy any folder under `skills/` into your agent's skills directory.

Claude Code style:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\aigent-asset-gallery-system "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\aigent-landing-page-polish "$HOME\.claude\skills\"
```

Codex style:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\aigent-asset-gallery-system "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\aigent-landing-page-polish "$HOME\.codex\skills\"
```

Use the skills as operating instructions for an agent. They are not runtime dependencies.

## How To Use This Repo With An Agent

Give the agent this repo and ask it to:

1. Read `docs/design-principles.md`.
2. Read the skill that matches the task.
3. Start from the closest template.
4. Keep the page static unless a framework is truly needed.
5. Verify desktop and mobile.
6. Update docs when a new pattern becomes reusable.

Good prompt:

```text
Use the AIgent design system. Start from templates/free-design-stack.
Replace the copy and scene assets for my product, keep the pinned video scrub pattern,
and verify desktop/mobile before you call it done.
```

## Design Rules

- Build the usable page first, not a marketing shell.
- Use immersive media for websites and tools, not decorative filler.
- Keep copy brief and plain.
- Animate with purpose: reveal, orient, compare, or reward.
- Avoid generic AI gradients and random floating objects.
- Keep mobile as a first-class screen, not an afterthought.
- Use glass/fog surfaces only when the background is worth seeing through.
- Verify real browser screenshots before shipping.

## Adding New Sources Or Skills

Do not paste random third-party skill files or templates directly into this repo.

Use this intake path:

1. Add the source link to `docs/source-stack-intake.md`.
2. Write what it teaches in plain English.
3. Convert the lesson into an AIgent-authored rule, template section, prompt, or QA check.
4. Review the license before vendoring any file.
5. Update `THIRD_PARTY.md` if anything external is included directly.

## Publishing A Page

The templates are static. To publish one:

1. Copy the template folder or compiled page into the target static site.
2. Copy any required video assets.
3. Rewrite relative asset paths if the destination is different.
4. Verify every MP4 and CSS file returns `200`.
5. Check desktop and mobile.
6. Push the static site repo.

For The AIgent tools site, this design can be published as:

`tools.theaigent.xyz/pro-design`

## Project Status

Early public kit. The goal is not to become a bloated component library. The goal is to package taste, scroll craft, agent instructions, and reusable patterns that help AI builders ship better-looking work.

Near-term roadmap:

- Add a React/Next version of the free design stack page.
- Add Blender/frame-sequence examples.
- Add more screenshot-based visual QA.
- Add a small gallery of approved video scrub asset styles.
- Add an install script for the skills.

## License

MIT for AIgent-authored code and docs.

See `THIRD_PARTY.md` before publishing or redistributing imported third-party material, generated media, Spline scenes, fonts, or outside skill files.
