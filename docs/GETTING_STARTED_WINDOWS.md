# Getting started on Windows

This guide assumes you have never opened a terminal or built a website before.

## Recommended: install the desktop app

1. Open the [latest AIgent Design System release](https://github.com/wrg32786/aigent-design-system/releases/latest).
2. Download `AIgent-Desktop-Setup-Windows-x64.exe`.
3. Open your Downloads folder.
4. Double-click the installer.
5. Complete the normal Windows installation screens.
6. AIgent Desktop opens the setup wizard.

Direct download:

[Download AIgent Desktop for Windows](https://github.com/wrg32786/aigent-design-system/releases/latest/download/AIgent-Desktop-Setup-Windows-x64.exe)

## If Windows shows a security warning

Until the installer is signed by a configured public code-signing certificate, Windows may show **Windows protected your PC**.

1. Confirm the file was downloaded from `github.com/wrg32786/aigent-design-system`.
2. Click **More info**.
3. Click **Run anyway**.

End users never need the signing keys described in the maintainer documentation.

## Setup wizard

### Step 1: Workspace

Keep the suggested folder or choose another normal folder under Documents. This is where AIgent saves your sites and decks.

Do not choose `C:\Windows`, `C:\Windows\System32`, Program Files, or another protected operating-system folder.

### Step 2: Computer check

AIgent Desktop contains the runtime needed to run Studio. Git is recommended for safe checkpoints and is required by Claude Code on native Windows. When it is missing, click **Install Git for me**.

### Step 3: Connect your AI

Choose one option:

- **Claude Code** if you use Claude.
- **Codex** if you use ChatGPT or OpenAI Codex.
- **Manual prompt** to use Studio without connecting a local agent yet.

Click **Install for me**. When installation completes, click **Connect account**. A sign-in window opens. Follow the prompts and browser login; you do not need to type installation commands.

### Step 4: Local first, hosting later

You can create and preview a complete site on your own computer without paying for hosting.

When you want a public link, create a free account with Vercel, Netlify, or Cloudflare. Studio's **Ship** tab opens the official provider login and publishes the finished site.

### Step 5: Launch

Click **Launch AIgent Studio and create my first project**.

## Build your first project

1. Click **New** in the top bar.
2. Enter a project name.
3. Choose a starter:
   - Blank site
   - Cinematic scroll page
   - Immersive sales deck
   - Command center interface
   - Progressive Three.js stage
4. Explain what you want in plain English.
5. Click **Create project**.
6. Open the **Agent** tab.
7. Click **Build / revise**.
8. Watch the live preview update.
9. Switch to **Design** mode and click any visible element to edit it.
10. Use Desktop, Tablet, and Mobile buttons to check every layout.
11. Click **Distill canvas edits into source** after approving visual edits.
12. Open **Ship** when you are ready to export or publish.

## Publish for free

You can begin with **Local export**, which creates the finished public files without uploading anything.

For a public URL:

1. Open **Ship**.
2. Choose Vercel, Netlify, or Cloudflare Pages.
3. Choose **Preview** while testing or **Production** when the site is final.
4. Click the provider sign-in button and follow the browser login.
5. Click **Publish site**.
6. Open the public URL shown in deployment history.

## The PowerShell error in the screenshot

The command was run from:

```text
PS C:\Windows\System32>
```

That folder contains protected Windows files. The shadcn program tried to inspect `C:\Windows\System32\config`, and Windows returned:

```text
EPERM: operation not permitted
```

Use the desktop installer instead. For the optional terminal route, first move to a normal folder:

```powershell
New-Item -ItemType Directory -Force "$HOME\Documents\AIgent-Studio" | Out-Null
Set-Location "$HOME\Documents\AIgent-Studio"
pnpm dlx shadcn@latest add wrg32786/aigent-design-system/full-studio
node scripts/studio-server.mjs --open
```

After the final command, Studio opens at:

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

Report reproducible problems through the repository's GitHub Issues page and attach the diagnostics report when useful. It does not contain AI credentials.
