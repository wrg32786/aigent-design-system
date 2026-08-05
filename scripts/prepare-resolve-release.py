import json
from pathlib import Path


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def replace(path, old, new, count=1):
    text = read(path)
    if old not in text:
        raise SystemExit(f"Expected text not found in {path}: {old[:120]!r}")
    write(path, text.replace(old, new, count))


def insert_before(path, marker, addition):
    text = read(path)
    if marker not in text:
        raise SystemExit(f"Marker not found in {path}: {marker[:120]!r}")
    write(path, text.replace(marker, addition + marker, 1))


registry_path = Path("registry.json")
registry = json.loads(registry_path.read_text())
items = registry["items"]
by_name = {item["name"]: item for item in items}

skill_item = by_name["aigent-design-skill"]
resolve_reference = {
    "path": "skills/aigent-design/reference/resolve.md",
    "type": "registry:file",
    "target": "~/.claude/skills/aigent-design/reference/resolve.md",
}
if not any(file["path"] == resolve_reference["path"] for file in skill_item["files"]):
    skill_item["files"].append(resolve_reference)

if "design-resolver" not in by_name:
    resolver = {
        "name": "design-resolver",
        "type": "registry:item",
        "title": "AIgent Design Resolver",
        "description": "Install the render, rank, repair, rerender, and verification loop with desktop, tablet, mobile, zoom, reduced-motion, runtime, accessibility, and comparison evidence.",
        "registryDependencies": [
            "wrg32786/aigent-design-system/studio-core",
            "wrg32786/aigent-design-system/quality-suite",
        ],
        "files": [
            {"path": "resolve/README.md", "type": "registry:file", "target": "~/resolve/README.md"},
            {"path": "resolve/resolve.schema.json", "type": "registry:file", "target": "~/resolve/resolve.schema.json"},
            {"path": "resolve/example.resolve.json", "type": "registry:file", "target": "~/resolve/example.resolve.json"},
            {"path": "scripts/resolve-design.mjs", "type": "registry:file", "target": "~/scripts/resolve-design.mjs"},
            {"path": "scripts/check-resolve.mjs", "type": "registry:file", "target": "~/scripts/check-resolve.mjs"},
            {"path": "skills/design-resolver/SKILL.md", "type": "registry:file", "target": "~/.claude/skills/design-resolver/SKILL.md"},
        ],
        "devDependencies": ["playwright@^1.61.1"],
        "docs": "Run `npx playwright install chromium` before rendered Resolve checks. Mechanical passage still requires an explicit visual review.",
    }
    full_index = next(index for index, item in enumerate(items) if item["name"] == "full-studio")
    items.insert(full_index, resolver)

full_studio = next(item for item in items if item["name"] == "full-studio")
resolver_dependency = "wrg32786/aigent-design-system/design-resolver"
if resolver_dependency not in full_studio["registryDependencies"]:
    quality_index = full_studio["registryDependencies"].index("wrg32786/aigent-design-system/quality-suite")
    full_studio["registryDependencies"].insert(quality_index + 1, resolver_dependency)
full_studio["description"] = "Install the complete flagship system: inspiration intelligence, design planning, immersive production, ranked design resolution, QA, Design Vault, and case studies."
registry_path.write_text(json.dumps(registry, indent=2) + "\n")

replace(
    "scripts/check-registry.mjs",
    '    "inspiration-intelligence",\n    "immersive-sales-deck",',
    '    "inspiration-intelligence",\n    "design-resolver",\n    "immersive-sales-deck",',
)

