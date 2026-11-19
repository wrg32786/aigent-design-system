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
- **Long-form:** keep prose near 45 to 75ch and tune leading to width and face.

## Selection

Use `design-intelligence/type-systems.json` as a starting catalog, not a default picker.

Choose faces like objects from the selected world. Avoid the training-data reflexes unless the brief earns them:

- Inter or a system font as expressive display
- tech product automatically receiving a geometric sans plus mono
- premium product automatically receiving a high-contrast serif
- dark site automatically receiving ultra-tight all-caps labels

## Pairing

On a Persuade or Experience surface, pair one loud display face with one quiet partner. The loud face can be a wide or condensed bold, a serif italic, or a script. The partner carries body, labels, and controls. Add a mono only when the page shows code or measurements.

When you build a set of sites (a portfolio, a template library, one client's sub-brands), give each site its own pairing and repeat none. Restraint checks reward safe pairs, so a set drifts toward a plain grotesk over a mono that nobody chose. In one library of 24 demo sites, five used DM Mono and four used Hanken Grotesk. Keep a list of the pairings already used and read it before choosing. Build it from the faces each page actually loads after its scripts run, not only from its font link, and count a superfamily as one design.

Free pairings that hold up, all on Google Fonts:

| Display | Partner | What it gives |
| --- | --- | --- |
| Archivo Black | Literata | heavy grotesk over a reading serif |
| Gloock | Bricolage Grotesque | a sharp display serif over a sans with character |
| Michroma | Cardo | wide technical caps over an old-style serif |
| Pirata One | Nunito Sans | blackletter over a soft sans |
| Ribeye | Plus Jakarta Sans | a decorative display face over a clean sans |
| Red Hat Display | Red Hat Mono | one superfamily, for a page that shows code or data |

Free stand-ins for commercial styles:

| Commercial style | Free stand-in | Body set in |
| --- | --- | --- |
| wide heavy grotesk over a neutral sans | Dela Gothic One with Inter | Inter |
| elegant serif with a script | Bodoni Moda with Pinyon Script | Bodoni Moda; the script takes display lines only |
| condensed serif italic over a text serif | Newsreader italic with Literata | Literata |
| bold sans with a script | Figtree Black with Great Vibes | Figtree Regular; the script takes display lines only |

[Fonttrio](https://www.fonttrio.xyz/) lists curated heading, body, and mono trios with an install command. Use it the way you use `type-systems.json`, as a catalog to choose from.

A type pass resets the scale, tracking, and line height for the new faces. If you swap family names inside the old scale, a wide face overflows its measure and a condensed one sits loose in leading set for a different face. Re-measure everything else the old metrics were tuned for: line masks (one cut 2 to 3.4px off the descenders), figures (oldstyle ones dropped price digits below the baseline, so set `font-variant-numeric: lining-nums`), any `line-height: normal`, and every label in a fixed box. Request every weight and style the page renders, in the script loader and in a `<noscript>` link, then check each element's rendered face for fallbacks and synthetic bold or italic (`font-synthesis: none` stops the faking).

## Apply

- Body ordinarily starts at 1rem / 16px.
- Light text on dark surfaces may need slightly more leading, tracking, or weight.
- Display tracking does not go tighter than `-0.04em`.
- Load only used weights and scripts.
- Provide useful fallbacks and avoid invisible text.
- Use tabular numerals for comparable data. A single counting figure set large takes proportional lining figures (`font-variant-numeric: proportional-nums lining-nums`): tabular figures set 11.0 as "1 1.0" in one slab, and proportional figures alone came out oldstyle in that face (Zilla Slab), so the tails of 3, 4, 5, 7 and 9 crossed the label under the count.
- Stress long headings, localization, zoom, narrow containers, and fallback fonts.
- Do not animate type axes without a reason tied to the world or content.

## Measure and fit

Measure text only after its faces have loaded. `document.fonts.ready` and `document.fonts.status` can report done before a stylesheet's faces exist, and `document.fonts.load()` for a face not yet declared resolves at once with an empty list, so a box measured then belongs to the fallback face: one headline wrapped to an extra line and pushed its button 84px down. Wait for the font stylesheet's own load event (or the loader's callback), then call `document.fonts.load()` for each face and size the layout is fitted against, treat an empty result as not loaded, and refit from a `ResizeObserver` on the fitted text. Give each web face a fallback face of the same kind with matched metrics (`size-adjust`, `ascent-override`), so the first paint and the final layout agree. Measure a word only once the class that displays it is on, too. One layout pass ran in a promise just before the class that shows a giant word was added, so it read the word at 0 x 0, its overlap test always passed and its mask fell back to the default; whenever the fonts arrived before the picture, the word lay across the sentence on a phone held sideways. Add the class first and lay out after it, and test the load order by holding the page's images back 2s.

Size display type from its longest word, against its container rather than the viewport: if `overflow-wrap: break-word` fires on desktop, the size or the container is wrong (one heading broke after "commissi" from 1280 to 1920 wide). Size a word meant to span the width, such as a wordmark, in container units (`cqi`), and check that it stops at the gutter on both sides at 390, 375, 360, and 320.

## Verify

Hierarchy is obvious without reading the words. Body copy remains comfortable, controls remain stable, and font loading does not create disruptive reflow.
