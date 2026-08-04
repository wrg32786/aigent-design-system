# Optional Integrations

The neutral design system has no required animation or 3D runtime. This directory documents opt-in tools.

Read `catalog.json` or use this sequence:

```text
native CSS / IntersectionObserver
    ↓ when coordinated timeline is required
GSAP
    ↓ when a simple model must be inspected
model-viewer
    ↓ when a visually-authored 3D scene is justified
Spline
    ↓ when custom live WebGL behavior is required
Three.js
```

Build-time tools such as Remotion and Blender produce media consumed by the site. They should not become browser dependencies by accident.

## Integrations

| Tool | Primary role | Phase |
| --- | --- | --- |
| GSAP | Scroll and timeline choreography | Runtime |
| Three.js | Live interactive 3D | Runtime |
| model-viewer | Simple GLB, hotspots, AR | Runtime |
| Spline | Visual 3D authoring and embedding | Authoring + runtime |
| Remotion | Programmatic rendered media | Build time |
| Theatre.js | Visual keyframe authoring | Authoring + runtime core |
| Rive | Interactive vector state animation | Authoring + runtime |
| React Three Fiber | Three.js in an existing React product | Runtime |

Each subdirectory explains when the tool earns its cost, how to install it, and which repository skill owns the workflow.

Run:

```bash
npm run catalogs
```

No third-party source code is vendored here.
