# Three.js

Use Three.js only when live geometry, shaders, lighting, particles, procedural state, or direct manipulation are part of the experience.

```bash
npm install three
```

Do not use Three.js for a single model that only needs orbit controls. Use `model-viewer` first.

Production order:

1. Optimize the GLB.
2. Build a complete static fallback.
3. Load the renderer after the first useful view.
4. cap pixel ratio
5. pause animation offscreen
6. provide reduced motion
7. test mobile GPU and memory

Read:

- `skills/threejs-web-scene/SKILL.md`
- `skills/web-3d-asset-pipeline/SKILL.md`
- `creative-production/pipelines/web-3d-assets.md`
