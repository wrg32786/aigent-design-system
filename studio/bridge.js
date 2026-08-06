const CHANNEL = "aigent-studio";
const STYLE_PROPERTIES = new Set([
  "display", "position", "inset", "top", "right", "bottom", "left", "z-index",
  "width", "min-width", "max-width", "height", "min-height", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left", "margin-inline", "margin-block",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "padding-inline", "padding-block",
  "gap", "row-gap", "column-gap", "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
  "flex-direction", "flex-wrap", "justify-content", "align-items", "align-content", "align-self", "justify-self",
  "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "text-transform",
  "color", "background", "background-color", "border", "border-color", "border-width", "border-style",
  "border-radius", "box-shadow", "opacity", "overflow", "overflow-x", "overflow-y", "object-fit", "object-position",
  "transform", "transform-origin", "filter", "backdrop-filter", "cursor", "pointer-events", "visibility",
]);
const ATTRIBUTE_NAMES = new Set(["href", "src", "alt", "title", "target", "rel", "aria-label", "aria-hidden", "role"]);
const state = {
  enabled: false,
  mode: "preview",
  operations: [],
  selectedIds: [],
  hoveredId: null,
  inlineEditor: null,
  treeRevision: 0,
  remoteIds: [],
};

function post(type, payload = {}) {
  window.parent.postMessage({ source: CHANNEL, type, ...payload }, "*");
}
function hash(input) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
}
function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}
function visible(element) {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return false;
  if (element.matches("script,style,link,meta,title,template,noscript")) return false;
  const style = getComputedStyle(element);
  const bounds = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.01 && bounds.width > 0 && bounds.height > 0;
}
function nodePath(element) {
  const parts = [];
  let current = element;
  while (current && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;
    const siblings = [...parent.children].filter((candidate) => candidate.tagName === current.tagName);
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${current.tagName.toLowerCase()}:${index}`);
    current = parent;
  }
  return parts.join("/") || element.tagName.toLowerCase();
}
function ensureId(element) {
  if (!element || element === document.body || element === document.documentElement) return null;
  if (element.dataset.aigentId) return element.dataset.aigentId;
  const explicit = element.id ? `id-${element.id}` : null;
  const identity = explicit || `node-${hash(nodePath(element))}`;
  element.dataset.aigentId = identity;
  return identity;
}
function byId(id) {
  if (!id) return null;
  return document.querySelector(`[data-aigent-id="${cssEscape(id)}"]`);
}
function textLabel(element) {
  const explicit = element.getAttribute("aria-label") || element.getAttribute("title") || element.getAttribute("alt");
  if (explicit) return explicit.trim().slice(0, 80);
  const own = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = own || element.textContent?.replace(/\s+/g, " ").trim() || "";
  return fallback.slice(0, 80) || element.tagName.toLowerCase();
}
function roleFor(element) {
  return element.getAttribute("role") || ({
    A: "link", BUTTON: "button", NAV: "navigation", MAIN: "main", HEADER: "banner", FOOTER: "contentinfo",
    H1: "heading", H2: "heading", H3: "heading", IMG: "image", FORM: "form", INPUT: "input",
  }[element.tagName] || "group");
}
function boundsFor(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.round(rect.x * 100) / 100,
    y: Math.round(rect.y * 100) / 100,
    width: Math.round(rect.width * 100) / 100,
    height: Math.round(rect.height * 100) / 100,
  };
}
function computedFor(element) {
  const style = getComputedStyle(element);
  const properties = [
    "display", "position", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight",
    "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "gap", "rowGap", "columnGap", "gridTemplateColumns", "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignSelf",
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign", "textTransform",
    "color", "backgroundColor", "border", "borderRadius", "boxShadow", "opacity", "overflow", "objectFit", "transform",
  ];
  return Object.fromEntries(properties.map((property) => [property, style[property]]));
}
function attributesFor(element) {
  return Object.fromEntries([...element.attributes]
    .filter((attribute) => ATTRIBUTE_NAMES.has(attribute.name))
    .map((attribute) => [attribute.name, attribute.value]));
}
function nodeSummary(element) {
  if (!element) return null;
  const id = ensureId(element);
  return {
    id,
    tag: element.tagName.toLowerCase(),
    label: textLabel(element),
    role: roleFor(element),
    bounds: boundsFor(element),
    computed: computedFor(element),
    attributes: attributesFor(element),
    classes: [...element.classList],
    text: element.children.length === 0 ? (element.textContent || "").trim().slice(0, 5000) : "",
    parentId: ensureId(element.parentElement),
    childCount: element.children.length,
    sourceHint: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${[...element.classList].slice(0, 3).map((name) => `.${name}`).join("")}`,
  };
}
function buildTree() {
  const nodes = [];
  const queue = [...document.body.children].map((element) => ({ element, depth: 0 }));
  while (queue.length && nodes.length < 600) {
    const { element, depth } = queue.shift();
    if (!visible(element)) continue;
    const summary = nodeSummary(element);
    nodes.push({
      id: summary.id,
      parentId: summary.parentId,
      tag: summary.tag,
      label: summary.label,
      role: summary.role,
      depth,
      childCount: summary.childCount,
    });
    queue.unshift(...[...element.children].map((child) => ({ element: child, depth: depth + 1 })));
  }
  state.treeRevision += 1;
  return { nodes, revision: state.treeRevision };
}
function announceTree() {
  post("tree", buildTree());
}
function announceSelection() {
  const selected = state.selectedIds.map((id) => nodeSummary(byId(id))).filter(Boolean);
  post("selection", { selected, primary: selected[0] || null });
}
function announceBounds() {
  if (!state.selectedIds.length && !state.hoveredId) return;
  post("bounds", {
    selected: state.selectedIds.map((id) => ({ id, bounds: byId(id) ? boundsFor(byId(id)) : null })).filter((item) => item.bounds),
    hovered: state.hoveredId && byId(state.hoveredId) ? { id: state.hoveredId, bounds: boundsFor(byId(state.hoveredId)) } : null,
    remote: state.remoteIds.map((id) => ({ id, bounds: byId(id) ? boundsFor(byId(id)) : null })).filter((item) => item.bounds),
  });
}
function select(element, additive = false) {
  const id = ensureId(element);
  if (!id) return;
  if (additive) {
    state.selectedIds = state.selectedIds.includes(id)
      ? state.selectedIds.filter((candidate) => candidate !== id)
      : [...state.selectedIds, id];
  } else {
    state.selectedIds = [id];
  }
  announceSelection();
  announceBounds();
}
function setMode(mode) {
  state.mode = mode;
  state.enabled = mode === "select" || mode === "comment";
  document.documentElement.dataset.aigentStudioMode = mode;
  document.body.style.cursor = state.enabled ? "default" : "";
  if (!state.enabled) {
    state.hoveredId = null;
    announceBounds();
  }
}
function operationSelector(nodeId) {
  return `[data-aigent-id="${cssEscape(nodeId)}"]`;
}
function renderStyleOperations() {
  let style = document.querySelector("#aigent-studio-runtime-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "aigent-studio-runtime-styles";
    document.head.append(style);
  }
  const groups = { base: [], tablet: [], mobile: [] };
  for (const operation of state.operations) {
    if (operation.kind !== "style" || !STYLE_PROPERTIES.has(operation.property)) continue;
    const breakpoint = groups[operation.breakpoint] ? operation.breakpoint : "base";
    for (const nodeId of operation.nodeIds || [operation.nodeId]) {
      if (!nodeId) continue;
      groups[breakpoint].push(`${operationSelector(nodeId)}{${operation.property}:${operation.value}!important}`);
    }
  }
  style.textContent = [
    groups.base.join("\n"),
    groups.tablet.length ? `@media(max-width:1024px){${groups.tablet.join("\n")}}` : "",
    groups.mobile.length ? `@media(max-width:620px){${groups.mobile.join("\n")}}` : "",
  ].filter(Boolean).join("\n");
}
function sanitizeInsertedHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "").slice(0, 100000);
  template.content.querySelectorAll("script,style,link,meta,iframe,object,embed").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
    });
  });
  return template.innerHTML;
}
function applyOperation(operation) {
  if (!operation || typeof operation !== "object") return;
  if (operation.kind === "style") return;
  const element = byId(operation.nodeId);
  if (operation.kind === "text" && element) element.textContent = operation.value ?? "";
  if (operation.kind === "attribute" && element && ATTRIBUTE_NAMES.has(operation.name)) {
    if (operation.value == null || operation.value === "") element.removeAttribute(operation.name);
    else element.setAttribute(operation.name, operation.value);
  }
  if (operation.kind === "remove" && element) element.remove();
  if (operation.kind === "move" && element) {
    if (operation.direction === "up" && element.previousElementSibling) element.parentElement.insertBefore(element, element.previousElementSibling);
    if (operation.direction === "down" && element.nextElementSibling) element.parentElement.insertBefore(element.nextElementSibling, element);
  }
  if (operation.kind === "insert" && element) {
    const html = sanitizeInsertedHtml(operation.html);
    element.insertAdjacentHTML(operation.position === "before" ? "beforebegin" : operation.position === "inside" ? "beforeend" : "afterend", html);
  }
}
function syncOperations(operations = []) {
  state.operations = Array.isArray(operations) ? operations : [];
  for (const operation of state.operations) applyOperation(operation);
  renderStyleOperations();
  requestAnimationFrame(() => {
    announceTree();
    announceSelection();
    announceBounds();
  });
}
function previewOperation(operation) {
  const existing = state.operations.filter((candidate) => candidate.previewKey !== operation.previewKey);
  state.operations = operation.previewKey ? [...existing, operation] : [...state.operations, operation];
  applyOperation(operation);
  renderStyleOperations();
  requestAnimationFrame(announceBounds);
}
function beginTextEdit() {
  const element = byId(state.selectedIds[0]);
  if (!element || state.inlineEditor) return;
  const original = element.textContent || "";
  state.inlineEditor = element;
  element.contentEditable = "plaintext-only";
  element.focus({ preventScroll: true });
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  const finish = () => {
    if (state.inlineEditor !== element) return;
    element.removeEventListener("blur", finish);
    element.removeEventListener("keydown", keydown);
    element.removeAttribute("contenteditable");
    state.inlineEditor = null;
    const value = element.textContent || "";
    if (value !== original) post("text-change", { nodeId: ensureId(element), value });
    announceSelection();
  };
  const keydown = (event) => {
    if (event.key === "Escape") { element.textContent = original; element.blur(); }
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); element.blur(); }
  };
  element.addEventListener("blur", finish);
  element.addEventListener("keydown", keydown);
}
function componentPayload() {
  const element = byId(state.selectedIds[0]);
  if (!element) return;
  post("component-source", { node: nodeSummary(element), html: element.outerHTML.slice(0, 100000) });
}