replace(
    "scripts/check.mjs",
    '  "inspiration/evals/rubric.json",\n  "creative-production/README.md",',
    '  "inspiration/evals/rubric.json",\n  "resolve/README.md",\n  "resolve/resolve.schema.json",\n  "resolve/example.resolve.json",\n  "creative-production/README.md",',
)
replace(
    "scripts/check.mjs",
    '  "skills/aigent-design/reference/craft-floor.md",\n  "skills/design-forensics/SKILL.md",',
    '  "skills/aigent-design/reference/craft-floor.md",\n  "skills/aigent-design/reference/resolve.md",\n  "skills/design-resolver/SKILL.md",\n  "skills/design-forensics/SKILL.md",',
)
replace(
    "scripts/check.mjs",
    '  "scripts/inspiration-smoke.mjs",\n  "scripts/plan-design.mjs",',
    '  "scripts/inspiration-smoke.mjs",\n  "scripts/resolve-design.mjs",\n  "scripts/check-resolve.mjs",\n  "scripts/plan-design.mjs",',
)
replace(
    "scripts/check.mjs",
    'assert.ok(skillFiles.length >= 21, `Expected at least 21 installable skills; found ${skillFiles.length}.`);',
    'assert.ok(skillFiles.length >= 22, `Expected at least 22 installable skills; found ${skillFiles.length}.`);',
)
replace(
    "scripts/check.mjs",
    '  "inspiration-originality-audit",\n]) {',
    '  "inspiration-originality-audit",\n  "design-resolver",\n]) {',
)
replace(
    "scripts/check.mjs",
    'assert.ok(registry.items.length >= 13, "Installable registry is unexpectedly small.");',
    'assert.ok(registry.items.length >= 14, "Installable registry is unexpectedly small.");',
)
replace(
    "scripts/check.mjs",
    'const fullStudio = registry.items.find((item) => item.name === "full-studio");',
    'assert.ok(registry.items.some((item) => item.name === "design-resolver"), "Design Resolver is missing from the registry.");\nconst fullStudio = registry.items.find((item) => item.name === "full-studio");',
)
replace(
    "scripts/check.mjs",
    '  "full-studio must install Inspiration Intelligence.",\n);',
    '  "full-studio must install Inspiration Intelligence.",\n);\nassert.ok(\n  fullStudio.registryDependencies.some((dependency) => dependency.endsWith("/design-resolver")),\n  "full-studio must install Design Resolver.",\n);',
)
replace(
    "scripts/check.mjs",
    'assert.equal(packageJson.version, "0.3.0", "Expected package version 0.3.0.");',
    'assert.equal(packageJson.version, "0.4.0", "Expected package version 0.4.0.");',
)
replace(
    "scripts/check.mjs",
    '  "inspiration",\n  "registry",',
    '  "inspiration",\n  "resolve",\n  "resolve:check",\n  "registry",',
)
replace(
    "scripts/check.mjs",
    '  "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → VERIFY",',
    '  "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE",',
)
replace(
    "scripts/check.mjs",
    '  "influence ledger",\n  "inspiration:smoke",',
    '  "influence ledger",\n  "AIgent Resolve",\n  "design-resolver",\n  "resolve:check",\n  "inspiration:smoke",',
)
replace(
    "scripts/check.mjs",
    'and Inspiration Intelligence v0.3.0.',
    'Inspiration Intelligence, and AIgent Resolve v0.4.0.',
)

