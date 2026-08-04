# Media

Cinematic pages need one coherent asset system, not a collection of impressive files.

## Define the asset

Record:

- role in the argument or task
- subject and physical material
- camera, framing, focal point, and text-safe region
- start and end state
- loop, scrub, interaction, or still behavior
- desktop and mobile composition
- loading, failure, and reduced-motion state
- source, rights, attribution, and production path

## Medium ladder

Use the first rung that carries the idea:

1. still image
2. CSS motion
3. encoded video
4. frame sequence
5. `model-viewer`
6. Spline
7. Three.js
8. custom renderer

Fixed camera plus art direction usually favors Blender, AI video, or Remotion output over live 3D. Live 3D earns its cost when inspection, configuration, procedural state, geometry, or direct manipulation matters.

## Production

Route missing media through `creative-asset-director`.

- video: desktop, mobile, poster, reduced-motion, scrub export when needed
- 3D: source rights, Blender cleanup, GLB optimization, poster, bounded pixel ratio
- frame sequence: frame budget, compression, memory plan
- external component or asset: exact license and plan verification

Every public production asset gets a manifest. Keep raw generation records, signed URLs, credentials, and licensed source packages out of Git.

## Coherence test

The media family shares environment, camera language, material, grade, and transition logic. If the assets look like unrelated search results, the page has no world.
