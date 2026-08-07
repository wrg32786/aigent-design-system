<p align="center">
  <img src="docs/assets/readme/readme-hero.svg" width="100%" alt="AIgent Design System">
</p>

# AIgent Design System (in Beta active build)

**Create polished websites, immersive sales decks, product interfaces, and 3D experiences with an AI design agent—without needing to know how to code.**

AIgent Desktop combines a visual website builder, live browser preview, Claude Code or Codex, the AIgent design library, direct DOM editing, browser QA, and one-click publishing in a single local application.

## Install AIgent Desktop

### Windows 10 or 11

<p align="center">
  <a href="https://github.com/wrg32786/aigent-design-system/releases/latest/download/AIgent-Desktop-Setup-Windows-x64.exe"><strong>Download the Windows installer</strong></a>
</p>

1. Download `AIgent-Desktop-Setup-Windows-x64.exe`.
2. Double-click the downloaded file.
3. Follow the setup wizard.
4. Connect Claude Code or Codex using the provider's official sign-in flow.
5. Launch AIgent Studio and create a project.

No terminal, GitHub knowledge, or manual repository installation is required for the desktop path.

### macOS

Download the matching installer from the [latest release](https://github.com/wrg32786/aigent-design-system/releases/latest):

- `AIgent-Desktop-macOS-Apple-Silicon.dmg` for Apple Silicon Macs
- `AIgent-Desktop-macOS-Intel.dmg` for Intel Macs

Open the `.dmg`, drag AIgent Desktop into Applications, and launch it.

> **Windows security notice:** Until the public installer is code-signed, Windows may show **Windows protected your PC**. Verify that the file came from this repository, choose **More info**, and then **Run anyway**. Once signing credentials are configured, Windows shows the normal trusted-publisher installation flow.

## First-run setup

The guided setup wizard handles the technical steps:

1. **Workspace** — choose the folder where sites, decks, and project history are stored.
2. **System check** — verify the bundled runtime and install Git when the selected agent requires it.
3. **AI agent** — install Claude Code or Codex and complete the official account sign-in.
4. **Preferences** — choose update and startup behavior and review the local-first workflow.
5. **Launch** — open the real AIgent Studio visual canvas.

AI credentials remain in the official Claude Code or Codex credential store. AIgent Desktop does not ask users to paste an API key into the application.

For a step-by-step Windows walkthrough, see [`docs/GETTING_STARTED_WINDOWS.md`](docs/GETTING_STARTED_WINDOWS.md).

## Create a first project

1. Click **New**.
2. Start from a blank site, cinematic page, immersive sales deck, command center, or 3D product stage.
3. Describe the product, audience, and desired result in ordinary language.
4. Open **Agent** and choose **Build / revise**.
5. Review the result in the live preview.
6. Use **Design** mode to select real rendered elements and edit text, spacing, typography, color, layout, and responsive behavior.
7. Use **Distill canvas edits into source** after approving visual changes.
8. Open **Ship** to export locally or publish through Vercel, Netlify, or Cloudflare Pages.

Projects can be created and previewed entirely on the local computer. A hosting account is only needed for a public URL.

## Studio in action

<p align="center">
  <img src="docs/assets/readme/studio-demo.svg" width="100%" alt="Animated walkthrough of AIgent Desktop and the AIgent Studio visual website builder">
</p>

The walkthrough uses the real Studio interface: semantic layers, direct selection, responsive editing, the Canvas patch journal, agent distillation, Resolve, Vision, and publishing.

## Ship the site

```text
DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

The **Ship** tab can:

- create a clean local production export;
- publish preview and production sites through Vercel, Netlify, or Cloudflare Pages;
- create a Git checkpoint before deployment;
- block unresolved Canvas edits from being published accidentally;
- run AIgent Resolve before and after deployment;
- prepare AIgent Vision captures from the live URL;
- record deployment history and redeploy an earlier exact artifact.

Provider authentication uses each provider's official sign-in flow. Hosting tokens and secret environment values are not entered into Studio.

## Developer installation — optional

The command-line route is for contributors and developers who prefer to install the repository into a project folder.

Run these commands from a normal user-owned directory. Protected operating-system folders can cause permission errors because development tools inspect the current directory.

### Windows PowerShell

```powershell
New-Item -ItemType Directory -Force "$HOME\Documents\AIgent-Studio" | Out-Null
Set-Location "$HOME\Documents\AIgent-Studio"
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
node scripts/studio-server.mjs --open
```

### macOS or Linux

```bash
mkdir -p ~/Documents/AIgent-Studio
cd ~/Documents/AIgent-Studio
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
node scripts/studio-server.mjs --open
```

Studio opens at:

```text
http://127.0.0.1:4180/studio/
```

Source-development alternative:

```bash
git clone https://github.com/wrg32786/aigent-design-system.git
cd aigent-design-system
npm install
npm run studio -- --open
```

## What AIgent can create

| Starting system | Use it for |
| --- | --- |
| [`templates/modular-scroll-starter/`](templates/modular-scroll-starter/) | Cinematic landing pages and product stories |
| [`templates/immersive-sales-deck/`](templates/immersive-sales-deck/) | Sales decks, sponsorship decks, launches, and presentations |
| [`templates/command-center-interface/`](templates/command-center-interface/) | Dashboards, editors, resource systems, and operator tools |
| [`templates/threejs-product-stage/`](templates/threejs-product-stage/) | Interactive 3D product experiences with complete fallbacks |
| [`templates/free-design-stack/`](templates/free-design-stack/) | Pinned video narratives |
| [`templates/spline-scroll-landing/`](templates/spline-scroll-landing/) | Spline and GSAP 3D landing pages |
| [`templates/asset-scroll-gallery/`](templates/asset-scroll-gallery/) | Editorial media and resource galleries |
| [`vault/`](vault/) | Browse and install reusable systems |
| [`inspiration/lab/`](inspiration/lab/) | Turn multiple references into an original direction |

## How the design agent works

```text
SHAPE → INSPIRE → SYNTHESIZE → PRODUCE → BUILD → RESOLVE → SEE
```

- **Shape:** understand the product, audience, proof, and goal.
- **Inspire:** inspect references and create Design DNA.
- **Synthesize:** combine multiple references without copying one source.
- **Produce:** create or source video, 3D, images, textures, and other media.
- **Build:** construct the real website, deck, or interface.
- **Resolve:** measure the real browser and repair mechanical failures.
- **See:** inspect rendered captures and perform structured visual judgment.
- **Publish:** checkpoint, export, deploy, verify, and record the finished result.

The result is a **DOM-backed visual website canvas**: Studio edits the real rendered site rather than a disconnected mockup. Direct visual changes remain reversible in the **Canvas patch journal** until the operator deliberately distills them into source.

## Included systems

### AIgent Studio

Install only the interactive builder:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-studio
node scripts/studio-server.mjs --open
```

### Studio core

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/studio-core
```

### Inspiration Intelligence

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/inspiration-intelligence
```

It captures references, creates **Design DNA**, produces a multi-source reference matrix, and stores an **influence ledger** so inspiration remains evidence rather than copied implementation.

### AIgent Resolve

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/design-resolver
npm run resolve:check
```

AIgent Resolve measures desktop, tablet, mobile, text zoom, reduced motion, runtime errors, overflow, focus, touch targets, media, and request behavior.

### AIgent Vision

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/vision-critic
npx github:wrg32786/aigent-design-system vision prepare --target .
```

Vision produces annotated captures and a structured review at `.aigent/resolve/latest.visual-review.json`. A real image-capable reviewer must inspect the captures before completion can pass.

### Ship and Publish

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/publish-site
```

The `publish-site` system owns constrained public export, Vercel/Netlify/Cloudflare deployment, domains, live verification, deployment records, and exact-artifact redeploy.

### HyperFrames

HyperFrames support is included as an optional production route for turning websites and HTML interfaces into deterministic videos. It sits beside Remotion, Blender, Three.js, Spline, Rive, GSAP, and native browser capture rather than becoming a required website dependency.

## Agent skills

The primary `aigent-design` skill routes work to the specialist that owns it:

```text
shape · inspire · create · page · deck · interface · canvas · asset
layout · typeset · color · animate · critique · polish
resolve · vision · publish · audit · extract · install · eval
```

Install it alone:

```bash
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/aigent-design-skill
```

## Verification

```bash
npm run check
npm run registry
npm run intelligence
npm run inspiration
npm run inspiration:smoke
npm run resolve:check
npm run vision:check
npm run studio:check
npm run publish:check
npm run desktop:check
npm run eval
```

The release contract covers the registry, clean installation, browser matrix, direct Studio editing, Desktop setup, Inspiration Intelligence, AIgent Resolve, AIgent Vision, publishing, and native Windows/macOS packaging.

## Maintainers

End users do not need signing keys. Maintainers who publish trusted Windows and macOS installers should read [`desktop/SIGNING.md`](desktop/SIGNING.md). Desktop architecture and packaging details are in [`desktop/README.md`](desktop/README.md).

## Security and local data

- Studio binds to `127.0.0.1` by default.
- Projects are stored outside the application bundle.
- Claude Code and Codex credentials remain in their official local credential stores.
- Publish export blocks agent state, QA state, environment files, private keys, certificates, and credential-shaped content.
- AIgent Desktop exposes a constrained IPC API rather than a generic shell endpoint.

Read [`SECURITY.md`](SECURITY.md) for the complete boundary.

## License

MIT for AIgent-authored code and documentation. Third-party tools and assets retain their own licenses; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
