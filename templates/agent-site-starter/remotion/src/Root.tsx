import { Composition } from "remotion";
import { HeroLoop, heroLoopDefaults } from "./HeroLoop";

// One composition, two aspect ratios. Keep durations equal so the loops match.
const fps = 30;
const durationInFrames = 6 * fps;

export const Root = () => (
  <>
    <Composition id="HeroLoopDesktop" component={HeroLoop} width={1600} height={2000} fps={fps} durationInFrames={durationInFrames} defaultProps={heroLoopDefaults} />
    <Composition id="HeroLoopMobile" component={HeroLoop} width={1080} height={1350} fps={fps} durationInFrames={durationInFrames} defaultProps={heroLoopDefaults} />
  </>
);
