const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { status: null, projects: [], project: null, eventSource: null, running: false, viewport: "desktop", toastTimer: null };

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });
  const payload = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload?.error || payload || `Request failed: ${response.status}`);
  return payload;
}
function toast(message) {
  const node = $("#toast"); node.textContent = message; node.dataset.visible = "true";
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => { node.dataset.visible = "false"; }, 2600);
}
function log(message, kind = "") {
  const entry = document.createElement("div"); entry.className = `log-entry ${kind}`.trim(); entry.textContent = message;
  const container = $("#agent-log"); container.append(entry); container.scrollTop = container.scrollHeight;
}
function setRunning(value, label = "") {
  state.running = value; $("#run-agent").disabled = value || !state.project; $("#stop-agent").disabled = !value;
  $$("[data-action]").forEach((button) => { button.disabled = value || !state.project; });
  if (label) $("#runtime-status span:last-child").textContent = label;
}
function providerSummary(status) {
  const available = Object.entries(status.providers).filter(([, value]) => value.available && value.command).map(([, value]) => value.label);
  return available.length ? `${available.join(" + ")} ready` : "No local agent found — manual prompt mode";
}
function fillStarters() {
  const select = $("#new-starter"); select.innerHTML = "";
  for (const starter of state.status.starters) {
    const option = document.createElement("option"); option.value = starter.id; option.textContent = starter.label; select.append(option);
  }
}
function fillProviders() {
  for (const option of $("#provider-select").options) {
    const status = state.status.providers[option.value];
    option.disabled = !status?.available;
    option.textContent = status ? `${status.label}${status.available ? "" : " — not installed"}` : option.textContent;
  }
}
function fillProjectSelect() {
  const select = $("#project-select"); select.innerHTML = "";
  if (!state.projects.length) {
    const option = document.createElement("option"); option.value = ""; option.textContent = "No projects yet"; select.append(option); select.disabled = true; return;
  }
  select.disabled = false;
  for (const project of state.projects) {
    const option = document.createElement("option"); option.value = project.id; option.textContent = project.name; select.append(option);
  }
  if (state.project) select.value = state.project.id;
}
function projectForm(project) {
  $("#project-name").value = project?.name || "";
  $("#audience").value = project?.audience || "";
  $("#goal").value = project?.goal || "";
  $("#mechanism").value = project?.mechanism || "";
  $("#references").value = (project?.references || []).join("\n");
  $("#request").value = project?.request || "";
  $("#provider-select").value = project?.provider || (state.status.providers.claude.available ? "claude" : state.status.providers.codex.available ? "codex" : "manual");
}
function previewUrl(project = state.project) { return project ? `/preview/${project.id}${project.entry}` : ""; }
function loadPreview(force = false) {
  const frame = $("#preview-frame");
  if (!state.project) { frame.removeAttribute("src"); $("#empty-preview").hidden = false; $("#preview-name").textContent = "No project selected"; return; }
  $("#empty-preview").hidden = true; $("#preview-name").textContent = state.project.name;
  const url = previewUrl(); frame.src = force ? `${url}${url.includes("?") ? "&" : "?"}studio=${Date.now()}` : url;
  $("#open-preview").href = url; $("#preview-address").textContent = url;
}
function connectEvents() {
  state.eventSource?.close(); state.eventSource = null;
  if (!state.project) return;
  const source = new EventSource(`/api/projects/${state.project.id}/events`); state.eventSource = source;
  source.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "connected") return;
    if (message.type === "start") { setRunning(true, `${message.kind}${message.provider ? ` · ${message.provider}` : ""}`); log(`Started ${message.kind}${message.provider ? ` with ${message.provider}` : ""}.`, "system"); }
    if (message.type === "log") log(message.text, message.channel === "stderr" ? "error" : "");
    if (message.type === "error") log(message.message, "error");
    if (message.type === "done") { setRunning(false, providerSummary(state.status)); log(message.code === 0 ? "Task complete. Preview refreshed." : `Task exited with code ${message.code}.`, message.code === 0 ? "done" : "error"); loadPreview(true); refreshProjects(false); }
  };
  source.onerror = () => { if (state.project) $("#runtime-status span:last-child").textContent = "Reconnecting to project events…"; };
}
async function selectProject(id, refresh = true) {
  if (!id) { state.project = null; fillProjectSelect(); projectForm(null); loadPreview(); return; }
  const { project, task } = await api(`/api/projects/${id}`); state.project = project;
  fillProjectSelect(); projectForm(project); loadPreview(refresh); connectEvents();
  setRunning(Boolean(task?.running), task?.running ? task.kind : providerSummary(state.status));
}
async function refreshProjects(selectNewest = false) {
  const { projects } = await api("/api/projects"); state.projects = projects;
  if (selectNewest && projects[0]) return selectProject(projects[0].id);
  if (state.project) {
    const current = projects.find((project) => project.id === state.project.id);
    if (current) state.project = current;
  }
  fillProjectSelect();
}
function briefPayload() {
  return {
    name: $("#project-name").value,
    audience: $("#audience").value,
    goal: $("#goal").value,
    mechanism: $("#mechanism").value,
    references: $("#references").value,
    request: $("#request").value,
    provider: $("#provider-select").value,
  };
}
async function saveBrief() {
  if (!state.project) return;
  const { project } = await api(`/api/projects/${state.project.id}`, { method: "PATCH", body: briefPayload() });
  state.project = project; await refreshProjects(); fillProjectSelect(); toast("Brief saved");
}
function showProjectDialog() {
  $("#project-form").reset(); $("#new-starter").value = "cinematic"; $("#project-dialog").showModal(); setTimeout(() => $("#new-name").focus(), 0);
}
async function createProject(event) {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter?.value === "cancel") { $("#project-dialog").close(); return; }
  const payload = { name: $("#new-name").value, starter: $("#new-starter").value, description: $("#new-description").value, request: $("#new-request").value, provider: $("#provider-select").value };
  $("#create-project").disabled = true; $("#create-project").textContent = "Creating…";
  try {
    const { project } = await api("/api/projects", { method: "POST", body: payload });
    $("#project-dialog").close(); await refreshProjects(); await selectProject(project.id); toast("Project ready");
  } catch (error) { toast(error.message); }
  finally { $("#create-project").disabled = false; $("#create-project").textContent = "Create project"; }
}
async function runAgent(event) {
  event.preventDefault(); if (!state.project || state.running) return;
  const prompt = $("#agent-prompt").value.trim() || state.project.request;
  try {
    const result = await api(`/api/projects/${state.project.id}/run`, { method: "POST", body: { provider: $("#provider-select").value, model: $("#model-input").value.trim(), prompt } });
    if (result.manual) { await navigator.clipboard.writeText(result.prompt); log("Manual prompt copied to clipboard.", "system"); toast("Prompt copied"); }
    else { setRunning(true, `Agent · ${result.provider}`); $("#agent-prompt").value = ""; }
  } catch (error) { log(error.message, "error"); toast(error.message); }
}
async function runAction(action) {
  if (!state.project || state.running) return;
  try {
    const result = await api(`/api/projects/${state.project.id}/action`, { method: "POST", body: { action } });
    if (result.complete) { log(`${action} complete${result.summary?.layout ? ` — ${result.summary.layout}` : ""}.`, "done"); toast(`${action} complete`); await refreshProjects(); }
    else setRunning(true, action);
  } catch (error) { log(error.message, "error"); toast(error.message); }
}
async function initialize() {
  try {
    state.status = await api("/api/status");
    $("#runtime-status").dataset.state = "ready"; $("#runtime-status span:last-child").textContent = providerSummary(state.status);
    fillStarters(); fillProviders(); await refreshProjects();
    if (state.projects[0]) await selectProject(state.projects[0].id, false); else { fillProjectSelect(); projectForm(null); loadPreview(); setRunning(false, providerSummary(state.status)); }
  } catch (error) {
    $("#runtime-status").dataset.state = "warning"; $("#runtime-status span:last-child").textContent = "Run npm run studio";
    log("The static page loaded, but the local Studio server is not running. Start it with: npm run studio", "error");
    toast(error.message);
  }
}

