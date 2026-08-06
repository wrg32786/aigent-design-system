const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const CHANNEL = "aigent-studio";
const COLORS = ["#65f4df", "#f07a52", "#8ea8ff", "#d7ef72", "#ec8fd8", "#f4c064"];
const state = {
  status: null,
  projects: [],
  project: null,
  canvas: null,
  tree: [],
  selected: [],
  hovered: null,
  bounds: { selected: [], hovered: null, remote: [] },
  mode: "select",
  viewport: "desktop",
  eventSource: null,
  collaborationSource: null,
  participants: [],
  running: false,
  toastTimer: null,
  heartbeat: null,
  componentSource: null,
  client: participant(),
};

function participant() {
  const saved = localStorage.getItem("aigent-studio-participant");
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  const id = crypto.randomUUID();
  const name = `Designer ${id.slice(0, 4).toUpperCase()}`;
  const color = COLORS[Math.abs([...id].reduce((sum, character) => sum + character.charCodeAt(0), 0)) % COLORS.length];
  const value = { id, name, color };
  localStorage.setItem("aigent-studio-participant", JSON.stringify(value));
  return value;
}
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
  const node = $("#toast");
  node.textContent = message;
  node.dataset.visible = "true";
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { node.dataset.visible = "false"; }, 2600);
}
function log(message, kind = "") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${kind}`.trim();
  entry.textContent = message;
  const container = $("#agent-log");
  container.append(entry);
  container.scrollTop = container.scrollHeight;
}
function postToPreview(type, payload = {}) {
  $("#preview-frame").contentWindow?.postMessage({ source: CHANNEL, type, ...payload }, "*");
}
function providerSummary(status) {
  const available = Object.values(status.providers).filter((value) => value.available && value.command).map((value) => value.label);
  return available.length ? `${available.join(" + ")} ready` : "Manual prompt mode";
}
function setRunning(value, label = "") {
  state.running = value;
  $("#run-agent").disabled = value || !state.project;
  $("#stop-agent").disabled = !value;
  $$("[data-action]").forEach((button) => { button.disabled = value || !state.project; });
  if (label) $("#runtime-status span:last-child").textContent = label;
}
function setMode(mode) {
  state.mode = mode;
  $$("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  postToPreview("set-mode", { mode });
  document.body.dataset.canvasMode = mode;
}
function setLeftTab(tab) {
  $(".studio-shell").dataset.leftTab = tab;
  $$("[data-left-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.leftTab === tab)));
  $$("[data-left-panel]").forEach((panel) => { panel.hidden = panel.dataset.leftPanel !== tab; });
}
function setRightTab(tab) {
  $(".studio-shell").dataset.rightTab = tab;
  $$("[data-right-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.rightTab === tab)));
  $$("[data-right-panel]").forEach((panel) => { panel.hidden = panel.dataset.rightPanel !== tab; });
  if (tab === "history") refreshDiff().catch(() => {});
}
function fillStarters() {
  const select = $("#new-starter");
  select.innerHTML = "";
  for (const starter of state.status.starters) {
    const option = document.createElement("option");
    option.value = starter.id;
    option.textContent = starter.label;
    select.append(option);
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
  const select = $("#project-select");
  select.innerHTML = "";
  if (!state.projects.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No projects yet";
    select.append(option);
    select.disabled = true;
    return;
  }
  select.disabled = false;
  for (const project of state.projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    select.append(option);
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
  $("#provider-select").value = project?.provider || (state.status?.providers.claude.available ? "claude" : state.status?.providers.codex.available ? "codex" : "manual");
}
function previewUrl(project = state.project) {
  return project ? `/preview/${project.id}${project.entry}` : "";
}
function activeOperations() {
  return state.canvas?.activeOperations || [];
}
function loadPreview(force = false) {
  const frame = $("#preview-frame");
  if (!state.project) {
    frame.removeAttribute("src");
    $("#empty-preview").hidden = false;
    $("#preview-name").textContent = "No project selected";
    renderOverlays();
    return;
  }
  $("#empty-preview").hidden = true;
  $("#preview-name").textContent = state.project.name;
  const url = previewUrl();
  frame.src = force ? `${url}${url.includes("?") ? "&" : "?"}studio=${Date.now()}` : url;
  $("#open-preview").href = url;
  $("#preview-address").textContent = url;
}
function initPreview() {
  postToPreview("init", { mode: state.mode, operations: activeOperations(), selectedIds: state.selected.map((item) => item.id) });
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
  state.project = project;
  await refreshProjects();
  fillProjectSelect();
  toast("Brief saved");
}
function showProjectDialog() {
  $("#project-form").reset();
  $("#new-starter").value = "cinematic";
  $("#project-dialog").showModal();
  setTimeout(() => $("#new-name").focus(), 0);
}
async function createProject(event) {
  event.preventDefault();
  if (event.submitter?.value === "cancel") { $("#project-dialog").close(); return; }
  const payload = {
    name: $("#new-name").value,
    starter: $("#new-starter").value,
    description: $("#new-description").value,
    request: $("#new-request").value,
    provider: $("#provider-select").value,
  };
  $("#create-project").disabled = true;
  $("#create-project").textContent = "Creating…";
  try {
    const { project } = await api("/api/projects", { method: "POST", body: payload });
    $("#project-dialog").close();
    await refreshProjects();
    await selectProject(project.id);
    toast("Project ready");
  } catch (error) { toast(error.message); }
  finally { $("#create-project").disabled = false; $("#create-project").textContent = "Create project"; }
}
async function refreshProjects(selectNewest = false) {
  const { projects } = await api("/api/projects");
  state.projects = projects;
  if (selectNewest && projects[0]) return selectProject(projects[0].id);
  if (state.project) state.project = projects.find((project) => project.id === state.project.id) || state.project;
  fillProjectSelect();
}
async function loadCanvas() {
  if (!state.project) { state.canvas = null; return; }
  state.canvas = await api(`/api/projects/${state.project.id}/canvas`);
  renderCanvasState();
}
async function selectProject(id, refresh = true) {
  if (!id) {
    state.project = null;
    state.canvas = null;
    state.selected = [];
    fillProjectSelect();
    projectForm(null);
    loadPreview();
    return;
  }
  const { project, task } = await api(`/api/projects/${id}`);
  state.project = project;
  state.selected = [];
  state.tree = [];
  fillProjectSelect();
  projectForm(project);
  await loadCanvas();
  loadPreview(refresh);
  connectTaskEvents();
  connectCollaboration();
  setRunning(Boolean(task?.running), task?.running ? task.kind : providerSummary(state.status));
}
function connectTaskEvents() {
  state.eventSource?.close();
  if (!state.project) return;
  const source = new EventSource(`/api/projects/${state.project.id}/events`);
  state.eventSource = source;
  source.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "connected") return;
    if (message.type === "start") { setRunning(true, `${message.kind}${message.provider ? ` · ${message.provider}` : ""}`); log(`Started ${message.kind}${message.provider ? ` with ${message.provider}` : ""}.`, "system"); }
    if (message.type === "log") log(message.text, message.channel === "stderr" ? "error" : "");
    if (message.type === "error") log(message.message, "error");
    if (message.type === "done") {
      setRunning(false, providerSummary(state.status));
      log(message.code === 0 ? "Task complete. Preview refreshed." : `Task exited with code ${message.code}.`, message.code === 0 ? "done" : "error");
      loadPreview(true);
      refreshProjects(false);
      loadCanvas();
    }
  };
  source.onerror = () => { if (state.project) $("#runtime-status span:last-child").textContent = "Reconnecting…"; };
}
function connectCollaboration() {
  state.collaborationSource?.close();
  clearInterval(state.heartbeat);
  if (!state.project) return;
  const source = new EventSource(`/api/projects/${state.project.id}/collaboration`);
  state.collaborationSource = source;
  source.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "presence") { state.participants = message.participants || []; renderPresence(); const remoteIds = state.participants.filter((participant) => participant.clientId !== state.client.id).flatMap((participant) => participant.selectedIds || []); postToPreview("remote-selection", { nodeIds: remoteIds }); renderOverlays(); }
    if (["canvas", "comment", "component", "checkpoint"].includes(message.type) && message.authorId !== state.client.id) {
      loadCanvas().then(() => {
        if (message.type === "canvas") loadPreview(true);
      }).catch(() => {});
    }
  };
  heartbeatPresence();
  state.heartbeat = setInterval(heartbeatPresence, 5000);
}
async function heartbeatPresence() {
  if (!state.project) return;
  try {
    await api(`/api/projects/${state.project.id}/presence`, {
      method: "POST",
      body: {
        clientId: state.client.id,
        name: state.client.name,
        color: state.client.color,
        viewport: state.viewport,
        mode: state.mode,
        selectedIds: state.selected.map((item) => item.id),
      },
    });
  } catch { /* reconnect loop handles it */ }
}
function renderPresence() {
  const container = $("#presence");
  container.innerHTML = "";
  for (const participant of state.participants.slice(0, 6)) {
    const node = document.createElement("span");
    node.className = "presence-avatar";
    node.style.background = participant.color;
    node.title = `${participant.name}${participant.clientId === state.client.id ? " (you)" : ""}`;
    node.textContent = participant.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    container.append(node);
  }
}
function renderCanvasState() {
  const canvas = state.canvas;
  const hasSelection = state.selected.length > 0;
  $("#undo-canvas").disabled = !canvas?.canUndo;
  $("#redo-canvas").disabled = !canvas?.canRedo;
  $("#edit-text").disabled = !hasSelection;
  $("#move-up").disabled = !hasSelection;
  $("#move-down").disabled = !hasSelection;
  $("#duplicate-node").disabled = !hasSelection;
  $("#delete-node").disabled = !hasSelection;
  $("#save-component").disabled = !hasSelection;
  $("#add-comment").disabled = !hasSelection;
  $("#canvas-status").textContent = canvas ? `${canvas.activeOperations.length} canvas edits · revision ${canvas.revision}` : "Patch journal clean";
  renderComponents();
  renderTokens();
  renderComments();
  renderCheckpoints();
}
function renderTree() {
  const query = $("#layer-search").value.trim().toLowerCase();
  const selectedIds = new Set(state.selected.map((item) => item.id));
  const container = $("#layers-tree");
  container.innerHTML = "";
  const nodes = query ? state.tree.filter((node) => `${node.tag} ${node.label} ${node.role}`.toLowerCase().includes(query)) : state.tree;
  for (const node of nodes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-row";
    button.style.setProperty("--depth", String(query ? 0 : Math.min(node.depth, 10)));
    button.setAttribute("role", "treeitem");
    button.setAttribute("aria-selected", String(selectedIds.has(node.id)));
    button.dataset.nodeId = node.id;
    button.innerHTML = `<span class="layer-tag">${escapeHtml(node.tag)}</span><span class="layer-label">${escapeHtml(node.label)}</span><span class="layer-children">${node.childCount || ""}</span>`;
    button.addEventListener("click", (event) => postToPreview("select", { nodeId: node.id, additive: event.shiftKey || event.metaKey || event.ctrlKey }));
    container.append(button);
  }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
function renderSelection() {
  const primary = state.selected[0];
  const hasSelection = Boolean(primary);
  $("#selection-summary").hidden = hasSelection;
  $("#inspector-fields").hidden = !hasSelection;
  for (const id of ["#edit-text", "#move-up", "#move-down", "#duplicate-node", "#delete-node", "#save-component", "#add-comment"]) $(id).disabled = !hasSelection;
  if (!primary) {
    $("#selection-path").textContent = "Nothing selected";
    renderTree();
    renderOverlays();
    return;
  }
  $("#selection-role").textContent = `${primary.role} · ${primary.tag}`;
  $("#selection-label").textContent = primary.label;
  $("#selection-source").textContent = primary.sourceHint;
  $("#selection-path").textContent = `${primary.tag} · ${primary.label}${state.selected.length > 1 ? ` · ${state.selected.length} selected` : ""}`;
  $("#property-text").value = primary.text || "";
  const linkName = ["img", "video", "source", "iframe"].includes(primary.tag) ? "src" : "href";
  $("#property-link").dataset.attributeField = linkName;
  $("#property-link").value = primary.attributes?.[linkName] || "";
  const labelName = primary.tag === "img" ? "alt" : "aria-label";
  $("#property-label").dataset.attributeField = labelName;
  $("#property-label").value = primary.attributes?.[labelName] || "";
  for (const field of $$('[data-style-field]')) {
    const property = field.dataset.styleField;
    const operation = [...activeOperations()].reverse().find((item) => item.kind === "style" && item.breakpoint === $("#breakpoint-select").value && (item.nodeIds || [item.nodeId]).includes(primary.id) && item.property === property);
    const computedKey = property.replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    field.value = operation?.value ?? primary.computed?.[computedKey] ?? "";
  }
  renderTree();
  renderOverlays();
}
function renderOverlays() {
  const container = $("#canvas-overlays");
  container.innerHTML = "";
  const localColor = state.client.color;
  if (state.bounds.hovered && !state.bounds.selected.some((item) => item.id === state.bounds.hovered.id)) {
    container.append(outline(state.bounds.hovered, "hover", localColor, ""));
  }
  state.bounds.selected.forEach((item, index) => {
    const selected = state.selected.find((node) => node.id === item.id);
    container.append(outline(item, "selected", localColor, selected?.label || selected?.tag || item.id, index === 0));
  });
  for (const participant of state.participants) {
    if (participant.clientId === state.client.id) continue;
    for (const nodeId of participant.selectedIds || []) {
      const remote = (state.bounds.remote || []).find((item) => item.id === nodeId);
      if (remote) container.append(outline(remote, "remote", participant.color, participant.name));
    }
  }
}
function outline(item, kind, color, label, resize = false) {
  const node = document.createElement("div");
  node.className = "canvas-outline";
  node.dataset.kind = kind;
  node.style.setProperty("--outline", color);
  node.style.left = `${item.bounds.x}px`;
  node.style.top = `${item.bounds.y}px`;
  node.style.width = `${item.bounds.width}px`;
  node.style.height = `${item.bounds.height}px`;
  if (label) {
    const title = document.createElement("span");
    title.className = "canvas-outline-label";
    title.textContent = label;
    node.append(title);
  }
  if (resize && state.mode === "select") {
    const handle = document.createElement("span");
    handle.className = "canvas-resize-handle";
    handle.addEventListener("pointerdown", (event) => startResize(event, item));
    node.append(handle);
  }
  return node;
}
function startResize(event, item) {
  event.preventDefault();
  event.stopPropagation();
  const start = { x: event.clientX, y: event.clientY, width: item.bounds.width, height: item.bounds.height };
  const nodeIds = state.selected.map((node) => node.id);
  const move = (pointer) => {
    const width = Math.max(24, Math.round(start.width + pointer.clientX - start.x));
    const height = Math.max(24, Math.round(start.height + pointer.clientY - start.y));
    postToPreview("preview-operation", { operation: { kind: "style", nodeIds, property: "width", value: `${width}px`, breakpoint: $("#breakpoint-select").value, previewKey: "resize-width" } });
    postToPreview("preview-operation", { operation: { kind: "style", nodeIds, property: "min-height", value: `${height}px`, breakpoint: $("#breakpoint-select").value, previewKey: "resize-height" } });
  };
  const up = async (pointer) => {
    removeEventListener("pointermove", move);
    removeEventListener("pointerup", up);
    const width = Math.max(24, Math.round(start.width + pointer.clientX - start.x));
    const height = Math.max(24, Math.round(start.height + pointer.clientY - start.y));
    await persistOperation({ kind: "style", nodeIds, property: "width", value: `${width}px`, breakpoint: $("#breakpoint-select").value });
    await persistOperation({ kind: "style", nodeIds, property: "min-height", value: `${height}px`, breakpoint: $("#breakpoint-select").value });
  };
  addEventListener("pointermove", move);
  addEventListener("pointerup", up, { once: true });
}
async function persistOperation(operation) {
  if (!state.project) return;
  const result = await api(`/api/projects/${state.project.id}/canvas/operations`, {
    method: "POST",
    body: { operation, author: state.client },
  });
  state.canvas = result.canvas;
  postToPreview("sync", { operations: activeOperations() });
  renderCanvasState();
  heartbeatPresence();
}
async function historyAction(action) {
  if (!state.project) return;
  const result = await api(`/api/projects/${state.project.id}/canvas/${action}`, { method: "POST", body: { author: state.client } });
  state.canvas = result.canvas;
  state.selected = [];
  loadPreview(true);
  renderCanvasState();
  renderSelection();
}
function renderComponents() {
  const components = state.canvas?.components || [];
  $("#component-count").textContent = String(components.length);
  const container = $("#component-list");
  container.innerHTML = "";
  if (!components.length) container.innerHTML = '<small>Save a selected section to reuse it inside this project.</small>';
  for (const component of components) {
    const card = document.createElement("article");
    card.className = "component-card";
    card.innerHTML = `<strong>${escapeHtml(component.name)}</strong><small>${escapeHtml(component.sourceLabel || "Reusable section")}</small><footer><button class="quiet-button" type="button" data-insert>Insert after selection</button><button class="quiet-button" type="button" data-remove>Remove</button></footer>`;
    $("[data-insert]", card).disabled = !state.selected[0];
    $("[data-insert]", card).addEventListener("click", async () => {
      if (!state.selected[0]) return;
      const result = await api(`/api/projects/${state.project.id}/canvas/components/${component.id}/insert`, { method: "POST", body: { targetId: state.selected[0].id, position: "after", author: state.client } });
      state.canvas = result.canvas;
      loadPreview(true);
      renderCanvasState();
    });
    $("[data-remove]", card).addEventListener("click", async () => {
      const result = await api(`/api/projects/${state.project.id}/canvas/components/${component.id}`, { method: "DELETE", body: { author: state.client } });
      state.canvas = result.canvas;
      renderCanvasState();
    });
    container.append(card);
  }
}
function renderTokens() {
  const query = $("#token-search").value.trim().toLowerCase();
  const tokens = (state.canvas?.tokens || []).filter((token) => !query || `${token.name} ${token.value}`.toLowerCase().includes(query));
  $("#token-count").textContent = String(state.canvas?.tokens?.length || 0);
  const datalist = $("#token-values");
  datalist.innerHTML = "";
  for (const token of state.canvas?.tokens || []) {
    const option = document.createElement("option");
    option.value = `var(${token.name})`;
    option.label = token.value;
    datalist.append(option);
  }
  const container = $("#token-list");
  container.innerHTML = "";
  for (const token of tokens.slice(0, 160)) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "token-row";
    row.title = `${token.name}: ${token.value}`;
    row.innerHTML = `<span class="token-swatch" style="--swatch:${escapeHtml(token.preview || token.value)}"></span><span>${escapeHtml(token.name)}</span>`;
    row.addEventListener("click", async () => { await navigator.clipboard.writeText(`var(${token.name})`); toast(`${token.name} copied`); });
    container.append(row);
  }
}
function renderComments() {
  const comments = state.canvas?.annotations || [];
  const container = $("#comment-list");
  container.innerHTML = "";
  if (!comments.length) container.innerHTML = '<small>No comments yet. Select an element and add one.</small>';
  for (const comment of comments) {
    const card = document.createElement("article");
    card.className = "comment-card";
    card.dataset.status = comment.status;
    card.innerHTML = `<strong>${escapeHtml(comment.authorName)} · ${escapeHtml(comment.nodeLabel || comment.nodeId)}</strong><small>${new Date(comment.createdAt).toLocaleString()} · ${escapeHtml(comment.viewport || "base")}</small><p>${escapeHtml(comment.body)}</p><footer><button class="quiet-button" type="button" data-jump>Show</button><button class="quiet-button" type="button" data-resolve>${comment.status === "resolved" ? "Reopen" : "Resolve"}</button></footer>`;
    $("[data-jump]", card).addEventListener("click", () => { setMode("select"); postToPreview("select", { nodeId: comment.nodeId }); });
    $("[data-resolve]", card).addEventListener("click", async () => {
      const result = await api(`/api/projects/${state.project.id}/canvas/comments/${comment.id}`, { method: "PATCH", body: { status: comment.status === "resolved" ? "open" : "resolved", author: state.client } });
      state.canvas = result.canvas;
      renderCanvasState();
    });
    container.append(card);
  }
}
function renderCheckpoints() {
  const checkpoints = state.canvas?.checkpoints || [];
  const container = $("#checkpoint-list");
  container.innerHTML = "";
  if (!checkpoints.length) container.innerHTML = '<small>No checkpoints yet.</small>';
  for (const checkpoint of checkpoints) {
    const card = document.createElement("article");
    card.className = "checkpoint-card";
    card.innerHTML = `<strong>${escapeHtml(checkpoint.label)}</strong><small>${new Date(checkpoint.createdAt).toLocaleString()} · ${escapeHtml(checkpoint.id.slice(0, 8))}</small><footer><button class="quiet-button" type="button">Restore</button></footer>`;
    $("button", card).addEventListener("click", async () => {
      if (!confirm(`Restore checkpoint “${checkpoint.label}”? Current uncommitted source changes will be replaced.`)) return;
      const result = await api(`/api/projects/${state.project.id}/canvas/checkpoints/${checkpoint.id}/restore`, { method: "POST", body: { author: state.client } });
      state.canvas = result.canvas;
      loadPreview(true);
      renderCanvasState();
      toast("Checkpoint restored");
    });
    container.append(card);
  }
}
async function refreshDiff() {
  if (!state.project) return;
  const result = await api(`/api/projects/${state.project.id}/diff`, { headers: {} });
  $("#source-diff").textContent = result.diff || "No source changes.";
}
async function runAgent(event) {
  event.preventDefault();
  if (!state.project || state.running) return;
  const prompt = $("#agent-prompt").value.trim() || state.project.request;
  const selection = $("#include-selection").checked ? state.selected.map((node) => ({ id: node.id, tag: node.tag, label: node.label, sourceHint: node.sourceHint, computed: node.computed })) : [];
  const commentIds = $("#include-comments").checked ? (state.canvas?.annotations || []).filter((comment) => comment.status === "open").map((comment) => comment.id) : [];
  try {
    const result = await api(`/api/projects/${state.project.id}/run`, { method: "POST", body: { provider: $("#provider-select").value, model: $("#model-input").value.trim(), prompt, selection, commentIds } });
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
    $("#runtime-status").dataset.state = "ready";
    $("#runtime-status span:last-child").textContent = providerSummary(state.status);
    fillStarters();
    fillProviders();
    await refreshProjects();
    if (state.projects[0]) await selectProject(state.projects[0].id, false);
    else { fillProjectSelect(); projectForm(null); loadPreview(); setRunning(false, providerSummary(state.status)); renderCanvasState(); }
  } catch (error) {
    $("#runtime-status").dataset.state = "warning";
    $("#runtime-status span:last-child").textContent = "Run npm run studio";
    log("The static page loaded, but the local Studio server is not running. Start it with: npm run studio", "error");
    toast(error.message);
  }
}

addEventListener("message", async (event) => {
  const message = event.data;
  if (!message || message.source !== CHANNEL) return;
  if (message.type === "ready") initPreview();
  if (message.type === "tree") { state.tree = message.nodes || []; renderTree(); }
  if (message.type === "selection") { state.selected = message.selected || []; renderSelection(); heartbeatPresence(); }
  if (message.type === "bounds") { state.bounds = { selected: message.selected || [], hovered: message.hovered || null, remote: message.remote || [] }; renderOverlays(); }
  if (message.type === "text-change") await persistOperation({ kind: "text", nodeId: message.nodeId, value: message.value });
  if (message.type === "comment-request") { setRightTab("comments"); $("#comment-body").focus(); }
  if (message.type === "component-source") { state.componentSource = message; $("#component-dialog").showModal(); setTimeout(() => $("#component-name").focus(), 0); }
});

$("#preview-frame").addEventListener("load", () => setTimeout(initPreview, 30));
$("#project-select").addEventListener("change", (event) => selectProject(event.target.value));
$("#new-project").addEventListener("click", showProjectDialog);
$("#empty-new-project").addEventListener("click", showProjectDialog);
$("#project-form").addEventListener("submit", createProject);
$("#brief-form").addEventListener("submit", (event) => { event.preventDefault(); saveBrief().catch((error) => toast(error.message)); });
$("#provider-select").addEventListener("change", () => { if (state.project) saveBrief().catch(() => {}); });
$("#agent-form").addEventListener("submit", runAgent);
$("#stop-agent").addEventListener("click", async () => { if (state.project) await api(`/api/projects/${state.project.id}/cancel`, { method: "POST", body: {} }); });
$("#delete-project").addEventListener("click", async () => {
  if (!state.project || !confirm(`Delete ${state.project.name}? This removes its local Studio workspace.`)) return;
  try {
    await api(`/api/projects/${state.project.id}`, { method: "DELETE" });
    state.project = null;
    state.eventSource?.close();
    state.collaborationSource?.close();
    await refreshProjects(true);
    loadPreview();
    toast("Project deleted");
  } catch (error) { toast(error.message); }
});
$("#refresh-preview").addEventListener("click", () => loadPreview(true));
$("#refresh-layers").addEventListener("click", () => postToPreview("request-tree"));
$("#layer-search").addEventListener("input", renderTree);
$("#token-search").addEventListener("input", renderTokens);
$$("[data-mode]").forEach((button) => button.addEventListener("click", () => { setMode(button.dataset.mode); heartbeatPresence(); }));
$$("[data-left-tab]").forEach((button) => button.addEventListener("click", () => setLeftTab(button.dataset.leftTab)));
$$("[data-right-tab]").forEach((button) => button.addEventListener("click", () => setRightTab(button.dataset.rightTab)));
$$("[data-viewport]").forEach((button) => button.addEventListener("click", () => {
  state.viewport = button.dataset.viewport;
  $(".preview-stage").dataset.viewport = state.viewport;
  $$("[data-viewport]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  loadPreview(true);
  heartbeatPresence();
}));
$$("[data-action]").forEach((button) => button.addEventListener("click", () => runAction(button.dataset.action)));
$("#undo-canvas").addEventListener("click", () => historyAction("undo").catch((error) => toast(error.message)));
$("#redo-canvas").addEventListener("click", () => historyAction("redo").catch((error) => toast(error.message)));
$("#edit-text").addEventListener("click", () => postToPreview("begin-text-edit"));
$("#move-up").addEventListener("click", () => state.selected[0] && persistOperation({ kind: "move", nodeId: state.selected[0].id, direction: "up" }).then(() => loadPreview(true)));
$("#move-down").addEventListener("click", () => state.selected[0] && persistOperation({ kind: "move", nodeId: state.selected[0].id, direction: "down" }).then(() => loadPreview(true)));
$("#duplicate-node").addEventListener("click", () => state.selected[0] && postToPreview("request-component"));
$("#delete-node").addEventListener("click", () => state.selected[0] && persistOperation({ kind: "remove", nodeId: state.selected[0].id }).then(() => { state.selected = []; loadPreview(true); renderSelection(); }));
$("#save-component").addEventListener("click", () => state.selected[0] && postToPreview("request-component"));
$("#component-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") { $("#component-dialog").close(); return; }
  if (!state.componentSource || !state.project) return;
  const result = await api(`/api/projects/${state.project.id}/canvas/components`, { method: "POST", body: { name: $("#component-name").value, html: state.componentSource.html, sourceNodeId: state.componentSource.node.id, sourceLabel: state.componentSource.node.label, author: state.client } });
  state.canvas = result.canvas;
  state.componentSource = null;
  $("#component-dialog").close();
  $("#component-form").reset();
  renderCanvasState();
  toast("Component saved");
});
$("#property-text").addEventListener("change", (event) => state.selected[0] && persistOperation({ kind: "text", nodeId: state.selected[0].id, value: event.target.value }));
for (const field of $$('[data-attribute-field]')) field.addEventListener("change", (event) => state.selected[0] && persistOperation({ kind: "attribute", nodeId: state.selected[0].id, name: event.target.dataset.attributeField, value: event.target.value }));
for (const field of $$('[data-style-field]')) {
  const preview = () => {
    if (!state.selected.length) return;
    postToPreview("preview-operation", { operation: { kind: "style", nodeIds: state.selected.map((node) => node.id), property: field.dataset.styleField, value: field.value, breakpoint: $("#breakpoint-select").value, previewKey: `inspector-${field.dataset.styleField}` } });
  };
  field.addEventListener("input", preview);
  field.addEventListener("change", () => state.selected.length && persistOperation({ kind: "style", nodeIds: state.selected.map((node) => node.id), property: field.dataset.styleField, value: field.value, breakpoint: $("#breakpoint-select").value }));
}
$("#breakpoint-select").addEventListener("change", renderSelection);
$("#comment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const primary = state.selected[0];
  const body = $("#comment-body").value.trim();
  if (!primary || !body) return;
  const result = await api(`/api/projects/${state.project.id}/canvas/comments`, { method: "POST", body: { nodeId: primary.id, nodeLabel: primary.label, body, viewport: state.viewport, author: state.client } });
  state.canvas = result.canvas;
  $("#comment-body").value = "";
  renderCanvasState();
  toast("Comment added");
});
$("#checkpoint-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.project) return;
  const label = $("#checkpoint-label").value.trim() || `Checkpoint ${new Date().toLocaleTimeString()}`;
  const result = await api(`/api/projects/${state.project.id}/canvas/checkpoints`, { method: "POST", body: { label, author: state.client } });
  state.canvas = result.canvas;
  $("#checkpoint-label").value = "";
  renderCanvasState();
  toast("Checkpoint saved");
});
$("#checkpoint-project").addEventListener("click", () => { setRightTab("history"); $("#checkpoint-label").focus(); });
$("#refresh-diff").addEventListener("click", () => refreshDiff().catch((error) => toast(error.message)));
$("#clear-patches").addEventListener("click", async () => {
  if (!state.project || !confirm("Clear the Canvas patch journal? Only do this after changes are distilled into source or no longer needed.")) return;
  const result = await api(`/api/projects/${state.project.id}/canvas/clear`, { method: "POST", body: { author: state.client } });
  state.canvas = result.canvas;
  state.selected = [];
  loadPreview(true);
  renderCanvasState();
  renderSelection();
  toast("Canvas patches cleared");
});
$("#distill-patches").addEventListener("click", async () => {
  if (!state.project || state.running) return;
  try {
    const result = await api(`/api/projects/${state.project.id}/distill`, { method: "POST", body: { provider: $("#provider-select").value, model: $("#model-input").value.trim() } });
    if (result.manual) { await navigator.clipboard.writeText(result.prompt); toast("Distillation prompt copied"); }
    else { setRightTab("agent"); setRunning(true, "Distilling canvas edits"); }
  } catch (error) { toast(error.message); }
});
addEventListener("keydown", (event) => {
  const modifier = event.metaKey || event.ctrlKey;
  if (!modifier || event.altKey) return;
  if (event.key.toLowerCase() === "z") {
    event.preventDefault();
    historyAction(event.shiftKey ? "redo" : "undo").catch(() => {});
  }
});
addEventListener("beforeunload", () => { state.eventSource?.close(); state.collaborationSource?.close(); clearInterval(state.heartbeat); });
initialize();
