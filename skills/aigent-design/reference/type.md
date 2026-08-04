# Typography

Typography carries information, hierarchy, voice, and reading comfort.

## Roles before families

Define only the roles the surface needs:

- display
- section heading
- body
- label and control
- metadata
- data or code

Use the fewest families that make those roles unmistakable.

## Mode

- **Persuade + Experience:** display type may carry identity. It still must fit real copy and mobile.
- **Operate + Read:** scanability and measure lead. One well-tuned family is often correct.
- **Dense UI:** use a fixed rem scale with a tighter ratio.
- **Long-form:** keep prose near 45–75ch and tune leading to width and face.

## Selection

Use `design-intelligence/type-systems.json` as a starting catalog, not a default picker.

Choose faces like objects from the selected world. Avoid the training-data reflexes unless the brief earns them:

- Inter or a system font as expressive display
- tech product automatically receiving a geometric sans plus mono
- premium product automatically receiving a high-contrast serif
- dark site automatically receiving ultra-tight all-caps labels

## Apply

- Body ordinarily starts at 1rem / 16px.
- Light text on dark surfaces may need slightly more leading, tracking, or weight.
- Display tracking does not go tighter than `-0.04em`.
- Load only used weights and scripts.
- Provide useful fallbacks and avoid invisible text.
- Use tabular numerals for comparable data.
- Stress long headings, localization, zoom, narrow containers, and fallback fonts.
- Do not animate type axes without a reason tied to the world or content.

## Verify

Hierarchy is obvious without reading the words. Body copy remains comfortable, controls remain stable, and font loading does not create disruptive reflow.
