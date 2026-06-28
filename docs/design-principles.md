# Design Principles

## Build The Experience First

The first screen should be the product, tool, or artifact. Avoid landing-page filler when the user asked for an app, list, gallery, or usable experience.

## Keep The Language Human

Use short lines. Avoid jargon unless the audience already knows it. Translate technical labels into outcomes:

- "browser automation" becomes "AI can operate websites for you"
- "RAG" becomes "AI searches your own docs before answering"
- "MCP" becomes "connects the agent to tools"

## Use 3D As Orientation, Not Decoration

3D should make the page feel like a place the user moves through. It should not fight the copy. Good uses:

- background motion that tracks scroll progress
- camera movement between chapters
- object reveals for key transitions
- subtle lighting changes that make sections feel alive

Bad uses:

- random floating objects with no story
- busy animation behind small text
- scroll effects that finish long after the content ends

## Motion Rules

- Reveal content when it is readable, not when it is already leaving the viewport.
- On mobile, trigger earlier.
- Use one motion idea per section.
- Keep hover effects responsive and restrained.
- Honor `prefers-reduced-motion`.

## Premium Surface Rules

- Use fewer, better cards.
- Use 8-16px radii depending on density.
- Use thin borders plus glow only where emphasis is needed.
- Use stable button dimensions so price changes do not cause layout shift.
- Do not nest cards inside cards.

## Mobile Rules

- Sticky nav is allowed, but secondary sticky headers usually are not.
- Center the active nav chip.
- Make cards visible before the user reaches the section midpoint.
- Keep copy at least 16px body size.
- Test at 360px width and on a real phone when possible.
