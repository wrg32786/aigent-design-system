from pathlib import Path


def replace(path, old, new):
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"Expected Vision repair contract not found in {path}: {old[:100]!r}")
    file.write_text(text.replace(old, new, 1))


replace(
    "templates/modular-scroll-starter/index.html",
    '''    .wordmark {
      color: var(--ds-color-text);
      font: 600 0.72rem/1 var(--ds-font-mono);
      letter-spacing: 0.12em;
      text-decoration: none;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .scene {''',
    '''    .wordmark {
      color: var(--ds-color-text);
      font: 600 0.72rem/1 var(--ds-font-mono);
      letter-spacing: 0.12em;
      text-decoration: none;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .ds-theme-select {
      display: none;
      align-items: center;
      gap: 0.5rem;
      color: var(--ds-color-muted);
      font: 600 0.68rem/1 var(--ds-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ds-theme-select select {
      min-height: 44px;
      max-width: 140px;
      padding: 0 32px 0 12px;
      border: 1px solid var(--ds-color-rule-strong);
      border-radius: var(--ds-radius-pill);
      background: var(--ds-color-panel-strong);
      color: var(--ds-color-text);
      font: 600 0.78rem/1 var(--ds-font-body);
    }

    .ds-theme-select select:focus-visible {
      outline: 3px solid var(--ds-color-accent);
      outline-offset: 3px;
    }

    .scene {''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''    @media (max-width: 560px) {
      .topbar {
        display: block;
      }

      .wordmark {
        display: block;
        max-width: 100%;
        margin-bottom: 10px;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .ds-theme-picker {
        width: 100%;
        max-width: calc(100vw - 32px);
        flex-wrap: wrap;
        overflow: visible;
      }

      .ds-theme-button {
        flex: 1 1 calc(50% - 0.2rem);
        min-width: 0;
      }

      .actions .ds-button {''',
    '''    @media (max-width: 560px) {
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;
        gap: 12px;
      }

      .wordmark {
        display: block;
        max-width: 48%;
        margin: 0;
        padding-top: 0;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .ds-theme-picker {
        display: none;
      }

      .ds-theme-select {
        display: flex;
        flex: 0 1 auto;
        min-width: 0;
      }

      .ds-theme-select span {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .actions .ds-button {''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''    <div class="ds-theme-picker" role="group" aria-label="Color theme">
      <button class="ds-theme-button" type="button" data-set-theme="graphite">Graphite</button>
      <button class="ds-theme-button" type="button" data-set-theme="aigent">AIgent</button>
      <button class="ds-theme-button" type="button" data-set-theme="ember">Ember</button>
      <button class="ds-theme-button" type="button" data-set-theme="cobalt">Cobalt</button>
      <button class="ds-theme-button" type="button" data-set-theme="paper">Paper</button>
    </div>
  </header>''',
    '''    <div class="ds-theme-picker" role="group" aria-label="Color theme">
      <button class="ds-theme-button" type="button" data-set-theme="graphite">Graphite</button>
      <button class="ds-theme-button" type="button" data-set-theme="aigent">AIgent</button>
      <button class="ds-theme-button" type="button" data-set-theme="ember">Ember</button>
      <button class="ds-theme-button" type="button" data-set-theme="cobalt">Cobalt</button>
      <button class="ds-theme-button" type="button" data-set-theme="paper">Paper</button>
    </div>
    <label class="ds-theme-select" for="mobile-theme">
      <span>Color theme</span>
      <select id="mobile-theme" aria-label="Color theme">
        <option value="graphite">Graphite</option>
        <option value="aigent">AIgent</option>
        <option value="ember">Ember</option>
        <option value="cobalt">Cobalt</option>
        <option value="paper">Paper</option>
      </select>
    </label>
  </header>''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''    mountReveals();
    mountThemePicker();
  </script>''',
    '''    mountReveals();
    mountThemePicker();

    const mobileTheme = document.querySelector("#mobile-theme");
    if (mobileTheme) {
      mobileTheme.value = document.documentElement.dataset.theme || "graphite";
      mobileTheme.addEventListener("change", () => {
        document.querySelector(`[data-set-theme="${CSS.escape(mobileTheme.value)}"]`)?.click();
      });
      for (const button of document.querySelectorAll("[data-set-theme]")) {
        button.addEventListener("click", () => {
          mobileTheme.value = button.dataset.setTheme;
        });
      }
    }
  </script>''',
)

replace(
    "scripts/smoke.mjs",
    '''      if (url === "/templates/modular-scroll-starter/") {
        await page.locator('[data-set-theme="paper"]').click();
        const theme = await page.locator("html").getAttribute("data-theme");
        const pressed = await page.locator('[data-set-theme="paper"]').getAttribute("aria-pressed");
        if (theme !== "paper" || pressed !== "true") {
          throw new Error(`${viewport.name} ${url}: theme picker state failed`);
        }
      }''',
    '''      if (url === "/templates/modular-scroll-starter/") {
        const mobileTheme = page.locator("#mobile-theme");
        if (viewport.name === "mobile" && await mobileTheme.isVisible()) {
          await mobileTheme.selectOption("paper");
        } else {
          await page.locator('[data-set-theme="paper"]').click();
        }
        const theme = await page.locator("html").getAttribute("data-theme");
        const pressed = await page.locator('[data-set-theme="paper"]').getAttribute("aria-pressed");
        if (theme !== "paper" || pressed !== "true") {
          throw new Error(`${viewport.name} ${url}: theme picker state failed`);
        }
      }''',
)

print("Recomposed the mobile theme control identified by AIgent Vision.")
