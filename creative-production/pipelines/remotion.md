# Remotion Web Asset Pipeline

Remotion is an optional build-time renderer for media assets. The website should normally consume its rendered video or images rather than shipping Remotion in the browser.

## Use Remotion when

- one composition must render desktop, mobile, social, and poster variants
- product data or code drives the visual
- titles, diagrams, charts, or UI demonstrations need exact timing
- reusable transitions and branded loops should share one source
- an agent should be able to regenerate outputs deterministically

## Avoid Remotion when

- a short hand-edited clip is faster
- the visual depends mainly on live 3D manipulation
- the project would adopt React only for a single static asset

## Project shape

Keep the project isolated:

```text
integrations/remotion/
  README.md

your-render-project/
  package.json
  src/
  public/
  renders/
```

Create a project from the official starter:

```bash
npx create-video@latest
```

## Output contract

A composition intended for a website should render:

- desktop video
- mobile video
- poster image
- reduced-motion still
- optional transparent or alpha-supporting variant where the codec and browser plan justify it
- manifest describing the source and outputs

## Render principles

- use the final page type and colors
- keep important content inside mobile-safe bounds
- avoid tiny UI text in video
- render clean masters before final web compression
- keep audio off unless the site explicitly asks the visitor to enable it
- preserve deterministic inputs and versioned composition settings

## License

Remotion's current license is free for individuals and companies with up to three people. Larger companies generally require a company license. Verify the current terms before adoption.
