# Getting started on Windows

This guide is for people who have never opened a terminal or built a website before.

## Recommended: install AIgent Desktop

1. Open the [latest AIgent Design System release](https://github.com/wrg32786/aigent-design-system/releases/latest).
2. Download `AIgent-Desktop-Setup-Windows-x64.exe`.
3. Open the Downloads folder.
4. Double-click the installer.
5. Complete the normal Windows installation screens.
6. AIgent Desktop opens its guided setup wizard.

Direct download:

[Download AIgent Desktop for Windows](https://github.com/wrg32786/aigent-design-system/releases/latest/download/AIgent-Desktop-Setup-Windows-x64.exe)

## If Windows shows a security warning

Until the installer is signed by a configured public code-signing certificate, Windows may show **Windows protected your PC**.

1. Confirm the file was downloaded from `github.com/wrg32786/aigent-design-system`.
2. Click **More info**.
3. Click **Run anyway**.

People installing AIgent Desktop never need the signing keys described in the maintainer documentation.

## Setup wizard

### Step 1: choose a workspace

Keep the suggested folder or choose another normal folder under Documents. This is where AIgent saves sites, decks, project history, and local exports.

Avoid Windows, System32, Program Files, or other protected operating-system folders.

### Step 2: check the computer

AIgent Desktop includes the runtime needed to launch Studio. Git is recommended for safe checkpoints and may be required by the selected coding agent. When a supported requirement is missing, the wizard explains it and provides the installation action.

### Step 3: connect an AI account

Choose one option:

- **Claude Code** for a Claude account.
- **Codex** for a ChatGPT or OpenAI account.
- **Manual prompt** to use Studio without connecting a local agent yet.

Use **Install for me**, then **Connect account**. Complete the provider's official browser or terminal sign-in. AIgent Desktop does not ask for an API key.

### Step 4: work locally first

A complete site can be created and previewed on the computer without hosting.

When a public link is needed, connect a free Vercel, Netlify, or Cloudflare account through Studio's **Ship** tab.

### Step 5: launch Studio

Choose **Launch AIgent Studio** to open the visual builder.

## Build a first project

1. Click **New** in the top bar.
2. Enter a project name.
3. Choose a starter:
   - Blank site
   - Cinematic scroll page
   - Immersive sales deck
   - Command center interface
   - Progressive Three.js stage
4. Explain the project in plain English.
5. Click **Create project**.
6. Open the **Agent** tab.
7. Choose **Build / revise**.
8. Review the live preview.
9. Switch to **Design** mode and click any visible element to edit it.
10. Use Desktop, Tablet, and Mobile to check every layout.
11. Choose **Distill canvas edits into source** after approving visual changes.
12. Open **Ship** to export or publish.

## Publish for free

Start with **Local export** to create the finished public files without uploading anything.

For a public URL:

1. Open **Ship**.
2. Choose Vercel, Netlify, or Cloudflare Pages.
3. Choose **Preview** while testing or **Production** when the site is final.
4. Use the provider sign-in button and complete the official login.
5. Choose **Publish site**.
6. Open the public URL recorded in deployment history.

## Optional terminal installation

The desktop installer is the recommended route. The command-line route is available for developers and advanced users.

Always run development commands inside a normal user-owned project folder. Tools commonly inspect the current directory, so protected locations such as `C:\Windows\System32` can produce `EPERM` or access-denied errors.

```powershell
New-Item -ItemType Directory -Force "$HOME\Documents\AIgent-Studio" | Out-Null
Set-Location "$HOME\Documents\AIgent-Studio"
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
node scripts/studio-server.mjs --open
```

Studio opens at:

```text
http://127.0.0.1:4180/studio/
```

## Getting help

Use **Setup & Diagnostics** inside AIgent Desktop to:

- run the computer checks again;
- repair the installation;
- open the project workspace;
- check for updates;
- export a redacted diagnostics report;
- open the application logs.

Report reproducible problems through the repository's GitHub Issues page and attach the diagnostics report when useful. The report does not contain AI credentials.
