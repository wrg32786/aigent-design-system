from pathlib import Path
import json

ROOT = Path('.')


def write(path, text):
    Path(path).write_text(text)


def replace(path, old, new):
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f'Expected contract not found in {path}: {old[:100]!r}')
    file.write_text(text.replace(old, new, 1))


# Registry integration.
registry_path = ROOT / 'registry.json'
registry = json.loads(registry_path.read_text())
by_name = {item['name']: item for item in registry['items']}

skill = by_name['aigent-design-skill']
vision_reference = {
    'path': 'skills/aigent-design/reference/vision.md',
    'type': 'registry:file',
    'target': '~/.claude/skills/aigent-design/reference/vision.md',
}
if not any(entry['path'] == vision_reference['path'] for entry in skill['files']):
    skill['files'].append(vision_reference)

vision_item = {
    'name': 'vision-critic',
    'type': 'registry:item',
    'title': 'AIgent Vision Critic',
    'description': 'Install annotated rendered captures, numbered element maps, structured aesthetic critique, visual comparison, and the final combined completion gate.',
    'registryDependencies': [
        'wrg32786/aigent-design-system/studio-core',
        'wrg32786/aigent-design-system/quality-suite',
    ],
    'files': [
        {'path': 'vision/README.md', 'type': 'registry:file', 'target': '~/vision/README.md'},
        {'path': 'vision/visual-review-task.schema.json', 'type': 'registry:file', 'target': '~/vision/visual-review-task.schema.json'},
        {'path': 'vision/visual-review.schema.json', 'type': 'registry:file', 'target': '~/vision/visual-review.schema.json'},
        {'path': 'vision/example.visual-review.json', 'type': 'registry:file', 'target': '~/vision/example.visual-review.json'},
        {'path': 'vision/lib/common.mjs', 'type': 'registry:file', 'target': '~/vision/lib/common.mjs'},
        {'path': 'vision/lib/capture.mjs', 'type': 'registry:file', 'target': '~/vision/lib/capture.mjs'},
        {'path': 'vision/lib/review.mjs', 'type': 'registry:file', 'target': '~/vision/lib/review.mjs'},
        {'path': 'scripts/vision-review.mjs', 'type': 'registry:file', 'target': '~/scripts/vision-review.mjs'},
        {'path': 'scripts/check-vision.mjs', 'type': 'registry:file', 'target': '~/scripts/check-vision.mjs'},
        {'path': 'skills/visual-design-critic/SKILL.md', 'type': 'registry:file', 'target': '~/.claude/skills/visual-design-critic/SKILL.md'},
    ],
    'devDependencies': ['playwright@^1.61.1'],
    'docs': 'Run Resolve first, then `aigent-design vision prepare`. A host agent, human, or explicit vision adapter must open every required capture and write the structured review before `vision finalize` can pass.',
}
if 'vision-critic' not in by_name:
    index = next(i for i, item in enumerate(registry['items']) if item['name'] == 'design-resolver')
    registry['items'].insert(index, vision_item)
else:
    registry['items'][next(i for i, item in enumerate(registry['items']) if item['name'] == 'vision-critic')] = vision_item

resolver = next(item for item in registry['items'] if item['name'] == 'design-resolver')
resolver['description'] = 'Install the mechanical render-and-repair loop plus AIgent Vision annotated captures, structured critique, and the combined completion gate.'
vision_dependency = 'wrg32786/aigent-design-system/vision-critic'
if vision_dependency not in resolver['registryDependencies']:
    resolver['registryDependencies'].append(vision_dependency)
resolver['docs'] = 'Run `npx playwright install chromium`, then Resolve, Vision prepare, a real image-capable review, and Vision finalize. Neither a green mechanical score nor an uninspected screenshot is completion.'

full = next(item for item in registry['items'] if item['name'] == 'full-studio')
full['description'] = 'Install the complete flagship system: inspiration intelligence, design planning, immersive production, ranked Resolve, structured visual critique, QA, Design Vault, and case studies.'
registry_path.write_text(json.dumps(registry, indent=2) + '\n')

