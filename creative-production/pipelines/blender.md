# Blender to Web

Blender can produce either a browser model or pre-rendered media. Decide before building the whole scene.

## Export live 3D when

- the visitor must inspect or manipulate the object
- procedural state matters
- camera response is part of the product
- the model can meet the browser budget

## Render media when

- art direction and lighting matter more than manipulation
- the camera path is fixed
- photoreal materials are expensive in real time
- mobile consistency matters
- the scene would require a large runtime

## Live model route

```text
model and material
→ reduce geometry
→ bake unsupported materials
→ export GLB
→ glTF optimization
→ model-viewer test
→ Three.js only if needed
```

## Rendered route

```text
scene and camera
→ master image sequence
→ edit or composite
→ MP4/WebM or frame sequence
→ poster and mobile variant
→ browser integration
```

Render an image sequence for important work. It preserves restartability and gives more control over encoding than rendering directly to a delivery video.

## Camera and text-safe composition

Before the final render:

- place the actual page copy over a frame capture
- confirm the focal point does not collide with the copy
- test desktop and mobile crops
- verify the first and last frame
- define whether the scene loops, scrubs, or plays once
- remove detail that will be invisible after compression

## Repository rule

Keep `.blend`, EXR, source image sequences, caches, and large intermediate renders outside Git. Commit optimized public outputs and a safe manifest.
