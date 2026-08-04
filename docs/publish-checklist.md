# Publish Checklist

## Product and direction

- `PRODUCT.md` and `DESIGN.md` reflect the project.
- The surface mode is explicit.
- The first viewport is clear.
- The media has a job.
- The page has one signature motion idea.

## Assets

- Every production asset has a manifest.
- Commercial use is resolved.
- Attribution is present where required.
- Desktop, mobile, poster, and reduced-motion outputs exist where applicable.
- Source masters and private records are outside Git.
- No credentials, signed URLs, customer data, or personal billing records are public.
- Asset budget overrides are recorded.
- Video and GLB files are optimized.
- Scrub media supports byte ranges.

## Page

- Semantic content works without rich media.
- Loading and failure states exist.
- Keyboard focus is visible.
- Touch targets are usable.
- No autoplay audio.
- Reduced motion preserves all content and actions.
- Desktop and mobile have no horizontal overflow.
- Real copy is tested at 200% zoom.

## Commands

```bash
npm run catalogs
npm run assets
npm run audit -- path/to/page path/to/shared.css
npm run check
npm run smoke
```

## Public repository

- Third-party notices are current.
- Demo assets are intentionally public.
- Links point to official sources.
- Commit and pull-request titles are plain and product-facing.
- No agent names, private task context, local paths, or internal operating notes appear in public history.
