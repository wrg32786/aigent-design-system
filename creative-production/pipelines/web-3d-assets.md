# Web 3D Asset Pipeline

## 1. Source or generate

Start with a licensed model, an owned source file, or a recorded generation. Preserve the source record before editing.

## 2. Clean in Blender

- set scale and orientation
- place the pivot deliberately
- remove hidden and duplicate geometry
- fix normals
- merge unnecessary objects
- remove unused materials
- reduce material slots
- trim animation clips
- simplify topology while preserving silhouette
- bake procedural materials when the browser runtime cannot reproduce them

## 3. Prepare textures

- use one UV set unless the runtime needs more
- use 1K or 2K textures by default
- reserve 4K for a justified close-up
- combine channels where the runtime supports it
- convert to WebP or KTX2 when appropriate
- inspect alpha edges and normal maps after compression

## 4. Export GLB

Prefer GLB for a self-contained web asset. Confirm:

- transforms are applied
- only required animations are exported
- cameras and lights are included only when the runtime uses them
- material names are clear
- the model opens in a neutral viewer

## 5. Optimize

Install glTF Transform:

```bash
npm install --global @gltf-transform/cli
```

Run a baseline optimization:

```bash
gltf-transform optimize source.glb model.glb --compress meshopt
```

Inspect the result. More compression is not automatically better. Compare silhouette, texture detail, normals, animation, and load time.

## 6. Choose the viewer

Use `model-viewer` first for:

- orbit controls
- one object
- hotspots
- simple AR

Use Three.js for:

- custom shaders
- procedural motion
- coordinated objects
- scene-level scroll choreography
- material configuration
- live lighting or particles

## 7. Mobile fallback

Possible fallbacks:

- lower-poly GLB
- reduced texture set
- disabled post-processing
- poster image
- short turntable video

The fallback must preserve the page's meaning and action.

## 8. Manifest and verify

Record source, license, production tool, outputs, variants, and override reasons. Run:

```bash
npm run assets
```