$("#project-select").addEventListener("change", (event) => selectProject(event.target.value));
$("#new-project").addEventListener("click", showProjectDialog); $("#empty-new-project").addEventListener("click", showProjectDialog);
$("#project-form").addEventListener("submit", createProject); $("#brief-form").addEventListener("submit", (event) => { event.preventDefault(); saveBrief().catch((error) => toast(error.message)); });
$("#agent-form").addEventListener("submit", runAgent); $("#stop-agent").addEventListener("click", async () => { if (state.project) await api(`/api/projects/${state.project.id}/cancel`, { method: "POST", body: {} }); });
$("#delete-project").addEventListener("click", async () => {
  if (!state.project || !confirm(`Delete ${state.project.name}? This removes its local Studio workspace.`)) return;
  try { await api(`/api/projects/${state.project.id}`, { method: "DELETE" }); state.project = null; state.eventSource?.close(); await refreshProjects(true); loadPreview(); toast("Project deleted"); } catch (error) { toast(error.message); }
});
$("#provider-select").addEventListener("change", () => { if (state.project) saveBrief().catch(() => {}); });
$("#refresh-preview").addEventListener("click", () => loadPreview(true));
$$("[data-viewport]").forEach((button) => button.addEventListener("click", () => { state.viewport = button.dataset.viewport; $(".preview-stage").dataset.viewport = state.viewport; $$("[data-viewport]").forEach((item) => item.setAttribute("aria-pressed", String(item === button))); }));
$$("[data-action]").forEach((button) => button.addEventListener("click", () => runAction(button.dataset.action)));
$("#collapse-brief").addEventListener("click", () => { const shell = $(".studio-shell"); const collapsed = shell.dataset.briefCollapsed === "true"; shell.dataset.briefCollapsed = String(!collapsed); $("#collapse-brief").setAttribute("aria-expanded", String(collapsed)); });
$("#collapse-agent").addEventListener("click", () => { const shell = $(".studio-shell"); const collapsed = shell.dataset.agentCollapsed === "true"; shell.dataset.agentCollapsed = String(!collapsed); $("#collapse-agent").setAttribute("aria-expanded", String(collapsed)); });
window.addEventListener("beforeunload", () => state.eventSource?.close());
initialize();