replace(
    "README.md",
    '# AIgent Design System\n\nAn installable, agent-native studio for creating distinctive websites and interfaces: immersive 3D pages, cinematic sales decks, product UI, design forensics, inspiration synthesis, media production, and browser QA.\n',
    '<p align="center">\n  <img src="docs/assets/aigent-design-system-banner.svg" width="100%" alt="The AIgent Design System — Inspire, Produce, Build, Resolve">\n</p>\n\n<h1 align="center">AIgent Design System</h1>\n\n<p align="center"><strong>The agent-native design and production studio for distinctive interfaces, immersive 3D websites, cinematic decks, and the media behind them.</strong></p>\n\n<p align="center"><code>SHAPE · INSPIRE · SYNTHESIZE · PRODUCE · BUILD · RESOLVE</code></p>\n\nAn installable system for turning Claude, Codex, Cursor, and other coding agents into a disciplined design-and-production team—with reference forensics, original synthesis, media pipelines, ranked repair, and browser proof.\n',
)
replace(
    "README.md",
    "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → VERIFY",
    "SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE",
)
replace(
    "README.md",
    '### Complete studio\n\n```bash\npnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio\n```\n\n### Complete pages and interfaces',
    '### Complete studio\n\n```bash\npnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio\n```\n\n### Design Resolver\n\n```bash\npnpm dlx shadcn@latest add wrg32786/aigent-design-system/design-resolver\n```\n\n### Complete pages and interfaces',
)
replace(
    "README.md",
    'npx github:wrg32786/aigent-design-system inspire doctor\n```',
    'npx github:wrg32786/aigent-design-system inspire doctor\nnpx github:wrg32786/aigent-design-system resolve --init --target .\n```',
)
resolve_section = '''## AIgent Resolve\n\nResolve is the final production loop:\n\n```text\nRENDER → DETECT → RANK → REPAIR → RERENDER → REVIEW\n```\n\nIt combines source-level audits with desktop, tablet, mobile, 200% text-size, reduced-motion, runtime, focus, touch-target, contrast, overflow, clipping, and media evidence. It ranks the top repair group, records what must be preserved, and compares every run so Claude fixes the shared cause instead of polishing random symptoms.\n\nInitialize a project once:\n\n```bash\nnpx github:wrg32786/aigent-design-system resolve --init --target .\n```\n\nRun it against a live local application:\n\n```bash\nnpx github:wrg32786/aigent-design-system resolve \\\n  --target . \\\n  --url http://127.0.0.1:3000/\n```\n\nThe default gate requires a score of 90, zero errors, no more than five warnings, and an explicit visual review. Generated evidence stays under `.aigent/resolve/`. Mechanical passage does not replace judgment about product clarity, specificity, composition, typography, motion, media, originality, or finish.\n\n'''
insert_before("README.md", "## Inspiration Intelligence\n", resolve_section)
replace(
    "README.md",
    'polish     finish the rendered result\nextract    turn proven patterns into reusable assets',
    'polish     finish the rendered result\nresolve    render, rank, repair, rerender, and verify the complete surface\nextract    turn proven patterns into reusable assets',
)
replace(
    "README.md",
    'npm run inspiration\nnpm run registry',
    'npm run inspiration\nnpm run resolve:check\nnpm run registry',
)
replace(
    "README.md",
    '- `inspiration` checks Design DNA, source import, search, synthesis, influence limits, application, and originality safeguards.\n',
    '- `inspiration` checks Design DNA, source import, search, synthesis, influence limits, application, and originality safeguards.\n- `resolve:check` proves the ranked repair contract, gate transition, and run comparison.\n- `resolve` generates project-specific rendered evidence and the final mechanical gate.\n',
)
replace(
    "README.md",
    'inspiration/            forensics, Design DNA, synthesis, originality, lab\ncreative-production/',
    'inspiration/            forensics, Design DNA, synthesis, originality, lab\nresolve/                ranked render-repair-verification contract\ncreative-production/',
)
replace(
    "README.md",
    'GitHub Actions validates the registry, local installer, design planner, inspiration engine, evals, desktop/mobile browser behavior, a real URL-forensics fixture, the Inspiration Lab, and reviewable visual captures.',
    'GitHub Actions validates the registry, local installer, design planner, inspiration engine, Resolve self-check and rendered proof, evals, desktop/mobile browser behavior, a real URL-forensics fixture, the Inspiration Lab, and reviewable visual captures.',
)

changelog = read("CHANGELOG.md")
release = '''# Changelog\n\n## 0.4.0 — AIgent Resolve\n\n### Added\n\n- `aigent-design resolve` render, rank, repair, rerender, and review workflow\n- desktop, tablet, mobile, 200% text-size, and reduced-motion evidence\n- runtime, request, overflow, focus, hit-area, contrast, clipping, fixed-coverage, and image-dimension checks\n- ranked repair contract with product, design, and inspiration preservation rules\n- run-to-run comparison of resolved, introduced, and persistent findings\n- configurable mechanical score gate with explicit human-review requirement\n- installable `design-resolver` registry item and specialist skill\n- branded AIgent Design System README banner\n- CI proof for the static resolver check and rendered browser resolver\n\n### Changed\n\n- primary workflow is now `Shape → Inspire → Synthesize → Produce → Build → Resolve`\n- package version is now `0.4.0`\n- `full-studio` now includes AIgent Resolve\n- the primary `aigent-design` skill now owns the final repair loop\n\n'''
if not changelog.startswith("# Changelog\n\n## 0.4.0"):
    write("CHANGELOG.md", changelog.replace("# Changelog\n\n", release, 1))

