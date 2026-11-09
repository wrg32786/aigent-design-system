# Remotion

Use Remotion to render deterministic web media: hero loops, product diagrams, title sequences, posters, transitions, and multiple aspect ratios.

```bash
npx create-video@latest
```

Keep the render project isolated. The website usually consumes the rendered MP4, WebM, PNG, or sequence; it does not need Remotion or React at runtime.

Read:

- `skills/remotion-web-assets/SKILL.md`
- `creative-production/pipelines/remotion.md`
- `recipes/remotion-hero-loop/README.md`

The official Remotion agent skills are an optional install: `npx skills add remotion-dev/skills`. `templates/agent-site-starter` includes an optional hero-loop project (`create-site --with-remotion`).

Remotion's current license is free for individuals and companies with up to three people. Larger companies generally require a company license. Recheck before adoption.
