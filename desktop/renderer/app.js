const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const desktop = window.aigentDesktop;
const params = new URLSearchParams(location.search);
const state = { step: params.get("mode") === "settings" ? 5 : 1, payload: null, installing: false, authPolling: null };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function setStatus(message) { $("#footer-status").textContent = message; }
function showError(message = "") {
  const banner = $("#error-banner");
  banner.textContent = message;
  banner.hidden = !message;
}

function currentConfig() { return state.payload?.config || {}; }
function currentEnvironment() { return state.payload?.environment || {}; }

function renderStep() {
  $$("[data-step]").forEach((screen) => { screen.hidden = Number(screen.dataset.step) !== state.step; });
  $$("[data-step-marker]").forEach((marker) => {
    const markerStep = Number(marker.dataset.stepMarker);
    marker.dataset.state = markerStep < state.step ? "complete" : markerStep === state.step ? "current" : "pending";
  });
  $("#back-step").disabled = state.step === 1;
  $("#next-step").hidden = state.step === 5;
  $("#next-step").textContent = state.step === 4 ? "Finish setup" : "Continue";
  if (state.step === 5) renderReady();
}

function statusCard(label, value, hint, optional = false) {
  const available = Boolean(value?.available);
  const ready = available || optional;
  const stateLabel = available ? "Ready" : optional ? "Optional" : "Needs attention";
  return `<article class="check-card" data-ready="${ready}"><span class="check-dot"></span><div><strong>${escapeHtml(label)}</strong><small title="${escapeHtml(value?.command || value?.error || "")}">${escapeHtml(value?.version || (optional ? hint : value?.error || hint))}</small></div><b>${stateLabel}</b></article>`;
}

function renderEnvironment() {
  const environment = currentEnvironment();
  const developerTools = environment.node?.available && environment.npm?.available
    ? { available: true, version: `${environment.node.version || "Node.js"} · npm ${environment.npm.version || "ready"}` }
    : { available: false, version: "Only needed for advanced developer workflows" };
  $("#environment-grid").innerHTML = [
    statusCard("AIgent Desktop", environment.runtime, "Included with the application"),
    statusCard("Project folder", environment.workspace, "Choose where projects are saved"),
    statusCard("Project history", environment.git, "Installed automatically when Claude needs it", true),
    statusCard("Developer tools", developerTools, "Not required to launch or use AIgent Desktop", true),
  ].join("");
}

function providerLabel(provider) {
  return provider === "claude" ? "Claude Code" : provider === "codex" ? "Codex" : "Manual prompt";
}

function renderAgents() {
  const environment = currentEnvironment();
  const selected = currentConfig().preferredAgent || "manual";
  $('[name="preferred-agent"]').forEach((radio) => { radio.checked = radio.value === selected; });
  $('[data-agent-card]').forEach((card) => { card.dataset.selected = String(card.dataset.agentCard === selected); });
  for (const provider of ["claude", "codex"]) {
    const info = environment[provider];
    const connected = Boolean(info?.authenticated);
    const statusNode = $(`[data-agent-status="${provider}"]`);
    statusNode.textContent = connected ? "Account connected" : info?.available ? "Installed · account connection not confirmed" : "Not installed yet";
    statusNode.classList.toggle("ready", Boolean(info?.available));
    statusNode.classList.toggle("connected", connected);
    statusNode.title = info?.authMessage || info?.error || "";
    const installButton = $(`[data-install-agent="${provider}"]`);
    const authButton = $(`[data-auth-agent="${provider}"]`);
    installButton.disabled = state.installing;
    installButton.textContent = info?.available ? "Repair / reinstall" : "Install for me";
    authButton.disabled = !info?.available || state.installing;
    authButton.textContent = connected ? "Reconnect account" : "Connect account";
  }
}

function renderPreferences() {
  $("#launch-at-login").checked = Boolean(currentConfig().launchAtLogin);
  $("#automatic-updates").checked = currentConfig().automaticUpdates !== false;
}

