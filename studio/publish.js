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
