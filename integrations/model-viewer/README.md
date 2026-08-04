# model-viewer

Use Google's `model-viewer` for a single GLB with orbit controls, hotspots, camera presets, or AR.

```bash
npm install @google/model-viewer
```

It is the preferred first rung before Three.js because it solves the common product-object case with less code and a smaller maintenance surface.

A complete implementation includes:

- poster
- loading and error state
- meaningful alt text or adjacent description
- camera controls that do not trap keyboard users
- mobile asset or still fallback
- optimized GLB
- provenance manifest

Read `skills/web-3d-asset-pipeline/SKILL.md`.
