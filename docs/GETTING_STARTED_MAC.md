# Getting started on macOS

This guide is for people who want to use AIgent Desktop without setting up the repository or running terminal commands.

Start from the [latest AIgent release](https://github.com/wrg32786/aigent-design-system/releases/latest). A normal user should not clone the repository or install the design system through a package manager.

## 1. Choose the correct download

Download the installer that matches the Mac:

- **Apple Silicon:** `AIgent-Desktop-macOS-Apple-Silicon.dmg`
- **Intel:** `AIgent-Desktop-macOS-Intel.dmg`

To check the processor:

1. Open the Apple menu.
2. Choose **About This Mac**.
3. Look for **Chip** or **Processor**.
4. Choose Apple Silicon for an M-series chip; otherwise choose Intel.

## 2. Install AIgent Desktop

1. Double-click the downloaded `.dmg`.
2. Drag **AIgent Desktop** into **Applications**.
3. Eject the disk image.
4. Open **Applications**, then open **AIgent Desktop**.

If macOS blocks an unsigned development build:

1. Confirm the download came from the official AIgent GitHub repository.
2. Open **System Settings → Privacy & Security**.
3. Find the message about AIgent Desktop.
4. Choose **Open Anyway**.

Signed and notarized public builds should open through the normal macOS flow without this extra step.

## 3. Complete the setup wizard

The first-run wizard has five short stages:

1. **Project folder** — choose where sites, decks, and project history are saved.
2. **Computer check** — confirm the bundled AIgent runtime and local project folder are ready.
3. **Connect AI** — choose Claude Code, Codex, or manual prompt mode.
4. **Preferences** — choose automatic updates and launch-at-login behavior.
5. **Create** — launch AIgent Studio and begin the first project.

AIgent Desktop installs supported agent tools through their official local installers. It does not ask users to paste an API key into the application.

## 4. Connect an AI account

Choose one of the available agents:

- **Claude Code** — uses a supported Claude account and a persistent project session.
- **Codex** — uses a supported ChatGPT or OpenAI account.
- **Manual prompt** — creates the complete structured instruction for another coding environment.

Choose **Install for me**, then **Connect account**. Complete the provider’s official sign-in flow and return to AIgent Desktop.

## 5. Create the first project

1. Choose **Launch AIgent Studio and create my first project**.
2. Select **New**.
3. Choose a blank site, cinematic page, immersive sales deck, command center, or 3D product stage.
4. Describe the product and desired result in ordinary language.
5. Open **Agent** and select **Build / revise**.
6. Review the live result in desktop, tablet, and mobile modes.

Simple mode shows the main path first. Select **Advanced** when layers, components, comments, checkpoints, Resolve, Vision, or detailed publishing controls are needed.

## 6. Edit the live page

In **Design** mode:

1. Click a real element in the page preview.
2. Edit text, spacing, typography, color, layout, or responsive behavior.
3. Use Undo and Redo when needed.
4. Add a comment or prompt the agent about the selected element.
5. Choose **Distill canvas edits into source** after approving the visual changes.

The coding agent receives the selected DOM element, rendered bounds, current viewport, relevant styles, nearby layers, comments, and Canvas operations. Screenshot-based aesthetic review is handled through AIgent Vision.

## 7. Keep the project local or publish it

Projects work locally without a hosting account.

When a public URL is needed, open **Ship** and choose:

- Vercel
- Netlify
- Cloudflare Pages
- Local production export

AIgent can create a checkpoint, export public files only, run Resolve before and after deployment, prepare Vision captures, and record the deployment history.

## Updates and uninstall

AIgent Desktop can check GitHub Releases for validated updates. Projects stay in the selected project folder and are not removed when the application updates or is deleted.

To uninstall, remove **AIgent Desktop** from Applications. Delete the project folder separately only when the projects are no longer needed.

## Troubleshooting

### The installer is not in the latest release

The repository can build both Apple Silicon and Intel installers, but the public release must contain the matching `.dmg` asset. Maintainers can verify all public downloads with:

```bash
npm run desktop:verify-release -- --latest --download-check
```

### The AI agent is not detected after installation

Close and reopen AIgent Desktop, then choose **Run checks again**. If the provider installation did not complete, choose **Repair / reinstall** and repeat the official sign-in flow.

### A site works locally but not after publishing

Open **Ship**, enable Resolve verification, and publish a preview first. Check the provider log, public URL, and live Resolve result before promoting the site to production.