replace(
    "PRODUCT.md",
    "Open-source, installable, agent-native design and production system for immersive websites, cinematic decks, product interfaces, inspiration forensics, and the media behind them.",
    "Open-source, installable, agent-native design and production system for immersive websites, cinematic decks, product interfaces, inspiration forensics, the media behind them, and the final render-repair-verification loop.",
)
replace(
    "PRODUCT.md",
    "- fixed eval briefs, deterministic checks, and browser proof\n",
    "- fixed eval briefs, deterministic checks, and browser proof\n- ranked render, repair, rerender, and visual-review gates\n",
)
replace(
    "PRODUCT.md",
    "Shape → Inspire → Synthesize → Produce → Build → Verify",
    "Shape → Inspire → Synthesize → Produce → Build → Resolve",
)
replace(
    "PRODUCT.md",
    "claims completion without an installable result and browser proof.",
    "claims completion without a passing Resolve gate, browser proof, and explicit visual review.",
)
replace(
    "PRODUCT.md",
    "13. Audit source dominance, copy overlap, accessibility, assets, and rendered behavior.\n14. Ship a result",
    "13. Audit source dominance, copy overlap, accessibility, assets, and rendered behavior.\n14. Run the ranked Resolve loop until no P0 or P1 issue remains and the mechanical gate passes.\n15. Complete explicit visual review rather than treating a green report as taste.\n16. Ship a result",
)
replace(
    "PRODUCT.md",
    "- The Inspiration Lab and forensics fixture prove evidence capture, synthesis, influence limits, and browser verification.\n",
    "- The Inspiration Lab and forensics fixture prove evidence capture, synthesis, influence limits, and browser verification.\n- AIgent Resolve proves ranked root-cause repair, multi-viewport evidence, run comparison, and a bounded completion gate.\n",
)
replace(
    "PRODUCT.md",
    "- Human design judgment remains explicit in evals rather than hidden behind an automated taste score.\n",
    "- Mechanical Resolve passage never substitutes for explicit human or operating-agent visual judgment.\n- Human design judgment remains explicit in evals rather than hidden behind an automated taste score.\n",
)

resolve_design_section = '''## 11. Resolve before completion\n\nThe final loop is:\n\n```text\nrender → detect → rank → repair → rerender → review\n```\n\nResolve must read product truth, visual authority, and the current inspiration plan before ranking changes. It checks desktop, tablet, mobile, 200% text sizing, reduced motion, runtime failures, focus, hit areas, contrast, overflow, clipping, fixed chrome, and media stability.\n\nRepair one coherent root-cause group at a time. Fix shared primitives before instances. Do not flatten a distinctive composition, remove meaningful motion, hide overflow, or change the visual world merely to silence a detector.\n\nMechanical passage requires the configured score, error, and warning limits. Completion still requires explicit review of product clarity, specificity, composition, typography, motion/media, originality, and finish.\n\n'''
replace(
    "DESIGN.md",
    "## 11. Reuse\n",
    resolve_design_section + "## 12. Reuse\n",
)
replace(
    "DESIGN.md",
    "- browser smoke and visual capture complete\n",
    "- browser smoke and visual capture complete\n- the Resolve gate passes and its top-ranked findings are cleared or explicitly reviewed\n",
)