function renderReady() {
  const config = currentConfig();
  $("#ready-workspace").textContent = config.workspace || "Not selected";
  $("#ready-agent").textContent = providerLabel(config.preferredAgent);
  renderUpdate(state.payload?.update);
}

function renderUpdate(update = {}) {
  const node = $("#update-status");
  const suffix = update.percent ? ` · ${update.percent}%` : "";
  node.textContent = `${update.message || "Updates not checked"}${suffix}`;
  node.dataset.state = update.state || "idle";
}

function render() {
  if (!state.payload) return;
  $("#app-version").textContent = `v${state.payload.app.version}`;
  $("#workspace-path").textContent = currentConfig().workspace;
  renderEnvironment();
  renderAgents();
  renderPreferences();
  renderStep();
  const connected = ["claude", "codex"].filter((provider) => currentEnvironment()[provider]?.authenticated).map(providerLabel);
  const available = ["claude", "codex"].filter((provider) => currentEnvironment()[provider]?.available).map(providerLabel);
  setStatus(connected.length ? `${connected.join(" + ")} connected` : available.length ? `${available.join(" + ")} installed · connect an account or continue manually` : "Choose an AI agent or continue in manual mode");
}

async function refresh() {
  state.payload = await desktop.getState();
  render();
}

async function nextStep() {
  try {
    showError("");
    if (state.step === 1 && !currentEnvironment().workspace?.available) throw new Error("Choose a writable project folder before continuing.");
    if (state.step === 3) {
      const selected = $('[name="preferred-agent"]:checked')?.value || "manual";
      if (selected !== "manual" && !currentEnvironment()[selected]?.available) throw new Error(`Choose Install for me under ${providerLabel(selected)}, or continue with manual prompt mode.`);
      state.payload = await desktop.saveConfig({ preferredAgent: selected });
    }
    if (state.step === 4) {
      state.payload = await desktop.saveConfig({
        onboardingComplete: true,
        launchAtLogin: $("#launch-at-login").checked,
        automaticUpdates: $("#automatic-updates").checked,
      });
    }
    state.step = Math.min(5, state.step + 1);
    render();
  } catch (error) { showError(error.message); }
}

async function chooseWorkspace() {
  try {
    showError("");
    const result = await desktop.chooseWorkspace();
    if (result) state.payload = result;
    render();
  } catch (error) { showError(error.message); }
}

async function refreshEnvironment() {
  setStatus("Checking this computer…");
  try { state.payload = await desktop.refreshEnvironment(); render(); }
  catch (error) { showError(error.message); }
}

async function installAgent(provider) {
  state.authPolling = null;
  state.installing = true;
  $("#install-console").hidden = false;
  $("#install-log").textContent = "";
  setStatus(`Installing ${providerLabel(provider)} and any required helper tools…`);
  renderAgents();
  try {
    await desktop.installAgent(provider);
    await refreshEnvironment();
    setStatus(`${providerLabel(provider)} is installed. Choose Connect account to sign in.`);
  } catch (error) {
    showError(`${providerLabel(provider)} could not be installed automatically. ${error.message}`);
  } finally {
    state.installing = false;
    renderAgents();
  }
}

function delay(duration) { return new Promise((resolve) => setTimeout(resolve, duration)); }

async function waitForAuthentication(provider) {
  const token = Symbol(provider);
  state.authPolling = token;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await delay(3000);
    if (state.authPolling !== token) return;
    try {
      state.payload = await desktop.refreshEnvironment();
      render();
      if (currentEnvironment()[provider]?.authenticated) {
        state.authPolling = null;
        setStatus(`${providerLabel(provider)} connected. Continue when ready.`);
        return;
      }
      setStatus(`Waiting for ${providerLabel(provider)} sign-in…`);
    } catch { /* continue polling while the provider owns the sign-in flow */ }
  }
  if (state.authPolling === token) {
    state.authPolling = null;
    setStatus(`Finish ${providerLabel(provider)} sign-in, then choose Run checks again.`);
  }
}

