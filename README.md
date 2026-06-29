# AIgent Design System

Premium AI-native web design patterns, 3D scroll templates, and agent skills from The AIgent.

This repo is a free 3D web skill kit for AI builders. It packages working output demos, reusable CSS tokens, static templates, and installable agent skills that help Codex, Claude Code, and similar agents build premium scroll-driven websites.

## What Is Inside

- `tokens/aigent-tokens.css` - the shared type, color, spacing, motion, and surface tokens.
- `templates/spline-scroll-landing` - a working Spline + GSAP 3D landing page demo.
- `templates/asset-scroll-gallery` - a working scroll-driven resource/gallery demo.
- `skills/` - Codex/Claude-compatible skills for using the system with AI agents.
- `docs/` - product framing, design principles, 3D scroll playbook, mobile QA, and skill intake rules.

## Quick Start

```bash
npm run serve
```

Then open:

- `http://127.0.0.1:4177/templates/spline-scroll-landing/`
- `http://127.0.0.1:4177/templates/asset-scroll-gallery/`

The templates are static HTML. No build step is required.

## Install The Skills

Copy any folder under `skills/` into your agent skills directory.

Claude Code style:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.claude\skills\"
```

Codex style:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills"
Copy-Item -Recurse .\skills\aigent-3d-scroll-system "$HOME\.codex\skills\"
```

## Product Position

This is a free taste layer for AIgent OS and Pantheon:

1. Give away the visual operating system.
2. Teach builders how to direct agents toward better taste.
3. Create trust before selling deeper harnesses, workflows, and automation systems.

The goal is not to ship a bloated component library. The goal is to package judgment: what to use, when to use it, what to avoid, and how to verify the output on real screens.

## Core Rules

- Build the usable page first, not a marketing shell.
- Use immersive media for websites and tools, not decorative filler.
- Keep text brief and plain.
- Animate with purpose: reveal, orient, compare, or reward.
- Verify desktop and mobile before calling anything done.
- Prefer static, copyable templates until a project truly needs a framework.

## Status

Early public kit. The templates are intentionally small and readable. Future releases can add Blender frame-sequence examples, React/Next starters, and screenshot-based visual QA scripts.

## License

MIT for AIgent-authored code and docs. See `THIRD_PARTY.md` before publishing or redistributing any imported third-party material.
