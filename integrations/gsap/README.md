# GSAP

Use GSAP for coordinated timelines: pinned chapters, video scrub state, scene handoffs, and copy that must land on exact visual beats.

```bash
npm install gsap
```

Start with native CSS and `modules/motion.js`. Add GSAP when one shared timeline is materially simpler than several independent observers.

For a ready example, `templates/agent-site-starter/src/scripts/scroll-story.ts` pins one sequence with one timeline, skips the pin on phones, and does nothing under reduced motion.

Read:

- `skills/gsap-scroll-choreography/SKILL.md`
- `skills/video-scrub-deck/SKILL.md`
- `docs/cinematic-scroll-deck-playbook.md`

The official GSAP agent-skills repository (`npx skills add https://github.com/greensock/gsap-skills`) is a useful tool-specific reference. This repository's skill stays focused on art direction, page state, and production QA rather than duplicating GSAP documentation.

Current official guidance states that GSAP and its plugins are free, including commercial use. GSAP is not MIT: it ships under its own [Standard "No Charge" License](https://gsap.com/standard-license), which bars use in no-code visual animation builders that compete with Webflow. Install it from npm rather than vendoring it, and recheck the license before distribution.
