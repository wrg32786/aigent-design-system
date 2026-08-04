# AIgent Design System

A modular cinematic web kit for building scroll-driven landing pages, product stories, galleries, and interactive decks with humans or coding agents.

> **The core is brand-neutral.** The AIgent's cyan, cream, and black visual language is included as one theme preset and as the styling for several showcase pages. New projects should use the semantic `ds-*` API.

Built and maintained by [The AIgent](https://theaigent.xyz). Free and MIT-licensed for AIgent-authored code and documentation.

## See It Working

Live sites informed by the system:

- [The AIgent](https://theaigent.xyz)
- [AIgent Tools](https://tools.theaigent.xyz)

Local demos:

| Start here | Best for | Runtime |
| --- | --- | --- |
| `templates/modular-scroll-starter/` | A clean, brand-neutral project | Native CSS + JavaScript |
| `templates/free-design-stack/` | Cinematic video scrubbing and scene transitions | GSAP + local MP4 assets |
| `templates/spline-scroll-landing/` | A scroll-mapped 3D background | Spline + GSAP |
| `templates/asset-scroll-gallery/` | Resource libraries and editorial galleries | Spline + native JavaScript |

The modular starter is the recommended entry point. The other pages are richer showcases that demonstrate specific media techniques.

## Start In Two Minutes

Requirements:

- Node.js 20 or newer
- npm
- A modern browser

```bash
npm install
npm run serve
```

Open:

- `http://127.0.0.1:4177/`
- `http://127.0.0.1:4177/templates/modular-scroll-starter/`

Use a different port when needed:

```bash
PORT=8788 npm run serve
```

PowerShell:

```powershell
$env:PORT = "8788"; npm run serve
```

Run the checks:

```bash
npm run check
npm run smoke
```

`check` validates the repository contract and module exports. `smoke` opens every key page at desktop and mobile sizes, checks basic rendering, and catches horizontal overflow.

## Use The System Without A Template

### 1. Load the neutral system

```html
<html lang="en" data-theme="graphite">
  <head>
    <link rel="stylesheet" href="/tokens/system.css" />
  </head>
  <body class="ds-shell">
    <main class="ds-container">
      <p class="ds-eyebrow">Product system</p>
      <section class="ds-panel">...</section>
      <a class="ds-button" data-variant="solid" href="#start">Start</a>
    </main>
  </body>
</html>
```

The generic API uses semantic names:

- `--ds-color-*` for color roles
- `--ds-font-*` for typography
- `--ds-radius-*`, `--ds-space-*`, and `--ds-shadow-*` for layout and surfaces
- `--ds-scroll` and `--ds-scene-*` for scroll-linked scenes
- `.ds-shell`, `.ds-container`, `.ds-panel`, `.ds-button`, and `.ds-eyebrow` for small primitives

It does not require React, Tailwind, a build step, or an animation package.

### 2. Choose a theme

Set `data-theme` on the root element:

```html
<html data-theme="ember">
```

Included presets:

- `graphite` — neutral violet and blue on charcoal
- `aigent` — The AIgent cyan and amber palette
- `ember` — warm orange and gold
- `cobalt` — blue and mint
- `paper` — light editorial palette

### 3. Add the motion module

```html
<script type="module">
  import {
    mountReveals,
    mountScrollScene,
    mountThemePicker
  } from "/modules/motion.js";

  mountScrollScene({
    progressMultiplier: 1.5,
    scale: 0.9,
    rotation: -64,
    brightness: [0.76, 1]
  });

  mountReveals();
  mountThemePicker();
</script>
```

The scroll-scene helper only writes semantic CSS variables. The scene can be:

- a CSS composition
- a Spline embed
- a video or frame sequence
- a Three.js canvas
- a WebGL shader
- a static image with subtle depth transforms

The content layer does not need to know which media technique is behind it.

## Make A Custom Theme

Override the RGB triplets and the derived semantic values update automatically:

```css
[data-theme="my-brand"] {
  color-scheme: dark;
  --ds-bg-rgb: 9 12 18;
  --ds-surface-rgb: 20 27 39;
  --ds-text-rgb: 246 248 252;
  --ds-accent-rgb: 255 90 140;
  --ds-accent-2-rgb: 255 205 92;
  --ds-color-accent-ink: #16040b;
}
```

Then select it:

```html
<html data-theme="my-brand">
```

Keep the triplets space-separated because the system uses them for alpha variants such as `rgb(var(--ds-accent-rgb) / 0.2)`.

## Architecture

```text
tokens/
  system.css          semantic tokens, theme presets, and generic primitives
  aigent-tokens.css   The AIgent preset plus compatibility aliases

modules/
  motion.js           scroll progress, scene transforms, reveals, theme picker

templates/
  modular-scroll-starter/
  free-design-stack/
  spline-scroll-landing/
  asset-scroll-gallery/

skills/
  aigent-3d-scroll-system/
  aigent-landing-page-polish/
  aigent-asset-gallery-system/

docs/
  design principles, cinematic playbooks, QA, publishing, and source intake
```

The layers are intentionally separate:

1. **Content** — copy, links, product data, and calls to action.
2. **Theme** — semantic tokens and typography.
3. **Scene** — video, 3D, WebGL, images, or CSS art.
4. **Motion** — small modules that map scroll and viewport state to CSS.
5. **Template** — the composition that joins those layers for one use case.

A reusable page should accept new copy, a new palette, and new media without rewriting its motion engine.

## Existing AIgent Compatibility

The original templates use `--aigent-*` tokens and `.aigent-*` classes. They remain supported through `tokens/aigent-tokens.css`.

For new work, prefer:

```html
<link rel="stylesheet" href="/tokens/system.css" />
```

Use the legacy entry only when adapting an existing AIgent-branded page:

```html
<link rel="stylesheet" href="/tokens/aigent-tokens.css" />
```

This keeps existing demos stable while the repository moves toward the neutral API.

## Choosing A Media Technique

Use the lightest technique that carries the idea:

| Technique | Use it when | Avoid it when |
| --- | --- | --- |
| CSS transforms | The scene is abstract or mostly decorative | Photoreal art direction is required |
| Spline | You need a fast interactive 3D scene | Bundle weight or mobile GPU limits are strict |
| Video scrub | You need controlled, photoreal cinematic direction | The source video cannot be encoded for seeking |
| Frame sequence | Exact frame control and mobile consistency matter | Asset size cannot be managed |
| Three.js/WebGL | The user must manipulate live geometry or lighting | A rendered sequence would tell the same story |

The design system does not force one renderer. It standardizes the page around the renderer.

## Video Scrub Rules

For smooth seeking:

- Prefer short MP4 files with frequent keyframes or all-intra encoding.
- Load the hero poster and loop first.
- Warm the first scrub clip on intent or delayed idle time.
- Warm later clips near their transition windows.
- Verify byte-range requests return `206` with `Accept-Ranges: bytes`.
- Do not hide a seeking problem by shipping blurry media.

The full production checklist is in `docs/cinematic-scroll-deck-playbook.md`.

## Agent Skills

Folders under `skills/` are operating instructions for Codex, Claude Code, and similar coding agents. They are not runtime dependencies.

Claude Code:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\aigent-asset-gallery-system "$HOME\.claude\skills\"
Copy-Item -Recurse .\skills\aigent-landing-page-polish "$HOME\.claude\skills\"
```

Codex:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\aigent-asset-gallery-system "$HOME\.codex\skills\"
Copy-Item -Recurse .\skills\aigent-landing-page-polish "$HOME\.codex\skills\"
```

A useful prompt:

```text
Use this repository as a cinematic web system.

Read docs/design-principles.md and the closest skill.
Start from templates/modular-scroll-starter.
Keep the ds-* token and motion APIs, but create a new visual identity,
new composition, and product-specific copy. Do not reproduce The AIgent palette
unless it fits the brand. Verify 1440px and 390px before calling it done.
```

## Quality Bar

Before publishing:

- The first viewport clearly explains what the page is and what action to take.
- Motion reveals, orients, compares, or rewards; it is not filler.
- The focal point remains intentional while the scene moves.
- Text stays readable over the brightest and busiest frame.
- `prefers-reduced-motion` produces a complete, usable page.
- Keyboard focus is visible.
- Links and controls are real, labeled, and reachable.
- Desktop and mobile have no horizontal overflow.
- The page is checked in a real browser, not judged from source alone.

## Adding A Reusable Pattern

Do not paste third-party templates or skill files directly into the repository.

1. Record the source in `docs/source-stack-intake.md`, or use `docs/animation-asset-intake.md` for large local packs.
2. Describe the transferable lesson in plain English.
3. Implement the smallest original token, module, template section, prompt, or QA rule that captures it.
4. Verify the license before vendoring anything.
5. Update `THIRD_PARTY.md` when external material is included directly.
6. Run `npm run check` and `npm run smoke`.

## Publishing

The templates are static:

1. Copy the chosen template into the target site.
2. Copy `tokens/system.css` and any imported modules.
3. Replace media and content.
4. Fix relative paths.
5. Confirm assets return `200`; scrub media should also support range requests.
6. Run desktop and mobile checks.
7. Deploy to any static host.

## Project Direction

This is an early `0.x` public kit. It is deliberately not a large component library.

Near-term work:

- migrate the remaining showcase pages from hard-coded brand values to the semantic token API
- extract only the motion patterns proven across at least two real pages
- add lightweight visual-regression captures for the starter and showcases
- add framework adapters after the static contracts stabilize

## License

MIT for AIgent-authored code and documentation.

Read `THIRD_PARTY.md` before publishing or redistributing imported media, Spline scenes, fonts, generated assets, or outside code.