# README positioning and workflow.
replace('README.md', 'alt="The AIgent Design System — Inspire, Produce, Build, Resolve"', 'alt="The AIgent Design System — Inspire, Produce, Build, Resolve, See"')
replace('README.md', 'SHAPE · INSPIRE · SYNTHESIZE · PRODUCE · BUILD · RESOLVE', 'SHAPE · INSPIRE · SYNTHESIZE · PRODUCE · BUILD · RESOLVE · SEE')
replace('README.md', 'ranked repair, and browser proof.', 'ranked repair, annotated visual critique, and browser proof.')
replace('README.md', 'SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE', 'SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE → SEE')
replace(
    'README.md',
    '''### Design Resolver

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/design-resolver
```
''',
    '''### Design Resolver

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/design-resolver
```

### AIgent Vision Critic

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/vision-critic
```
''',
)
replace(
    'README.md',
    '''npx github:wrg32786/aigent-design-system inspire doctor
npx github:wrg32786/aigent-design-system resolve --init --target .
''',
    '''npx github:wrg32786/aigent-design-system inspire doctor
npx github:wrg32786/aigent-design-system resolve --init --target .
npx github:wrg32786/aigent-design-system vision prepare --target .
''',
)
vision_section = '''## AIgent Vision

AIgent Vision closes the gap between browser facts and design judgment:

```text
RENDER → MEASURE → CAPTURE → SEE → CRITIQUE → RANK → REPAIR → RERENDER → COMPARE
```

Resolve creates the real desktop, tablet, mobile, and reduced-motion captures. Vision adds numbered `E###` overlays and an element map, then requires the operating agent, a human reviewer, or an explicit vision adapter to open every original and annotated image.

```bash
npx github:wrg32786/aigent-design-system vision prepare --target .
```

The review covers product clarity, hierarchy, composition, typography, color and material, motion and media, interaction, product specificity, originality, responsive quality, trust and usability, and finish. Each finding includes visible evidence, severity, relevant element IDs, a suspected shared owner, a repair, confidence, and what must be preserved.

Write the review to `.aigent/resolve/latest.visual-review.json`, then validate and merge it with Resolve:

```bash
npx github:wrg32786/aigent-design-system vision check \
  --target . \
  --review .aigent/resolve/latest.visual-review.json

npx github:wrg32786/aigent-design-system vision finalize \
  --target . \
  --review .aigent/resolve/latest.visual-review.json
```

Completion requires the mechanical gate, proof that every required capture was reviewed, no open P0/P1 visual finding, and an explicit final verdict. A host that cannot see images must use a human or a declared vision-model adapter; it cannot mark the review complete from source code alone.

'''
replace('README.md', '## Inspiration Intelligence\n', vision_section + '## Inspiration Intelligence\n')
replace('README.md', 'npm run resolve:check\n', 'npm run resolve:check\nnpm run vision:check\n')
replace('README.md', 'resolve/                ranked render-repair-verification contract\n', 'resolve/                ranked render-repair-verification contract\nvision/                 annotated captures and structured visual critique\n')

# Product contract.
replace('PRODUCT.md', 'and the final render-repair-verification loop.', 'the final render-repair-verification loop, and structured visual judgment.')
replace('PRODUCT.md', '- ranked render, repair, rerender, and visual-review gates\n', '- ranked render, repair, rerender, and visual-review gates\n- annotated screenshots, element maps, and structured aesthetic critique\n')
replace('PRODUCT.md', 'Shape → Inspire → Synthesize → Produce → Build → Resolve', 'Shape → Inspire → Synthesize → Produce → Build → Resolve → See')
replace('PRODUCT.md', 'without a passing Resolve gate, browser proof, and explicit visual review.', 'without a passing Resolve gate, browser proof, inspected screenshots, and structured visual review.')
replace('PRODUCT.md', '15. Complete explicit visual review rather than treating a green report as taste.\n16. Ship', '15. Open every required original and annotated capture and record all twelve critique dimensions.\n16. Merge mechanical and visual findings into one root-cause repair queue.\n17. Ship')
replace('PRODUCT.md', '- AIgent Resolve proves ranked root-cause repair, multi-viewport evidence, run comparison, and a bounded completion gate.\n', '- AIgent Resolve proves ranked root-cause repair, multi-viewport evidence, run comparison, and a bounded completion gate.\n- AIgent Vision proves that the agent actually inspects the rendered work, connects aesthetic findings to elements, and records before-and-after visual judgment.\n')
replace('PRODUCT.md', '- Mechanical Resolve passage never substitutes for explicit human or operating-agent visual judgment.\n', '- Mechanical Resolve passage never substitutes for explicit human or operating-agent visual judgment.\n- A screenshot existing on disk is not proof that the agent opened or understood it.\n')

