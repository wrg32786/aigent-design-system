# Optional Integrations

The neutral design system has no required animation, video, or 3D runtime. This directory documents opt-in tools.

Use the first rung that carries the requirement:

```text
native CSS / IntersectionObserver
    ↓ coordinated browser timeline
GSAP
    ↓ simple inspectable 3D object
model-viewer
    ↓ visually authored 3D scene
Spline
    ↓ custom live WebGL behavior
Three.js

build-time media
    ├── HTML-native website-to-video → HyperFrames
    ├── React/data-driven video → Remotion
    └── offline scene, lighting, or photoreal output → Blender
```

Build-time tools produce media consumed by the site. They should not become browser dependencies by accident.

## Integrations

| Tool | Primary role | Phase |
| --- | --- | --- |
| GSAP | Scroll and timeline choreography | Runtime |
| Three.js | Live interactive 3D | Runtime |
| model-viewer | Simple GLB, hotspots, AR | Runtime |
| Spline | Visual 3D authoring and embedding | Authoring + runtime |
| HyperFrames | HTML-native website-to-video and deterministic motion graphics | Build time |
| Remotion | React-driven programmatic rendered media | Build time |
| Theatre.js | Visual keyframe authoring | Authoring + runtime core |
| Rive | Interactive vector state animation | Authoring + runtime |
| React Three Fiber | Three.js in an existing React product | Runtime |

HyperFrames and Remotion overlap, but their durable source differs. Prefer HyperFrames when the input is already HTML, a website, or an agent-authored interface. Prefer Remotion when typed React compositions already own the production system.

Each subdirectory explains when the tool earns its cost, how to install it, and which repository skill owns the workflow.

Run:

```bash
npm run catalogs
```

No third-party source code is vendored here.
