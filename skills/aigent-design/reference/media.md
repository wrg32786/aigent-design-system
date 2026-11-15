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
- **Renamed on replace.** When a photograph is swapped, the new file gets a new name. Sites often serve asset paths with a long immutable cache (`Cache-Control: max-age=31536000, immutable`), so a file replaced under the same name keeps showing the old image to returning visitors for up to a year. Scripts and styles under the same cache rule need a new URL too: one script changed in place left returning visitors running the old code with no error, and a query string works only if it changes on every edit.

## Films and live 3D in the page

Rules from review rounds on pages that loop films and run live scenes.

- **Loop forward, then back.** A plain `loop` jumps from the last frame to the first, so bake motion with no direction in time (a slow push-in, drifting fog, light on water) forward and then in reverse into the file (which doubles its length, so plan one continuous move with no cut). Motion that reads wrong backwards (walking, pouring, a falling drop) gets a cut at a matching frame or a short crossfade. Check the seam against neighbouring frames: one scored 0.78 SSIM against 0.99 between neighbours and jolted every cycle.
- **Films load and play only where they are seen.** Set a film's `src` when an IntersectionObserver reports its layer on screen, never as the page parses, or it loads and plays in a background tab or an unseen preview frame. Ship only the seconds a scrubbed film plays: one page's films showed a third of their length, so about 6 of their 9.5 MB was never seen. With scripting off, hide background films in a `<noscript>` style and show the poster in their place, because an autoplaying loop there plays forever with nothing to pause it, and a paused one gets the browser's native control bar across the stage.
- **The first screen loads first.** Give the first screen's image, or a `<link rel="preload" as="image">` for the first film's poster, `fetchpriority="high"` (video elements have no fetch priority), and hold later films' `src` until the first screen has painted: look-ahead loading that started later canvases at load left the first picture on its early pass for 11 seconds on a throttled connection. Show a scroll-revealed image only once `img.decode()` has resolved (`img.complete && img.naturalWidth` is the synchronous check that the file arrived), with a short fade, or a half-downloaded file draws from the top as a hard wipe; prefetch the rest in visit order unless `navigator.connection.saveData` is set.
- **Make `sizes` true.** A `sizes` attribute states the width the image is drawn at in each layout, zoom included, or the browser picks the wrong file: one close view stretched 750 pixels of a 1000px file across 1137 device pixels, and a phone at DPR 3 fetched a 2000px original for a slot about 200px wide. Check `currentSrc` at each window size and DPR, and where `sizes` cannot be true, drop it and ship the large file.
- **Live 3D falls back to a complete still page.** Headless checkers and some visitors render WebGL on the CPU, where one raymarched model took 1.6s a frame against 5ms on a GPU: time two small frames at mount (the second forced to finish with a one-pixel `readPixels`), and when they are too slow, show the still version, which must be a complete page that passes the checks on its own. Fall back the same way when a shader fails to compile (`renderer.debug.onShaderError` in three.js) or the context is lost, rebuild the layer after a loss, give the 2D fallback every state the GL path sets, and keep the still in the markup, hidden only by a state the swap sets (see the stills rule below). Test a forced context loss, a blocked library, and `--disable-webgl`, then judge the live version in a browser with the GPU on.
- **Frame a product model to a box of its own, from its own outline.** Where the model is the product on sale and must be seen whole, never fit its camera to a box that a headline or a price block sits over: give the model a box that starts below the text. Precompute support points of the mesh (the farthest vertex along a couple of hundred directions) and project them with the viewer's own camera. For model-viewer, the camera sits at the target plus the orbit's spherical offset; its vertical field of view is the attribute, widened when the box is narrower than the model's own ideal aspect, so check the projection against the viewer's hotspots (it should agree to a pixel). Solve the radius and a camera-target offset together, so the model is centred on its outline with room for its hotspots. Solve again on every resize and box change, against the largest outline over the model's whole turn (layout.md), so its size holds while it turns; re-solve every frame only when a change of scale is part of the move, as when each held view should fill the box. One page's toe-on end pose was cut flat by the box edge in 40 of 45 desktop windows until it was framed this way.
- **Stills hold a live model's stage until it earns the swap.** Render each view's still with the live camera's field of view and distance for the box it fills, so a uniform scale lands it on the live outline. Where one still has to serve boxes of different shapes, scaling it on each axis stretches the picture; check the stretch the way the jump is checked (scroll.md), the frame before the swap against the frame after (on one page, scaling on each axis closed a 24px jump to 3px). The two-frame probe at mount rules out a CPU renderer; once the model has loaded, a short probe gates the swap (sixteen frames, median under about 34ms). Hide the still from a state the swap sets, such as a class on the stage when the probe passes, not from the presence of a canvas: model-viewer draws into a canvas inside its own shadow root, so `:has(> canvas)` never matches its stage. With no WebGL, a software renderer named in `WEBGL_debug_renderer_info` (SwiftShader, llvmpipe), reduced motion or `saveData`, never import the viewer at all (model-viewer before 4.2.0, 3.5.0 among them, threw uncaught errors there; 4.2.0 and later log a WebGL error and draw nothing), and on a phone import it on the first scroll. The checkers render on the CPU, so say in the report that they judged the stills.
- **The buy box shows the product the stage showed.** A drawn stand-in at the point of sale reads as a different, cheaper product after a photoreal one. Render a still of each colourway from the model ahead of time, for the still path, and on the live model recolour the texture in a canvas and swap it in; let the swatch change the picture.

## Coherence test

The media family shares environment, camera language, material, grade, and transition logic. If the assets look like unrelated search results, the page has no world.