# Design contract.
replace('DESIGN.md', '- the Resolve gate passes and its top-ranked findings are cleared or explicitly reviewed\n', '- the Resolve gate passes and its top-ranked findings are cleared or explicitly reviewed\n- every required original and annotated capture has a structured Vision review\n- no open P0/P1 visual finding remains\n')
replace(
    'DESIGN.md',
    '''Mechanical passage requires the configured score, error, and warning limits. Completion still requires explicit review of product clarity, specificity, composition, typography, motion/media, originality, and finish.

## 12. Reuse
''',
    '''Mechanical passage requires the configured score, error, and warning limits. Completion still requires explicit review of product clarity, specificity, composition, typography, motion/media, originality, and finish.

## 12. See the rendered result

AIgent Vision must open both original and annotated desktop, tablet, mobile, and reduced-motion captures. The numbered overlay is evidence, not decoration: every visual finding should point to `E###` elements when the issue has an identifiable rendered owner.

Review product clarity, hierarchy, composition, typography, color/material, motion/media, interaction, product specificity, originality, responsive quality, trust/usability, and finish. Do not replace this with a hidden taste score or infer it from DOM metrics.

A valid finding states the visible relationship, evidence, priority, repair, confidence, and preservation contract. Merge mechanical and visual findings, then repair the highest shared cause. Completion requires no open P0/P1 visual finding and a final verdict of `pass` or `pass-with-notes`.

## 13. Reuse
''',
)

# Changelog.
changelog = Path('CHANGELOG.md').read_text()
if '## 0.5.0 — AIgent Vision' not in changelog:
    entry = '''## 0.5.0 — AIgent Vision

### Added

- annotated desktop, tablet, mobile, and reduced-motion screenshots
- stable numbered `E###` element maps with selectors, bounds, labels, and computed visual roles
- twelve-dimension structured aesthetic critique
- proof that every required viewport was reviewed by a host agent, human, or explicit vision adapter
- visual P0-P3 findings with visible evidence, repairs, confidence, and preservation constraints
- combined mechanical and visual repair ranking
- before-and-after visual comparison
- final completion gate requiring no open P0/P1 visual finding
- `aigent-design vision prepare`, `vision check`, and `vision finalize`
- installable `vision-critic` registry item and `visual-design-critic` skill

### Changed

- primary workflow is now `Shape → Inspire → Synthesize → Produce → Build → Resolve → See`
- package version is now `0.5.0`
- Design Resolver now installs AIgent Vision
- a screenshot existing on disk no longer counts as visual review

'''
    Path('CHANGELOG.md').write_text(changelog.replace('# Changelog\n\n', '# Changelog\n\n' + entry, 1))

# Primary skill and command routing.
replace('skills/aigent-design/SKILL.md', '| `resolve` | render, rank, repair, rerender, and verify until the gate and visual review pass |\n', '| `resolve` | render, rank, repair, rerender, and verify mechanical quality |\n| `vision` | open annotated captures, write structured critique, and merge visual judgment with Resolve |\n')
replace('skills/aigent-design/SKILL.md', '- Real browser evidence decides whether the work is done.\n', '- Real browser evidence decides whether the work is mechanically complete.\n- Every required screenshot must be opened before visual review can be marked complete.\n')
replace(
    'skills/aigent-design/SKILL.md',
    '''The resolver combines source and rendered evidence, ranks the highest-value repair group, compares each run, and stops the agent from declaring completion before desktop, tablet, mobile, text zoom, reduced motion, runtime behavior, and explicit visual judgment are complete.

## Completion
''',
    '''The resolver combines source and rendered evidence, ranks the highest-value mechanical repair group, and compares each run.

## Vision routing

Use `visual-design-critic` after Resolve has produced captures:

```bash
npx github:wrg32786/aigent-design-system vision prepare --target .
npx github:wrg32786/aigent-design-system vision check --target . --review .aigent/resolve/latest.visual-review.json
npx github:wrg32786/aigent-design-system vision finalize --target . --review .aigent/resolve/latest.visual-review.json
```

Open every original and annotated image. Use `reference/vision.md`. The combined gate blocks completion until all twelve critique dimensions are recorded and no open P0/P1 visual finding remains.

## Completion
''',
)
replace('skills/aigent-design/SKILL.md', 'a passing Resolve mechanical gate, explicit visual review,', 'a passing Resolve mechanical gate, a passing structured Vision review,')

