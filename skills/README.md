# Agent skills

## Recommended install

Use the consolidated project skill for new work:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-design-skill
```

It installs to `.claude/skills/aigent-design/` and routes pages, decks, interfaces, media, layout, typography, motion, critique, polish, extraction, and QA without loading every reference into context.

## Umbrella skill

| Skill | Owns |
| --- | --- |
| `aigent-design` | Direction → production → build → QA routing |
| `cinematic-studio` | Full cinematic production routing across the existing specialist skills |

`aigent-design` is the primary user-facing skill. `cinematic-studio` remains the specialist production router and compatibility entry point.

## Specialist production skills

| Skill | Owns |
| --- | --- |
| `cinematic-web-director` | Product context, surface mode, and visual direction |
| `creative-asset-director` | Asset medium, source, brief, and production route |
| `video-asset-pipeline` | Website video, posters, mobile and scrub exports |
| `web-3d-asset-pipeline` | 3D sourcing, Blender cleanup, and GLB optimization |
| `asset-provenance-audit` | Rights, attribution, manifests, and secret safety |
| `cinematic-site-qa` | Final browser and production QA |

## Runtime and motion skills

| Skill | Owns |
| --- | --- |
| `gsap-scroll-choreography` | Coordinated scroll and scene timelines |
| `threejs-web-scene` | Live Three.js and React Three Fiber scenes |
| `spline-web-scene` | Spline authoring, embedding, and optimization |
| `remotion-web-assets` | Programmatic rendered web media |
| `video-scrub-deck` | Guided and free-scroll video decks |

## Existing page-system skills

| Skill | Owns |
| --- | --- |
| `modular-scroll-page` | Brand-neutral cinematic starter |
| `cinematic-asset-gallery` | Neutral resource and gallery system |
| `aigent-3d-scroll-system` | The AIgent 3D and deck patterns |
| `aigent-landing-page-polish` | The AIgent conversion and polish rules |
| `aigent-asset-gallery-system` | The AIgent-branded gallery pattern |

The `aigent-*` specialist skills are intentionally brand-specific. Outside brands should enter through `aigent-design` and preserve their own visual authority.
