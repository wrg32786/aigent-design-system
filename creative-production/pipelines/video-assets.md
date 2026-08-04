# Video Asset Pipeline

## 1. Acquire or generate against a brief

Do not download ten vaguely relevant clips. Select one visual family and record every source.

## 2. Edit the master

Use DaVinci Resolve, Blender, Remotion, or another editor to:

- establish the approved duration
- remove hard cuts from loop candidates
- stabilize or reframe when needed
- grade for the page's text contrast
- composite effects
- create desktop and mobile crops
- remove audio unless it is intentionally user-controlled

Keep the source master outside the public repository.

## 3. Export web variants

Example H.264 ambient export:

```bash
ffmpeg -i master.mov \
  -an \
  -vf "scale='min(1920,iw)':-2:force_original_aspect_ratio=decrease,format=yuv420p" \
  -c:v libx264 -preset slow -crf 21 \
  -movflags +faststart \
  hero-desktop.mp4
```

Create a mobile crop intentionally rather than relying on desktop `object-fit`:

```bash
ffmpeg -i master.mov \
  -an \
  -vf "scale=1080:-2,crop=1080:1350,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 \
  -movflags +faststart \
  hero-mobile.mp4
```

Create a poster:

```bash
ffmpeg -ss 00:00:01 -i hero-desktop.mp4 -frames:v 1 -q:v 3 hero-poster.jpg
```

Optional VP9/WebM alternative:

```bash
ffmpeg -i master.mov -an \
  -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -row-mt 1 -deadline good \
  hero-desktop.webm
```

## 4. Scrub-ready encoding

Scroll scrubbing requires frequent random access.

Start with a short GOP:

```bash
ffmpeg -i master.mov \
  -an -c:v libx264 -preset slow -crf 20 \
  -g 12 -keyint_min 12 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart \
  scene-scrub.mp4
```

For exact frame access and an acceptable file size, test all-intra:

```bash
ffmpeg -i master.mov \
  -an -c:v libx264 -preset slow -crf 20 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart \
  scene-scrub-intra.mp4
```

Do not choose an all-intra export blindly. Compare size, seek behavior, and visible quality in the target browser.

## 5. Delivery

- preload the poster
- load the first needed clip on intent or delayed idle
- warm later scenes near their transition
- set explicit dimensions or aspect ratio
- provide a reduced-motion poster
- verify byte-range requests for scrub media
- avoid downloading every scene on first paint

## 6. Record and check

Create a manifest under `assets/manifests/`, then run:

```bash
npm run assets
```