addEventListener("pointerover", (event) => {
  if (!state.enabled || state.inlineEditor) return;
  const element = event.target.closest?.("body *");
  if (!element || !visible(element)) return;
  const id = ensureId(element);
  if (id === state.hoveredId) return;
  state.hoveredId = id;
  announceBounds();
}, true);
addEventListener("pointerout", (event) => {
  if (!state.enabled || state.inlineEditor) return;
  if (event.relatedTarget && event.target.contains?.(event.relatedTarget)) return;
  state.hoveredId = null;
  announceBounds();
}, true);
addEventListener("click", (event) => {
  if (!state.enabled || state.inlineEditor) return;
  const element = event.target.closest?.("body *");
  if (!element || element.closest("[data-aigent-ignore]") || !visible(element)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  select(element, event.shiftKey || event.metaKey || event.ctrlKey);
  if (state.mode === "comment") post("comment-request", { node: nodeSummary(element) });
}, true);
addEventListener("dblclick", (event) => {
  if (state.mode !== "select") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  select(event.target.closest?.("body *"));
  beginTextEdit();
}, true);
addEventListener("scroll", () => requestAnimationFrame(announceBounds), true);
addEventListener("resize", () => requestAnimationFrame(announceBounds));

addEventListener("message", (event) => {
  const message = event.data;
  if (!message || message.source !== CHANNEL) return;
  if (message.type === "init") {
    setMode(message.mode || "preview");
    syncOperations(message.operations || []);
    if (Array.isArray(message.selectedIds)) state.selectedIds = message.selectedIds;
    announceTree();
    announceSelection();
    post("ready", { title: document.title, url: location.pathname });
  }
  if (message.type === "set-mode") setMode(message.mode || "preview");
  if (message.type === "sync") syncOperations(message.operations || []);
  if (message.type === "preview-operation") previewOperation(message.operation);
  if (message.type === "select") {
    const element = byId(message.nodeId);
    if (element) { select(element, Boolean(message.additive)); element.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }
  if (message.type === "request-tree") announceTree();
  if (message.type === "request-selection") { announceSelection(); announceBounds(); }
  if (message.type === "begin-text-edit") beginTextEdit();
  if (message.type === "request-component") componentPayload();
  if (message.type === "remote-selection") { state.remoteIds = [...new Set(message.nodeIds || [])].slice(0, 128); announceBounds(); }
});

for (const element of document.querySelectorAll("body *")) ensureId(element);
const bootstrap = window.__AIGENT_STUDIO_BOOTSTRAP__ || {};
setMode(bootstrap.mode || "preview");
syncOperations(bootstrap.operations || []);
post("ready", { title: document.title, url: location.pathname });
