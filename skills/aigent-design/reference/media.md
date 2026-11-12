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

For rendered media, choose the source that matches the project:

- **HyperFrames:** existing website, HTML interface, agent-authored product tour, README walkthrough, or open-source deterministic video route;
- **Remotion:** React-first typed composition or an existing Remotion production system;
- **Blender / AI video:** fixed camera, photoreal lighting, or offline cinematic scene;
- **direct capture:** literal interaction documentation where authored motion and reusable variants add no value.

Fixed camera plus art direction usually favors Blender, AI video, HyperFrames, or Remotion output over live 3D. Live 3D earns its cost when inspection, configuration, procedural state, geometry, or direct manipulation matters.

## Production

Route missing media through `creative-asset-director`.

- video: desktop, mobile, poster, reduced-motion, scrub export when needed
- website-to-video: `hyperframes-video` plus the official upstream HyperFrames skills
- React programmatic media: `remotion-web-assets`
- 3D: source rights, Blender cleanup, GLB optimization, poster, bounded pixel ratio
- frame sequence: frame budget, compression, memory plan
- external component or asset: exact license and plan verification

Every public production asset gets a manifest. Keep raw generation records, signed URLs, credentials, and licensed source packages out of Git.

## Stand-in photography

When the client has no photographs yet, stand-ins hold the slots until theirs arrive. They still ship to real visitors, so:

- **Licensed only.** CC0, public domain, CC BY 4.0, or the Unsplash License. No share-alike licence, and no "free" site whose terms you have not read.
- **Credited.** Each photograph's author, source, and licence go on a credits page linked from the footer, even where the licence does not require it. That page is also the list of slots the client's own photographs replace.
- **Graded as one set.** Stand-ins from different photographers read as different shoots. Match lightness, contrast, and colour temperature across the page. In one measured case, two stand-ins on the same page averaged 0.67 and 0.22 lightness, and they read as two shoots.
- **True to the copy.** Each photograph shows what its line of copy says. A line about a night repair under floodlights does not get a daylight harbour.
- **Renamed on replace.** When a photograph is swapped, the new file gets a new name. Sites often serve asset paths with a long immutable cache (`Cache-Control: max-age=31536000, immutable`), so a file replaced under the same name keeps showing the old image to returning visitors for up to a year.

## Coherence test

The media family shares environment, camera language, material, grade, and transition logic. If the assets look like unrelated search results, the page has no world.
