# AIgent Desktop

AIgent Desktop is the easiest way to use the AIgent Design System. Download the installer, double-click it, connect Claude Code or Codex, and create sites without setting up the repository in a terminal.

## Install on Windows

1. Download [`AIgent-Desktop-Setup-Windows-x64.exe`](https://github.com/wrg32786/aigent-design-system/releases/latest/download/AIgent-Desktop-Setup-Windows-x64.exe).
2. Double-click the downloaded file.
3. Follow the installation prompts.
4. AIgent Desktop opens its first-run setup wizard automatically.

If the current public build is unsigned, Windows may display **Windows protected your PC**. Confirm the installer came from this GitHub repository, choose **More info**, then **Run anyway**. Maintainer signing instructions are separate in [`SIGNING.md`](SIGNING.md); end users never need signing keys.

## Install on macOS

Download the matching `.dmg` from the [latest release](https://github.com/wrg32786/aigent-design-system/releases/latest):

- Apple Silicon: `AIgent-Desktop-macOS-Apple-Silicon.dmg`
- Intel: `AIgent-Desktop-macOS-Intel.dmg`

Open the disk image and drag AIgent Desktop into Applications.

## First-run setup

The setup wizard is designed for someone who has never used a terminal.

### 1. Choose a workspace

Pick the normal folder where your sites and decks will be saved. Projects live outside the application, so an update or reinstall does not remove them.

### 2. Check the computer

AIgent includes its own runtime and browser QA engine. On Windows, the wizard can install Git automatically when Claude Code needs it. Node and npm are optional for developer workflows rather than a requirement to launch AIgent itself.

### 3. Connect an AI account

Choose:

- **Claude Code** — connect a Claude Pro, Max, Console, or supported enterprise account.
- **Codex** — connect a supported ChatGPT account or OpenAI configuration.
- **Manual prompt** — use Studio without installing either local agent.

Click **Install for me**, then **Connect account**. A sign-in window opens through the official tool. You do not need to type installation commands or paste an API key into AIgent Desktop.

### 4. Learn the workflow

You can build and preview locally without hosting anything. When a site is ready, the Studio **Ship** tab can connect Vercel, Netlify, or Cloudflare Pages and publish a public URL.

### 5. Launch Studio

Click **Launch AIgent Studio and create my first project**.

Then:

1. click **New**;
2. choose a blank site or starter;
3. describe the site in ordinary language;
4. open **Agent** and click **Build / revise**;
5. use **Design** mode to click and edit the real page;
6. distill approved visual edits into source;
7. open **Ship** to export locally or publish.

## What Desktop includes

- Windows x64 assisted installer and normal Windows uninstaller
- macOS Apple Silicon and Intel disk images
- project workspace picker
- local Claude Code and Codex detection, installation, and authentication launch
- DOM-backed AIgent Studio Canvas
- direct responsive editing
- agent activity and revisions
- components, tokens, comments, history, and checkpoints
- Inspiration Intelligence
- AIgent Resolve and AIgent Vision
- local export and one-click publishing
- automatic updates
- repair and redacted diagnostics
- bundled Playwright browser for reference capture and QA

## Troubleshooting the PowerShell error

Do not run shadcn or package-manager commands from:

```text
C:\Windows\System32
```

That is a protected Windows folder. The error:

```text
EPERM: operation not permitted, scandir 'C:\Windows\System32\config'
```

means Windows blocked the installer from scanning operating-system configuration files. Use the desktop installer, or create a normal folder first:

```powershell
New-Item -ItemType Directory -Force "$HOME\Documents\AIgent-Studio" | Out-Null
Set-Location "$HOME\Documents\AIgent-Studio"
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
node scripts/studio-server.mjs --open
```

## Development

The sections below are for repository maintainers and contributors, not normal Desktop users.

```bash
npm install
npm run desktop:start
```

Checks and smoke tests:

```bash
npm run desktop:check
npm run desktop:smoke
npm run desktop:smoke:packaged
```

Prepare build resources and an unpacked application:

```bash
npm run desktop:prepare
npm run desktop:pack
```

Build installers:

```bash
npm run desktop:dist
npm run desktop:dist:win
npm run desktop:dist:mac
```

## Updates

Packaged Windows NSIS and macOS builds use `electron-updater` with GitHub Releases. When automatic updates are enabled, Desktop downloads a newer validated build and asks before restarting to install it. Projects remain outside the application bundle.

## Signing and notarization

End users do not obtain or enter signing credentials. Repository maintainers configure them once so Windows and macOS can show a trusted publisher. See [`SIGNING.md`](SIGNING.md).

## Process model

```text
Electron main process
  ├── installation and setup wizard
  ├── system and agent installation
  ├── settings, diagnostics, and repair
  ├── updater and native OS integration
  └── existing createStudioServer()
        └── real AIgent Studio at 127.0.0.1
```

## Repair and diagnostics

**Repair installation** verifies the workspace, clears only safe runtime state, runs the bundled doctor, refreshes tool detection, and restarts Studio when needed.

**Export diagnostics** writes a redacted report with application versions, workspace health, tool detection, Studio status, settings without credentials, and recent logs. It does not read or export agent tokens or API keys.

## Uninstall

Windows uses the normal entry in **Installed Apps**. macOS users remove AIgent Desktop from Applications. Uninstalling the application does not delete the selected project workspace.

## Security boundary

- context isolation enabled;
- renderer sandbox enabled;
- Node integration disabled;
- constrained preload IPC;
- permission requests denied by default;
- external links opened by the operating system;
- Studio bound to `127.0.0.1`;
- no generic shell endpoint;
- installation commands restricted to documented official tools;
- projects stored outside the application bundle.
