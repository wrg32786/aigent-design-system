# Assets

This repository stores web delivery assets and provenance records, not production workstations.

## Directory contract

```text
assets/
  manifests/          source, rights, production, and output records
  source/             ignored local working files
  web/
    models/           optimized GLB and related public files
    video/            optimized new video outputs
    textures/         web texture outputs
    posters/          poster and reduced-motion images
    sequences/        approved frame sequences
  video/              existing design-system demonstration clips
```

The existing `assets/video/` path remains for compatibility with the cinematic showcase. New projects should use role-specific paths under `assets/web/`.

## Commit

Commit only what the public page needs:

- compressed GLB
- encoded MP4/WebM
- posters
- web textures
- deliberately bounded frame sequences
- manifests

## Keep outside Git

- `.blend`
- FBX, OBJ, USD source exchanges
- EXR masters
- raw image sequences
- editor caches
- downloaded marketplace packages
- uncompressed footage
- private generation records
- receipts and billing data
- customer source assets

Use object storage, a private asset library, or local production storage for masters.

## Manifests

Copy:

```text
assets/manifests/example.asset-manifest.json
```

Set `exampleOnly` to `false`, replace every source and output value, and save it under the asset ID.

Run:

```bash
npm run assets
```

The checker validates structure, output paths, file existence for real manifests, declared byte counts, budget warnings, and basic secret safety.
