# Browser iteration

This filename is retained for registry compatibility. The former Aigent Studio Canvas product has been removed.

For visual iteration, edit the real project source and treat the rendered browser as ground truth:

1. identify the smallest shared source owner for the requested change;
2. edit source directly rather than layering runtime patches;
3. preserve semantic structure, accessibility, and responsive intent;
4. render the real page;
5. inspect the changed viewport and relevant responsive states;
6. run Taste when the edit changes visible design language;
7. use Resolve for mechanical browser issues and Vision for visual judgment;
8. fix root causes rather than accumulating one-off overrides.

Do not create a parallel scene graph, patch journal, Canvas state file, or visual-editor source of truth.