commands_path = Path('skills/aigent-design/commands.json')
commands = json.loads(commands_path.read_text())
if not any(command['name'] == 'vision' for command in commands['commands']):
    index = next(i for i, command in enumerate(commands['commands']) if command['name'] == 'audit')
    commands['commands'].insert(index, {
        'name': 'vision',
        'owns': 'Open original and annotated rendered captures, record the twelve-dimension structured critique, and merge visual judgment with Resolve.',
        'reference': 'reference/vision.md',
    })
commands_path.write_text(json.dumps(commands, indent=2) + '\n')

# Resolve and skills docs.
replace('resolve/README.md', 'RENDER → DETECT → RANK → REPAIR → RERENDER → REVIEW', 'RENDER → DETECT → RANK → REPAIR → RERENDER → VISION')
replace('resolve/README.md', 'It combines the existing source audit with rendered browser evidence and produces one ranked repair contract for the coding agent. It does not blindly rewrite arbitrary UI code.', 'It combines source audit and rendered browser evidence into a ranked mechanical repair contract. AIgent Vision then requires the agent to inspect annotated captures and record structured aesthetic judgment. Neither layer blindly rewrites arbitrary UI code.')
replace('resolve/README.md', '    reduced-motion.png\n```', '    reduced-motion.png\n    desktop.annotated.png\n    tablet.annotated.png\n    mobile.annotated.png\n    reduced-motion.annotated.png\n    element-map.json\n```')
replace('resolve/README.md', 'Mechanical passage is not a declaration of taste. Completion still requires explicit review of product clarity, specificity, composition, typography, motion and media, originality, and finish.', 'Mechanical passage is not a declaration of taste. Run `aigent-design vision prepare`, inspect every capture, write `.aigent/resolve/latest.visual-review.json`, and run `vision finalize`. Completion requires no open P0/P1 visual finding and a final structured verdict.')

replace('skills/design-resolver/SKILL.md', 'Use this skill after the surface works end to end and before claiming design completion.', 'Use this skill after the surface works end to end. It owns mechanical Resolve; route the required rendered judgment to `visual-design-critic`.')
replace('skills/design-resolver/SKILL.md', '6. Run the smallest relevant code check.\n7. Rerun Resolve and compare resolved, introduced, and persistent findings.\n', '6. Run the smallest relevant code check.\n7. Rerun Resolve and compare resolved, introduced, and persistent findings.\n8. When the mechanical gate passes, run Vision prepare and open every generated capture.\n9. Complete Vision check and finalize before claiming completion.\n')
replace('skills/design-resolver/SKILL.md', '- the result has no unresolved loading, failure, rights, or provenance concern.\n', '- the structured Vision gate passes with no open P0/P1 finding;\n- the result has no unresolved loading, failure, rights, or provenance concern.\n')

replace('skills/aigent-design/reference/resolve.md', 'Mechanical passage is a floor. The result still requires explicit rendered judgment.', 'Mechanical passage is a floor. Route to `reference/vision.md`, inspect every original and annotated capture, and require the structured visual gate before completion.')

# Skills index and Vault fallback.
skills_readme = Path('skills/README.md').read_text()
if 'visual-design-critic' not in skills_readme:
    skills_readme += '''\n## Visual review\n\n| Skill | Owns |\n| --- | --- |\n| `visual-design-critic` | Annotated capture inspection, twelve-dimension critique, visual comparison, and the final combined gate |\n'''
Path('skills/README.md').write_text(skills_readme)

vault = Path('vault/app.js').read_text()
if 'name: "vision-critic"' not in vault:
    marker = '''  {
    name: "quality-suite",
    title: "Quality Suite",
    description: "Design, inspiration, asset, registry, eval, browser, and screenshot verification.",
    type: "registry:item",
  },
'''
    addition = marker + '''  {
    name: "vision-critic",
    title: "AIgent Vision Critic",
    description: "Annotated rendered captures, structured aesthetic critique, visual comparison, and the final completion gate.",
    type: "registry:item",
  },
'''
    if marker not in vault:
        raise SystemExit('Vault quality-suite contract not found')
    vault = vault.replace(marker, addition, 1)
Path('vault/app.js').write_text(vault)

print('Integrated AIgent Vision across registry, documentation, skills, and product contracts.')
