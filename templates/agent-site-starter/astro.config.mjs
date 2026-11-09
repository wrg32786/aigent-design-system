// @ts-check
import { defineConfig } from "astro/config";

// Static output keeps the site deployable through the publish-site skill
// (local export, Netlify, Vercel, or Cloudflare Pages) with no server runtime.
export default defineConfig({
  output: "static",
  // Set this to the production origin before you ship so canonical URLs are correct.
  site: "https://example.com",
  build: { format: "directory" },
});
