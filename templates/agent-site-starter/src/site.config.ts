/**
 * Site facts. This is the fact sheet the copy is written from (see the
 * aigent-design copy reference). Replace every value with the real product's
 * facts before writing new sections. Do not invent metrics, quotes, or logos.
 */
export const site = {
  name: "Your product",
  description:
    "An Astro starter wired to the Aigent design rules: tokens, a small section kit, one GSAP scroll story, and gates that run before you ship.",
  /** One of the themes in src/styles/tokens.css: graphite (neutral default), ember, cobalt, paper. */
  theme: "graphite",
  lang: "en",
  primaryAction: { label: "Read the build notes", href: "#build" },
  secondaryAction: { label: "See the scroll story", href: "#story" },
  /**
   * Optional Remotion hero loop. Off by default. Scaffold with --with-remotion,
   * render into public/media/, then set these paths. Leave null to keep the
   * static focal visual.
   */
  heroVideo: null as null | {
    desktop: string;
    mobile: string;
    poster: string;
    still: string;
  },
} as const;
