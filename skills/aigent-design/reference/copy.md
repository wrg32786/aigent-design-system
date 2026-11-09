# Copy

Load when writing or reviewing the words on a page. Layout can be strong and the surface still reads as generated if the copy does.

Adapted from `leonxlnx/taste-skill` and `nutlope/hallmark` (both MIT). See `../NOTICE.md`.

## Why model copy reads as model copy

The obvious slop words are only the first layer. The newer tell is good-sounding copy used the same way on every page:

- one voice for every client: warm, wry, modest, faintly literary, ending each paragraph on a deadpan twist
- the same devices in every section: headings in two fragments ("Short menu. Long list of regulars."), "X, not Y", "No X. No Y.", a strip of three round figures
- sincerity claimed instead of shown: honest, calm, quiet, simply, carefully, thoughtfully
- detail invented to look specific: a batch number, a minute of the morning, a percentage nobody measured

The cause is missing input. With no facts, a model fills a template with plausible inventions. **The fix is facts and decisions, never synonyms.** Swapping a slop word for its synonym produces the next tell.

## 1. The fact sheet

Before the first sentence, collect what the brief, the repo, and the existing site actually say:

| Field | Feeds |
| --- | --- |
| what it is, in one plain sentence | the headline and its support line |
| who it is for, and who it is not for | the headline, one FAQ line |
| what people do today instead | the pain line, the comparison |
| the true difference, with its proof | the claims worth a heading |
| customer words from reviews, emails, quotes | the pain line, headings |
| numbers, each with its source | sentences, a facts strip |
| odd true details: history, an object, a ritual, an awkward fact | the texture you would otherwise invent |
| one limit: what it does not do, who it is wrong for | one admission per page |
| one enemy: a habit or category, never the reader | the pain line |
| the offer: price, trial, booking terms, the one action | buttons and the close |

An empty field stays empty. Its section shrinks or goes, and the handoff names what the owner should supply. Never a bracketed placeholder or "coming soon" on the page.

## 2. The voice card

Pick one register from the buyer, the price, and the client's real character, and write it into the direction (never onto the page):

```text
Voice: technical-dry
Pairs: exact, not cold; sure, not loud
Person: "you" for what the buyer gets, "we" for the work
Sentences: mostly 8 to 16 words; one long one per section where it explains
Humour: none in the hero, prices, or FAQ
House words: the brief's own nouns, the same word every time
Never: virtue words about ourselves, a pun on the name, a strip of claims
```

- The client's own writing overrides the menu.
- Picture the voice on nine businesses in other trades. If it fits them, push it further toward this one.
- Voice holds; tone moves. Hero and story carry the most voice. Prices, FAQ, forms, and errors go plain and kind.

## 3. Shape from the reader's questions

Readers ask, roughly in order: what is this, is it for me, why believe you, how does it work, what does it cost, what if it goes wrong, what do I do now. Where they start depends on what they already know: unaware readers open on a moment they recognise, comparers open on the mechanism, existing customers open on the offer.

A section exists only if there is true material for it. Counts follow the content: four real features are four items, one quote is one quote, zero testimonials is a normal page.

## 4. Draft

- facts where adjectives want to go; a claim of speed is followed in the same sentence by the figure or mechanism
- proper nouns over categories: tools by name, the street, the river
- the mechanism in verb-led steps; how it works persuades more than how good it is
- numbers in sentences with their unit, uneven where real
- buttons are a verb and a real object ("Book a table", not "Get started")
- the product keeps one name instead of cycling through "the platform, the tool, the solution"
- microcopy is written too: form labels, errors, confirmations, empty states, 404

## 5. Device budget per page

None of these is banned. Each works once; the tell is using them by default.

| Device | Budget |
| --- | --- |
| two-fragment heading "X. Y." | 1 |
| number-pair heading "Four X, one Y" | 0 to 1 |
| negation run "No X. No Y." | 1, only for refusals a buyer can check |
| contrast frames "X, not Y", "rather than", "instead of", counted together | 2 |
| dry closing line on a paragraph | 2, never consecutive |
| pun on the name | 1, never the headline |
| sign-off line in the footer | 0 |
| figures strip | real figures only |
| virtue words about the client | 0 |

## 6. Banned outright

- buzzwords: seamless, effortless, elevate, unlock, unleash, empower, supercharge, reimagine, next-generation, cutting-edge, world-class, best-in-class, game-changing, robust, powerful, delve, tapestry, realm, embark, plethora, myriad, meticulous
- stock lines: "in today's fast-paced world", "unlock the power of", "whether you're a", "look no further", "join thousands of", "take it to the next level", "it's not just a", "with just a few clicks", "at your fingertips", "X made simple"
- chatbot residue: lorem ipsum, "[company name]", template braces, "I hope this helps"
- placeholder people and companies (Jane Doe, Acme)
- invented metrics, testimonials, logo walls, case-study counts
- a stock second action beside the primary ("Learn more", "Book a demo") when it goes nowhere specific
- process talk: "this section shows", "below you'll find", "here are 3 reasons"
- em dashes in visible copy when the project has no house style for them
- questions as headlines, exclamation marks, invented capitalised concepts, metaphors of the "where X meets Y" kind

A word that is literal for the trade stays: bespoke tailoring, a robust steel frame, a quiet room, a powerful 2,000 W motor.

## 7. Over-correction

Rules breed their own habits. Watch for:

| Rule applied | Habit it breeds | Counter |
| --- | --- | --- |
| no em dashes | comma splices, all full stops | colons, brackets, semicolons where natural |
| no "not X but Y" | "rather than", "instead of" | count the forms together; state the positive |
| no hype words | calm vocabulary: quietly, steady, honest | a fact in place of the adjective |
| avoid threes | everything in pairs | list as many items as exist |
| be specific | invented numbers and anecdotes | the fact sheet, or a plainer line |
| short punchy sentences | a drumbeat of fragments | let one sentence per section run long |
| end strong | a quip on every paragraph | end on information |

## 8. Check

- Read every heading aloud. Any that could sit unchanged on a competitor's page fails.
- One fact, one wording, said once where it does work. A price printed in four sections is an echo.
- A form never prints success without a real request behind it.
- `npx github:wrg32786/aigent-design-system taste .` flags the mechanical copy smells (`taste/copy-slop-word`, `taste/copy-stock-phrase`). Treat hits as prompts; the read-aloud catches what it cannot.