async function authenticateAgent(provider) {
  try {
    showError("");
    await desktop.authenticateAgent(provider);
    setStatus(`Complete the ${providerLabel(provider)} sign-in in the window that opened. AIgent will detect the connection automatically.`);
    waitForAuthentication(provider).catch(() => {});
  } catch (error) { showError(error.message); }
}

async function savePreference(key, value) {
  try { state.payload = await desktop.saveConfig({ [key]: value }); render(); }
  catch (error) { showError(error.message); }
}

async function action(button, task, workingLabel) {
  const previous = button.textContent;
  button.disabled = true;
  if (workingLabel) button.textContent = workingLabel;
  try { return await task(); }
  catch (error) { showError(error.message); return null; }
  finally { button.disabled = false; button.textContent = previous; }
}

function bind() {
  $("#next-step").addEventListener("click", nextStep);
  $("#back-step").addEventListener("click", () => { state.step = Math.max(1, state.step - 1); showError(""); render(); });
  $("#choose-workspace").addEventListener("click", chooseWorkspace);
  $("#refresh-environment").addEventListener("click", refreshEnvironment);
  $("#get-node").addEventListener("click", () => desktop.openLink("node"));
  $("#get-git").addEventListener("click", () => desktop.openLink("git"));
  $("#open-docs").addEventListener("click", () => desktop.openLink("repository"));
  $("#open-logs").addEventListener("click", () => desktop.openLogs());
  $("#clear-console").addEventListener("click", () => { $("#install-log").textContent = ""; });
  $$('[name="preferred-agent"]').forEach((radio) => radio.addEventListener("change", () => {
    $$('[data-agent-card]').forEach((card) => { card.dataset.selected = String(card.dataset.agentCard === radio.value); });
  }));
  $$('[data-install-agent]').forEach((button) => button.addEventListener("click", () => installAgent(button.dataset.installAgent)));
  $$('[data-auth-agent]').forEach((button) => button.addEventListener("click", () => authenticateAgent(button.dataset.authAgent)));
  $("#launch-at-login").addEventListener("change", (event) => savePreference("launchAtLogin", event.target.checked));
  $("#automatic-updates").addEventListener("change", (event) => savePreference("automaticUpdates", event.target.checked));
  $("#launch-studio").addEventListener("click", () => action($("#launch-studio"), () => desktop.launchStudio(), "Launching Studio…"));
  $("#open-workspace").addEventListener("click", () => desktop.openWorkspace());
  $("#run-repair").addEventListener("click", () => action($("#run-repair"), async () => { const result = await desktop.repair(); state.payload = result.state; setStatus("Repair completed successfully."); render(); }, "Repairing…"));
  $("#export-diagnostics").addEventListener("click", () => action($("#export-diagnostics"), async () => { const file = await desktop.exportDiagnostics(); if (file) setStatus(`Diagnostics saved to ${file}`); }, "Exporting…"));
  $("#check-updates").addEventListener("click", () => action($("#check-updates"), async () => { const update = await desktop.checkUpdates(); state.payload.update = update; renderUpdate(update); }, "Checking…"));
  $("#remove-app-data").addEventListener("click", () => action($("#remove-app-data"), async () => { if (await desktop.removeAppData()) { state.step = 1; await refresh(); } }, "Removing…"));
  desktop.onInstall((event) => {
    $("#install-console").hidden = false;
    const log = $("#install-log");
    if (event.state === "log") log.textContent += event.message;
    else log.textContent += `\n${event.message}\n`;
    log.scrollTop = log.scrollHeight;
  });
  desktop.onUpdate((update) => {
    if (state.payload) state.payload.update = update;
    renderUpdate(update);
  });
}

async function initialize() {
  if (!desktop) {
    showError("AIgent Desktop must be opened through the installed application.");
    return;
  }
  bind();
  try {
    await refresh();
    const queryError = params.get("error");
    if (queryError) showError(queryError);
  } catch (error) { showError(error.message); setStatus("Desktop service unavailable"); }
}

initialize();
