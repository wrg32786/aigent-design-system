# Canvas

Use this reference when work originates in AIgent Studio's DOM-backed visual canvas.

## Source of truth

The real project source remains authoritative. `.aigent/studio/canvas.json` is a reversible operator-intent layer applied to the rendered DOM.

## Direct edits

- preserve selected element identity and semantic role;
- use base, tablet, and mobile overrides intentionally;
- treat multi-selection as one coherent edit group;
- prefer tokens and shared layout primitives over one-off values;
- use project components for genuinely repeated sections;
- keep inline text, attributes, and accessibility labels synchronized.

## Distillation

When asked to distill the Canvas journal:

1. map every operation to its shared source owner;
2. fold repeated values into tokens or component rules;
3. preserve breakpoint behavior;
4. remove accidental overrides rather than copying them blindly;
5. verify the real rendered result;
6. leave the journal intact for operator comparison.

## Collaboration

Element comments are unresolved operator authority. Presence and remote selections provide context, not design authority. Checkpoints are local review states and must remain reversible.
