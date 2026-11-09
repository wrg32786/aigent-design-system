import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Hero loop that echoes the static plates in src/components/Hero.astro.
 * Props carry the palette so the render matches the site tokens. Copy the
 * values from the active theme in src/styles/tokens.css. No text in the
 * video: headline and claims stay in the HTML.
 */
export type HeroLoopProps = {
  background: string;
  surface: string;
  accent: string;
  accent2: string;
  rule: string;
};

export const heroLoopDefaults: HeroLoopProps = {
  background: "rgb(27 28 25)",
  surface: "rgb(39 40 35)",
  accent: "rgb(220 105 72)",
  accent2: "rgb(111 166 151)",
  rule: "rgb(240 237 227 / 0.3)",
};

export const HeroLoop = ({ background, surface, accent, accent2, rule }: HeroLoopProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Full sine cycle per loop, so the last frame meets the first with no seam.
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const drift = Math.sin(phase);
  const tilt = interpolate(Math.cos(phase), [-1, 1], [-3, 3]);

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <div style={{ position: "absolute", inset: "10% 30% 38% 10%", background: accent, borderRadius: 6, transform: `translate(${drift * 24}px, ${drift * -16}px) rotate(${tilt}deg)` }} />
      <div style={{ position: "absolute", inset: "34% 8% 12% 34%", background: surface, border: `2px solid ${rule}`, borderRadius: 6, transform: `translate(${drift * -18}px, ${drift * 12}px)` }} />
      <div style={{ position: "absolute", inset: "70% 54% 8% 10%", background: accent2, borderRadius: 6, transform: `rotate(${-tilt}deg)` }} />
    </AbsoluteFill>
  );
};
