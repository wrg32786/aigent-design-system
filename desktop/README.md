# AIgent Desktop

AIgent Desktop wraps the existing localhost AIgent Studio in a thin Electron shell. The DOM-backed Canvas, project model, agent skills, Resolve, Vision, and source files remain the same; Desktop adds native installation, first-run setup, process management, updates, diagnostics, repair, shortcuts, and OS integration.

## Installers

The desktop release workflow produces:

- Windows x64 assisted NSIS installer (`.exe`)
- macOS Apple Silicon and Intel disk images (`.dmg`)
- macOS Apple Silicon and Intel update archives (`.zip`)
- updater metadata and differential blockmaps

The Windows wizard lets the user choose an installation directory, creates Start-menu and desktop shortcuts, registers the normal Windows uninstaller, and preserves project data on uninstall. The macOS image installs by dragging AIgent Desktop into Applications.

## First-run wizard

The five-step setup flow:

1. chooses a separate, writable project workspace;
2. verifies the bundled runtime, Git, external Node/npm, and Windows Git Bash when relevant;
3. installs Claude Code or Codex with the official npm package and opens the official local authentication flow;
4. configures launch-at-login and automatic updates;
5. launches the real AIgent Studio Canvas.

Installation and authentication actions are allowlisted. The renderer receives a narrow context-isolated API and cannot submit arbitrary shell commands.

## Development

```bash
npm install
npm run desktop:start
```

Checks and smoke test:

```bash
npm run desktop:check
npm run desktop:smoke
```

Generate custom installer artwork, download the architecture-matched Playwright browser, and build an unpacked application:

```bash
npm run desktop:prepare
npm run desktop:pack
```

Build the current platform installer:

```bash
npm run desktop:dist
```

Platform-specific builds:

```bash
npm run desktop:dist:win
npm run desktop:dist:mac
```

## Updates

Packaged Windows NSIS and macOS builds use `electron-updater` against this repository's GitHub Releases. AIgent Desktop checks after startup when automatic updates are enabled, downloads the newer published build, and asks the operator before restarting to install it. Operating-system trust requires the signing credentials documented below. Apple Silicon and Intel builds use separate update channels so each Mac receives the matching architecture. Project workspaces live outside the application bundle and are not removed by updates.

## Signing and notarization

The GitHub workflow can build unsigned test installers without credentials. Public trusted installers require repository secrets.

### Windows code signing

```text
WIN_CSC_LINK
WIN_CSC_KEY_PASSWORD
```

`WIN_CSC_LINK` may be a base64-encoded certificate or another certificate source supported by electron-builder.

### macOS signing and notarization

```text
MAC_CSC_LINK
MAC_CSC_KEY_PASSWORD
APPLE_API_KEY
APPLE_API_KEY_ID
APPLE_API_ISSUER
```

The workflow passes these only to the platform build. Never commit certificates, passwords, private keys, or Apple credentials.

## Process model

```text
Electron main process
  ├── installation and setup wizard
  ├── settings, diagnostics, and repair
  ├── native workspace and OS dialogs
  ├── update manager
  └── existing createStudioServer()
        └── real AIgent Studio at 127.0.0.1
```

Electron carries the runtime required by AIgent itself. Packaged AIgent scripts run through Electron's Node mode. Claude Code and Codex remain separately installed and authenticated local tools discovered through the user's configured environment.

Each native installer also bundles the architecture-matched Playwright headless Chromium used by reference forensics, Resolve, and Vision. Those workflows therefore do not require the user to install a separate QA browser after setup.

## Repair and diagnostics

**Repair installation** verifies the workspace, clears only safe desktop runtime state, runs the bundled AIgent doctor, refreshes tool detection, and restarts Studio when needed.

**Export diagnostics** writes a redacted text report containing:

- application and platform versions;
- workspace health;
- Git, Node, npm, Claude Code, and Codex detection;
- local Studio status;
- current desktop settings without credentials;
- recent desktop log output.

No API keys, auth tokens, or agent credential files are read or exported.

## Uninstall

Windows uses the NSIS uninstaller shown in Installed Apps. macOS users remove AIgent Desktop from Applications. The application deliberately does not delete the selected Studio workspace or projects. The Setup & Diagnostics screen includes a separate action to remove only desktop settings and logs.

## Security boundary

- context isolation enabled;
- renderer sandbox enabled;
- Node integration disabled;
- constrained preload IPC rather than raw `ipcRenderer` exposure;
- permission requests denied by default;
- external links opened by the operating system;
- Studio bound to `127.0.0.1`;
- no generic shell or command endpoint;
- installation commands fixed to the official Claude Code and Codex packages;
- projects stored outside the application bundle.
