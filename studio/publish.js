let dependencies = null;
let publishState = null;
let running = false;
let bound = false;

const $ = (selector, root = document) => root.querySelector(selector);

function project() { return dependencies?.getProject?.() || null; }
function canvas() { return dependencies?.getCanvas?.() || null; }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
function appendLog(message, kind = "") {
  const container = $("#publish-log");
  if (!container) return;
  const row = document.createElement("div");
  row.className = `publish-log-entry ${kind}`.trim();
  row.textContent = message;
  container.append(row);
  while (container.children.length > 120) container.firstElementChild?.remove();
  container.scrollTop = container.scrollHeight;
}
function provider() { return $("#publish-provider")?.value || "local"; }
function setBusy(value) {
  running = value;
  for (const selector of ["#publish-submit", "#publish-auth", "#publish-export"]) {
    const node = $(selector);
    if (node) node.disabled = value || !project();
  }
  renderGate();
}
function renderGate() {
  const gate = $("#publish-gate");
  if (!gate) return;
  const operations = publishState?.activeCanvasOperations ?? canvas()?.activeOperations?.length ?? 0;
  if (!project()) {
    gate.dataset.state = "idle";
    gate.innerHTML = "<strong>No project selected.</strong><span>Create or open a project before shipping.</span>";
  } else if (operations > 0) {
    gate.dataset.state = "blocked";
    gate.innerHTML = `<strong>Publish blocked.</strong><span>${operations} Canvas operation${operations === 1 ? " is" : "s are"} still active. Distill or clear the journal first.</span>`;
  } else {
    gate.dataset.state = "ready";
    gate.innerHTML = "<strong>Ready to ship.</strong><span>AIgent will checkpoint, export only public dependencies, verify, deploy, and record the result.</span>";
  }
  const submit = $("#publish-submit");
  if (submit) submit.disabled = running || !project() || operations > 0;
  const exportButton = $("#publish-export");
  if (exportButton) exportButton.disabled = running || !project() || operations > 0;
}
function fillProviders() {
  const select = $("#publish-provider");
  if (!select || !publishState?.providers) return;
  const selected = select.value || "local";
  select.innerHTML = "";
  for (const item of publishState.providers) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.label}${item.available ? "" : " — unavailable"}`;
    option.disabled = !item.available;
    select.append(option);
  }
  if ([...select.options].some((option) => option.value === selected && !option.disabled)) select.value = selected;
  else select.value = [...select.options].find((option) => !option.disabled)?.value || "local";
  updateProviderHelp();
}
function updateProviderHelp() {
  const selected = publishState?.providers?.find((item) => item.id === provider());
  const help = $("#publish-provider-help");
  if (help) help.textContent = selected?.description || "Choose a deployment target.";
  const auth = $("#publish-auth");
  if (auth) {
    auth.hidden = provider() === "local";
    auth.textContent = `Connect ${selected?.label || "provider"}`;
  }
  const domain = $("#publish-domain");
  if (domain) domain.disabled = provider() === "local";
  const domainHelp = $("#publish-domain-help");
  if (domainHelp) {
    domainHelp.textContent = provider() === "vercel"
      ? "Vercel can apply the alias after deployment."
      : provider() === "local"
        ? "A local export has no domain."
        : "AIgent records the domain; finish DNS ownership in the provider dashboard.";
  }
}
function deploymentStatusLabel(item) {
  const values = {
    queued: "Queued", exported: "Exported", preflight: "Preflight", deploying: "Deploying", deployed: "Live",
    "deployed-with-findings": "Live with findings", failed: "Failed",
  };
  return values[item.status] || item.status || "Unknown";
}
function renderDeployments() {
  const container = $("#publish-history");
  if (!container) return;
  const deployments = publishState?.state?.deployments || [];
  container.innerHTML = "";
  if (!deployments.length) {
    container.innerHTML = "<small>No deployments yet. Publish a preview first.</small>";
    return;
  }
  for (const item of deployments.slice(0, 20)) {
    const card = document.createElement("article");
    card.className = "publish-card";
    card.dataset.status = item.status;
    const qa = item.qa ? `${item.qa.pass ? "Resolve passed" : "Resolve findings"}${item.qa.score != null ? ` · ${item.qa.score}` : ""}` : "QA not recorded";
    card.innerHTML = `
      <header><strong>${escapeHtml(item.siteName || "Site")}</strong><span>${escapeHtml(deploymentStatusLabel(item))}</span></header>
      <small>${escapeHtml(item.provider)} · ${escapeHtml(item.mode)} · ${new Date(item.createdAt).toLocaleString()}</small>
      <p>${escapeHtml(item.url || item.outputDirectory || item.error || "Waiting for provider output")}</p>
      <footer><span>${escapeHtml(qa)}</span><div>${item.url ? '<a data-open target="_blank" rel="noopener">Open</a>' : ""}<button type="button" data-rollback>Redeploy</button></div></footer>`;
    const open = $("[data-open]", card);
    if (open) open.href = item.url;
    const rollback = $("[data-rollback]", card);
    rollback.disabled = running || !item.outputDirectory || item.status === "failed";
    rollback.addEventListener("click", () => rollbackDeployment(item.id));
    container.append(card);
  }
  const latest = deployments[0];
  const result = $("#publish-result");
  if (result) {
    result.hidden = !latest;
    $("#publish-result-status").textContent = latest ? deploymentStatusLabel(latest) : "";
    const link = $("#publish-result-url");
    if (link) {
      link.textContent = latest?.url || latest?.outputDirectory || "";
      link.href = latest?.url || "#";
      link.hidden = !latest?.url;
    }
    const dashboard = $("#publish-dashboard");
    if (dashboard) {
      dashboard.href = latest?.dashboardUrl || "#";
      dashboard.hidden = !latest?.dashboardUrl;
    }
  }
}
function render() {
  fillProviders();
  const site = $("#publish-site-name");
  if (site && !site.value) site.value = publishState?.suggestedSiteName || project()?.id || "aigent-site";
  renderGate();
  renderDeployments();
}

export async function refreshPublishPanel() {
  if (!dependencies || !project()) {
    publishState = null;
    render();
    return;
  }
  try {
    publishState = await dependencies.api(`/api/projects/${project().id}/publish`, { headers: {} });
    render();
  } catch (error) {
    appendLog(error.message, "error");
    dependencies.toast(error.message);
  }
}

async function authenticate() {
  if (!project() || running || provider() === "local") return;
  setBusy(true);
  dependencies.setRightTab("publish");
  appendLog(`Opening ${provider()} authentication…`, "system");
  try {
    await dependencies.api(`/api/projects/${project().id}/publish/auth`, { method: "POST", body: { provider: provider() } });
  } catch (error) {
    setBusy(false);
    appendLog(error.message, "error");
    dependencies.toast(error.message);
  }
}
async function exportBundle() {
  if (!project() || running) return;
  setBusy(true);
  appendLog("Creating constrained production export…", "system");
  try {
    await dependencies.api(`/api/projects/${project().id}/publish/export`, { method: "POST", body: { author: dependencies.getAuthor() } });
  } catch (error) {
    setBusy(false);
    appendLog(error.message, "error");
    dependencies.toast(error.message);
  }
}
async function publish(event) {
  event.preventDefault();
  if (!project() || running) return;
  const body = {
    provider: provider(),
    mode: $("#publish-mode").value,
    siteName: $("#publish-site-name").value,
    domain: $("#publish-domain").value,
    verify: $("#publish-verify").checked,
    vision: $("#publish-vision").checked,
    author: dependencies.getAuthor(),
  };
  setBusy(true);
  appendLog(`Starting ${body.mode} deployment to ${body.provider}…`, "system");
  try {
    await dependencies.api(`/api/projects/${project().id}/publish`, { method: "POST", body });
  } catch (error) {
    setBusy(false);
    appendLog(error.message, "error");
    dependencies.toast(error.message);
  }
}
async function rollbackDeployment(deploymentId) {
  if (!project() || running) return;
  if (!confirm("Redeploy this exact recorded artifact as a new deployment?")) return;
  setBusy(true);
  appendLog(`Redeploying ${deploymentId}…`, "system");
  try {
    await dependencies.api(`/api/projects/${project().id}/publish/rollback`, {
      method: "POST",
      body: { deploymentId, verify: $("#publish-verify").checked, vision: $("#publish-vision").checked, author: dependencies.getAuthor() },
    });
  } catch (error) {
    setBusy(false);
    appendLog(error.message, "error");
    dependencies.toast(error.message);
  }
}

export function publishTaskEvent(message) {
  if (!message) return;
  const isPublish = String(message.kind || "").startsWith("publish") || running;
  if (!isPublish) return;
  if (message.type === "start") {
    setBusy(true);
    dependencies?.setRightTab?.("publish");
    appendLog(`Started ${message.kind}${message.provider ? ` · ${message.provider}` : ""}.`, "system");
  }
  if (message.type === "log") appendLog(message.text, message.channel === "stderr" ? "error" : "");
  if (message.type === "error") appendLog(message.message, "error");
  if (message.type === "done") {
    setBusy(false);
    appendLog(message.code === 0 ? "Ship task complete." : `Ship task exited with code ${message.code}.`, message.code === 0 ? "done" : "error");
    refreshPublishPanel().catch(() => {});
  }
}

export function syncPublishGate() {
  renderGate();
}

export function initPublishPanel(values) {
  dependencies = values;
  if (bound) return;
  bound = true;
  $("#publish-provider")?.addEventListener("change", updateProviderHelp);
  $("#publish-form")?.addEventListener("submit", publish);
  $("#publish-auth")?.addEventListener("click", authenticate);
  $("#publish-export")?.addEventListener("click", exportBundle);
  $("#publish-refresh")?.addEventListener("click", () => refreshPublishPanel());
  renderGate();
}

const experienceShell = document.querySelector(".studio-shell");
const experienceToggle = document.querySelector("#experience-toggle");
const experienceProjectSelect = document.querySelector("#project-select");
const experienceGuide = document.querySelector("#studio-guide");
const experienceGuideCreate = document.querySelector("#guide-create-project");
const EXPERIENCE_STORAGE_KEY = "aigent-studio-experience";

function activeExperienceProjectId() {
  return experienceProjectSelect?.value || [...(experienceProjectSelect?.options || [])].find((option) => option.value)?.value || "";
}

function setExperience(next, persist = true) {
  if (!experienceShell || !experienceToggle) return;
  const experience = next === "advanced" ? "advanced" : "simple";
  experienceShell.dataset.experience = experience;
  experienceToggle.textContent = experience === "simple" ? "Advanced" : "Simple";
  experienceToggle.setAttribute("aria-pressed", String(experience === "advanced"));
  experienceToggle.title = experience === "simple" ? "Show advanced design and developer controls" : "Return to the simplified workflow";
  if (persist) localStorage.setItem(EXPERIENCE_STORAGE_KEY, experience);

  if (experience === "simple") {
    const selectedLeft = experienceShell.dataset.leftTab;
    const selectedRight = experienceShell.dataset.rightTab;
    if (selectedLeft === "library") document.querySelector('[data-left-tab="layers"]')?.click();
    if (["comments", "history"].includes(selectedRight)) document.querySelector('[data-right-tab="inspector"]')?.click();
  }
}

function syncExperienceProjectState() {
  if (!experienceShell) return;
  const hadProject = experienceShell.dataset.hasProject === "true";
  const hasProject = Boolean(activeExperienceProjectId());
  experienceShell.dataset.hasProject = String(hasProject);
  if (experienceGuide) experienceGuide.hidden = hasProject;

  if (!hadProject && hasProject && experienceShell.dataset.experience === "simple") {
    document.querySelector('[data-right-tab="agent"]')?.click();
  }
}

experienceToggle?.addEventListener("click", () => {
  setExperience(experienceShell?.dataset.experience === "simple" ? "advanced" : "simple");
});

experienceGuideCreate?.addEventListener("click", () => document.querySelector("#new-project")?.click());
experienceProjectSelect?.addEventListener("change", syncExperienceProjectState);

if (experienceProjectSelect) {
  new MutationObserver(syncExperienceProjectState).observe(experienceProjectSelect, { childList: true, subtree: true, attributes: true });
}

setExperience(localStorage.getItem(EXPERIENCE_STORAGE_KEY) || "simple", false);
syncExperienceProjectState();

const IMPROVE_ACTIONS = {
  bolder: ["Bolder", "Make the current design more distinctive and visually confident. Strengthen hierarchy, composition, typography, media, and one focal interaction without adding generic gradients, card clutter, gratuitous glow, or effects that do not earn their cost. Preserve product truth, working behavior, accessibility, and the established visual world. Run AIgent Taste on the changed surface, then check desktop and mobile."],
  quieter: ["Quieter", "Make the current design calmer and more disciplined. Remove decorative competition, redundant containers, repeated motion, excess glow, and unnecessary visual noise while preserving the strongest focal idea, product clarity, accessibility, and useful interaction. Run AIgent Taste on the changed surface, then check desktop and mobile."],
  delight: ["Delight", "Add one or two purposeful moments of delight that fit this product and visual world. Prefer meaningful feedback, continuity, media behavior, or a memorable interaction over decoration. Do not add generic confetti, bounce, card clutter, or repeated reveal effects. Preserve accessibility and reduced-motion meaning. Run AIgent Taste and verify the result in the browser."],
  polish: ["Polish", "Give this working surface a final professional design pass without redesigning it. Fix the highest-value hierarchy, spacing, typography, alignment, responsive, interaction-state, media, and motion issues at their shared source. Preserve the chosen visual world and product truth. Run AIgent Taste, then Resolve, inspect desktop and mobile, and leave no obvious unfinished detail."],
};

function initImproveActions() {
  const form = document.querySelector("#agent-form");
  const prompt = document.querySelector("#agent-prompt");
  if (!form || !prompt || document.querySelector("#aigent-improve")) return;
  const panel = document.createElement("section");
  panel.id = "aigent-improve";
  panel.setAttribute("aria-label", "Creative direction shortcuts");
  panel.style.cssText = "display:grid;gap:8px;margin:10px 0 12px;padding:10px;border:1px solid rgba(101,244,223,.22);background:rgba(7,16,15,.72)";
  panel.innerHTML = '<div style="display:flex;justify-content:space-between;gap:10px"><strong>Improve</strong><small style="opacity:.64">Creative director shortcuts</small></div><div data-improve-actions style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"></div>';
  const actions = panel.querySelector("[data-improve-actions]");
  for (const [id, [label, instruction]] of Object.entries(IMPROVE_ACTIONS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet-button";
    button.dataset.improve = id;
    button.textContent = label;
    button.addEventListener("click", () => {
      prompt.value = instruction;
      prompt.dispatchEvent(new Event("input", { bubbles: true }));
      prompt.focus();
      form.requestSubmit();
    });
    actions.append(button);
  }
  form.before(panel);
}

initImproveActions();

const AGENT_RUN_PATH = /\/api\/projects\/[^/]+\/run(?:\?|$)/;
const visualScene = { selection: [], bounds: { selected: [], hovered: null }, tree: [] };
const nativeFetch = globalThis.fetch.bind(globalThis);
let selectionPromptForm = null;

function ensureSelectionPrompt() {
  if (selectionPromptForm?.isConnected) return selectionPromptForm;
  const frame = document.querySelector(".browser-frame");
  if (!frame) return null;
  const form = document.createElement("form");
  form.id = "selection-agent-form";
  form.hidden = true;
  form.setAttribute("aria-label", "Ask AIgent about the selected element");
  form.style.cssText = "position:absolute;z-index:45;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;width:min(360px,calc(100% - 16px));padding:7px;border:1px solid rgba(101,244,223,.55);border-radius:8px;background:rgba(5,10,9,.96);box-shadow:0 14px 38px rgba(0,0,0,.42);backdrop-filter:blur(10px)";
  form.innerHTML = '<input id="selection-agent-prompt" aria-label="Ask AIgent about this selection" autocomplete="off" placeholder="Ask AIgent about this…" style="min-width:0;height:34px;padding:0 10px;border:1px solid rgba(255,255,255,.13);border-radius:5px;background:#080c0b;color:#f3f3ef"><button class="primary-button" type="submit" style="min-height:34px;padding:0 11px">Ask</button>';
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("#selection-agent-prompt");
    const instruction = input?.value.trim();
    const agentForm = document.querySelector("#agent-form");
    const agentPrompt = document.querySelector("#agent-prompt");
    const runButton = document.querySelector("#run-agent");
    if (!instruction || !agentForm || !agentPrompt || runButton?.disabled) return;
    const includeSelection = document.querySelector("#include-selection");
    if (includeSelection) includeSelection.checked = true;
    agentPrompt.value = instruction;
    agentPrompt.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector('[data-right-tab="agent"]')?.click();
    agentForm.requestSubmit();
    input.value = "";
  });
  frame.append(form);
  selectionPromptForm = form;
  return form;
}

function renderSelectionPrompt() {
  const form = ensureSelectionPrompt();
  if (!form) return;
  const selected = visualScene.selection[0];
  const box = visualScene.bounds.selected?.[0]?.bounds;
  if (!selected || !box || document.body.dataset.canvasMode !== "select") {
    form.hidden = true;
    return;
  }
  const frame = document.querySelector(".browser-frame");
  const chrome = document.querySelector(".browser-chrome");
  if (!frame || !chrome) return;
  form.hidden = false;
  form.setAttribute("aria-label", `Ask AIgent about ${selected.label || selected.tag || "this element"}`);
  const width = Math.min(360, Math.max(220, frame.clientWidth - 16));
  form.style.width = `${width}px`;
  const height = form.offsetHeight || 50;
  const chromeHeight = chrome.offsetHeight;
  const left = Math.max(8, Math.min(box.x, frame.clientWidth - width - 8));
  const below = chromeHeight + box.y + box.height + 8;
  const above = chromeHeight + box.y - height - 8;
  const top = below + height <= frame.clientHeight - 8 ? below : Math.max(chromeHeight + 8, above);
  form.style.left = `${Math.round(left)}px`;
  form.style.top = `${Math.round(top)}px`;
}

new MutationObserver(renderSelectionPrompt).observe(document.body, { attributes: true, attributeFilter: ["data-canvas-mode"] });
globalThis.addEventListener("resize", renderSelectionPrompt);

function rounded(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : value;
}

function currentViewportContext() {
  const stage = document.querySelector(".preview-stage");
  const frame = document.querySelector("#preview-frame");
  const frameBounds = frame?.getBoundingClientRect();
  return {
    mode: stage?.dataset.viewport || "desktop",
    frame: frameBounds ? { width: rounded(frameBounds.width), height: rounded(frameBounds.height) } : null,
    previewUrl: frame?.src || null,
    documentWidth: innerWidth,
    documentHeight: innerHeight,
  };
}

function relatedLayers(selectedIds) {
  const ids = new Set(selectedIds);
  const parentIds = new Set(visualScene.tree.filter((node) => ids.has(node.id)).map((node) => node.parentId).filter(Boolean));
  return visualScene.tree
    .filter((node) => ids.has(node.id) || parentIds.has(node.id) || parentIds.has(node.parentId))
    .slice(0, 32)
    .map(({ id, parentId, tag, label, role, depth, childCount }) => ({ id, parentId, tag, label, role, depth, childCount }));
}

function attachRenderedScene(body) {
  if (!Array.isArray(body.selection) || !body.selection.length) return body;
  const selectedIds = body.selection.map((node) => node.id).filter(Boolean);
  const bounds = new Map((visualScene.bounds.selected || []).map((item) => [item.id, item.bounds]));
  const summaries = new Map((visualScene.selection || []).map((item) => [item.id, item]));
  const enrichedSelection = body.selection.map((node) => {
    const summary = summaries.get(node.id) || {};
    return {
      ...node,
      role: summary.role || node.role || null,
      bounds: summary.bounds || bounds.get(node.id) || node.bounds || null,
      attributes: summary.attributes || node.attributes || {},
      classes: summary.classes || node.classes || [],
      parentId: summary.parentId || node.parentId || null,
      childCount: summary.childCount ?? node.childCount ?? null,
    };
  });
  const scene = {
    viewport: currentViewportContext(),
    selected: enrichedSelection,
    nearbyLayers: relatedLayers(selectedIds),
    note: "This is structured rendered context from the live DOM. Use AIgent Vision for screenshot-based aesthetic judgment.",
  };
  const sceneText = JSON.stringify(scene, null, 2).slice(0, 7000);
  return {
    ...body,
    selection: enrichedSelection,
    prompt: `Studio rendered scene for the elements the operator clicked:\n${sceneText}\n\nOperator instruction:\n${body.prompt || ""}`,
  };
}

globalThis.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || message.source !== "aigent-studio") return;
  if (message.type === "selection") {
    visualScene.selection = message.selected || [];
    renderSelectionPrompt();
  }
  if (message.type === "bounds") {
    visualScene.bounds = { selected: message.selected || [], hovered: message.hovered || null };
    renderSelectionPrompt();
  }
  if (message.type === "tree") visualScene.tree = message.nodes || [];
});

globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const method = String(init.method || (typeof input !== "string" ? input?.method : "GET") || "GET").toUpperCase();
  if (!AGENT_RUN_PATH.test(url) || method !== "POST" || typeof init.body !== "string") return nativeFetch(input, init);
  try {
    const body = attachRenderedScene(JSON.parse(init.body));
    return nativeFetch(input, { ...init, body: JSON.stringify(body) });
  } catch {
    return nativeFetch(input, init);
  }
};