write("docs/roadmap.md", '''# Roadmap\n\n## 0.4 — AIgent Resolve\n\n- ranked render, repair, rerender, and review loop\n- desktop, tablet, mobile, zoom, and reduced-motion evidence\n- runtime, focus, touch-target, contrast, overflow, clipping, and media checks\n- design-lock preservation rules\n- run comparison and configurable mechanical gate\n- installable resolver skill and registry item\n- rendered resolver proof in CI\n- branded public README\n\n## Shipped foundations\n\n- 0.3 Inspiration Intelligence: URL and file forensics, Design DNA, multi-source synthesis, influence ledgers, originality safeguards, and InspirationBench\n- 0.2 Installable design intelligence: registry, planner, complete reference systems, patterns, Design Vault, and fixed evals\n- 0.1 Neutral design and creative production: semantic tokens, motion core, cinematic templates, asset pipelines, provenance, and browser QA\n\n## Next\n\n- publish the Design Vault and Inspiration Lab as first-class routes on The AIgent Tools\n- publish comparative no-skill, raw-reference, Impeccable, Taste, and AIgent evals\n- add visual-regression baselines for the canonical systems\n- add approximately 20 high-value complete interface and immersive systems without becoming a generic component dump\n- add optional motion-review integration guidance for specialist microinteraction skills\n- add an owned model-viewer reference with an optimized GLB\n- add a complete Remotion composition and rendered outputs\n- add an owned Spline scene with loading and failure proof\n- submit a stable namespace to the public shadcn registry directory after production use\n\n## Later\n\n- optional local SigLIP and DINOv2 retrieval adapters for large reference libraries\n- diversity-aware reference recommendation\n- Figma and Penpot direction-board round trips\n- public built-with-the-system gallery\n- additional framework adapters proven by real projects\n- automated WebGL performance tiers and context-loss verification\n''')

replace(
    "skills/README.md",
    "The consolidated skill installs to `.claude/skills/aigent-design/` and routes product context, inspiration, pages, decks, interfaces, media, layout, typography, motion, critique, polish, extraction, and QA without loading every specialist reference.",
    "The consolidated skill installs to `.claude/skills/aigent-design/` and routes product context, inspiration, pages, decks, interfaces, media, layout, typography, motion, critique, polish, ranked resolution, extraction, and QA without loading every specialist reference.",
)
replace(
    "skills/README.md",
    "| `aigent-design` | Shape → inspire → synthesize → produce → build → verify |",
    "| `aigent-design` | Shape → inspire → synthesize → produce → build → resolve |",
)
insert_before(
    "skills/README.md",
    "## Specialist production skills\n",
    "## Resolve skill\n\n| Skill | Owns |\n| --- | --- |\n| `design-resolver` | Rendered evidence → ranked root-cause repair → mechanical gate → explicit visual review |\n\n",
)

replace(
    "vault/app.js",
    '  { name: "quality-suite", title: "Quality Suite", description: "Design, asset, registry, eval, browser, and screenshot verification.", type: "registry:item" },',
    '  { name: "quality-suite", title: "Quality Suite", description: "Design, asset, registry, eval, browser, and screenshot verification.", type: "registry:item" },\n  { name: "design-resolver", title: "AIgent Design Resolver", description: "Ranked render, repair, rerender, and review evidence across desktop, tablet, mobile, zoom, and reduced motion.", type: "registry:item" },',
)
replace(
    "vault/app.js",
    '  if (/quality|vault/.test(item.name)) return "quality";',
    '  if (/quality|vault|resolver|resolve/.test(item.name)) return "quality";',
)
replace(
    ".github/ISSUE_TEMPLATE/bug.yml",
    "Inspiration forensics, Reference synthesis, Originality audit, Asset pipeline, Audit, Browser QA, Documentation",
    "Inspiration forensics, Reference synthesis, Originality audit, Design Resolve, Asset pipeline, Audit, Browser QA, Documentation",
)
replace(
    ".github/PULL_REQUEST_TEMPLATE.md",
    "- [ ] `npm run inspiration` when Design DNA, synthesis, or originality logic changes\n",
    "- [ ] `npm run inspiration` when Design DNA, synthesis, or originality logic changes\n- [ ] `npm run resolve:check` when resolve ranking, evidence, or gate logic changes\n",
)
replace(
    ".github/PULL_REQUEST_TEMPLATE.md",
    "- [ ] influence ledger and required transformations when references were used\n",
    "- [ ] influence ledger and required transformations when references were used\n- [ ] Resolve report or explicit reason the change does not affect a rendered surface\n",
)
replace(
    "docs/project-context.md",
    "- Eval brief, if applicable:\n- Definition of done:\n",
    "- Eval brief, if applicable:\n- Resolve entry URL or route:\n- Resolve minimum score:\n- Resolve maximum errors and warnings:\n- Human visual reviewer or review method:\n- Definition of done:\n",
)

print("Prepared AIgent Resolve release files.")
