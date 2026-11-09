/**
 * Scroll story: one pinned GSAP timeline for one sequence.
 *
 * Follows skills/gsap-scroll-choreography:
 * - one inspectable timeline with labels, not scattered triggers
 * - content is readable before it leaves; reverse travel restores state
 * - mobile does not inherit desktop distances (no pin under 861px)
 * - reduced motion keeps every chapter available (no enhancement at all)
 * - transforms and opacity only; everything is reverted on teardown
 *
 * GSAP is an npm dependency under its own Standard "No Charge" license.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function mountScrollStory(root: ParentNode = document): () => void {
  const section = root.querySelector<HTMLElement>("[data-scroll-story]");
  const stage = section?.querySelector<HTMLElement>("[data-story-stage]");
  if (!section || !stage) return () => undefined;

  const chapters = gsap.utils.toArray<HTMLElement>("[data-story-chapter]", section);
  const layers = gsap.utils.toArray<HTMLElement>("[data-story-layer]", section);
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 861px) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      if (!context.conditions?.desktop || chapters.length < 2) return;
      section.classList.add("is-enhanced");

      // First chapter is visible at rest; later chapters wait off-stage.
      gsap.set(chapters.slice(1), { autoAlpha: 0, y: 28 });

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out", duration: 1 },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${window.innerHeight * chapters.length * 0.9}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      timeline.addLabel("chapter-1").to({}, { duration: 0.6 });
      chapters.slice(1).forEach((chapter, index) => {
        const previous = chapters[index];
        const label = `chapter-${index + 2}`;
        timeline
          .addLabel(label)
          .to(previous, { autoAlpha: 0, y: -28, duration: 0.4 }, label)
          .fromTo(chapter, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.5 }, `${label}+=0.45`)
          .to(layers, { x: (i) => (i - 1) * 18 * (index + 1), y: (i) => (1 - i) * 14 * (index + 1), rotate: (i) => (i - 1) * 2 * (index + 1) }, label)
          .to({}, { duration: 0.6 });
      });

      return () => section.classList.remove("is-enhanced");
    },
  );

  return () => mm.revert();
}
