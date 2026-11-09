# Optional hero loop (Remotion)

Off by default. This folder is an isolated Remotion project that renders the hero loop as ordinary web media. The site never imports Remotion or React; it plays the MP4 files.

Follows `recipes/remotion-hero-loop` and the `remotion-web-assets` skill in the Aigent repository.

```bash
cd remotion
npm install
npm run studio     # preview
npm run render     # desktop + mobile MP4, poster, reduced-motion still, manifest -> ../public/media
```

Then set `heroVideo` in `../src/site.config.ts` to the paths the render step prints. Before shipping, check the loop seam, the poster, the mobile crop, and the reduced-motion still on the real page. Re-encode with FFmpeg if the files are heavy (see the Aigent video pipeline docs).

## License

Remotion is **not MIT**. It is installed from npm under the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md): free for individuals, for-profit organizations with up to three employees, non-profits, and evaluation; larger for-profit companies need a [company license](https://www.remotion.pro/license). Confirm eligibility before using this folder. No Remotion source is copied here. For tool-level guidance, the official Remotion agent skills are optional: `npx skills add remotion-dev/skills`.
