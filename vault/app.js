const fallback = [
  { name: "aigent-design-skill", title: "Aigent Design", description: "The agent-native design director and routing skill.", type: "registry:item" },
  { name: "design-intelligence", title: "Design Intelligence", description: "Deterministic layout, typography, motion, interface, and component-source planning.", type: "registry:item" },
  { name: "inspiration-intelligence", title: "Inspiration Intelligence", description: "URL forensics, Design DNA, multi-source synthesis, and originality review.", type: "registry:item" },
  { name: "creative-production", title: "Creative Production", description: "Media, motion, video, 3D, provenance, asset budgets, and runtime guidance.", type: "registry:item" },
  { name: "design-resolver", title: "Aigent Resolve", description: "Browser-measured responsive, accessibility, runtime, overflow, focus, media, and request QA.", type: "registry:item" },
  { name: "vision-critic", title: "Aigent Vision", description: "Structured rendered capture review for a capable multimodal agent or human.", type: "registry:item" },
  { name: "publish-site", title: "Publish Site", description: "Constrained export and deployment support with verification and deployment records.", type: "registry:item" },
];

const categories = {
  all: "All systems",
  intelligence: "Design",
  inspiration: "Inspiration",
  production: "Production",
  quality: "Quality",
};

const previews = {
  "aigent-design-skill": "../",
  "inspiration-intelligence": "../inspiration/lab/",
  "design-resolver": "../templates/modular-scroll-starter/",
  "vision-critic": "../templates/command-center-interface/",
  "creative-production": "../templates/threejs-product-stage/",
};

const installCommand = "npx github:wrg32786/aigent-design-system install";
const state = { items: [], category: "all", query: "" };
const itemsNode = document.querySelector("#items");
const countNode = document.querySelector("#count");
const emptyNode = document.querySelector("#empty");
const filtersNode = document.querySelector("#filters");
const searchNode = document.querySelector("#search");

function categoryFor(item) {
  if (/inspiration/.test(item.name)) return "inspiration";
  if (/production/.test(item.name)) return "production";
  if (/resolver|vision|publish/.test(item.name)) return "quality";
  return "intelligence";
}

function createFilter(id, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-pressed", String(id === "all"));
  button.addEventListener("click", () => {
    state.category = id;
    for (const sibling of filtersNode.querySelectorAll("button")) sibling.setAttribute("aria-pressed", String(sibling === button));
    render();
  });
  return button;
}

for (const [id, label] of Object.entries(categories)) filtersNode.append(createFilter(id, label));
searchNode.addEventListener("input", () => { state.query = searchNode.value.trim().toLowerCase(); render(); });

async function copyInstall(button) {
  try {
    await navigator.clipboard.writeText(installCommand);
    button.textContent = "Copied";
    window.setTimeout(() => { button.textContent = "Copy install"; }, 1200);
  } catch { button.textContent = "Copy unavailable"; }
}

function renderItem(item) {
  const article = document.createElement("article");
  article.className = "item";

  const identity = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "item-title";
  title.textContent = item.title || item.name;
  const type = document.createElement("span");
  type.className = "item-type";
  type.textContent = categories[categoryFor(item)];
  identity.append(title, type);

  const description = document.createElement("p");
  description.textContent = item.description;

  const actions = document.createElement("div");
  actions.className = "item-actions";
  const commandLine = document.createElement("code");
  commandLine.className = "install-line";
  commandLine.textContent = installCommand;
  const buttonRow = document.createElement("div");
  buttonRow.className = "item-buttons";
  const copy = document.createElement("button");
  copy.className = "copy";
  copy.type = "button";
  copy.textContent = "Copy install";
  copy.addEventListener("click", () => copyInstall(copy));
  buttonRow.append(copy);

  if (previews[item.name]) {
    const preview = document.createElement("a");
    preview.className = "preview";
    preview.href = previews[item.name];
    preview.textContent = "Preview";
    buttonRow.append(preview);
  }

  actions.append(commandLine, buttonRow);
  article.append(identity, description, actions);
  return article;
}

function render() {
  const visible = state.items.filter((item) => {
    const category = categoryFor(item);
    const searchable = `${item.name} ${item.title || ""} ${item.description || ""} ${category}`.toLowerCase();
    return (state.category === "all" || category === state.category) && (!state.query || searchable.includes(state.query));
  });
  itemsNode.replaceChildren(...visible.map(renderItem));
  countNode.value = `${visible.length} of ${state.items.length} systems`;
  emptyNode.hidden = visible.length > 0;
}

async function loadRegistry(url, seen = new Set()) {
  const resolved = new URL(url, location.href);
  if (seen.has(resolved.href)) throw new Error(`Registry include cycle: ${resolved.pathname}`);
  seen.add(resolved.href);
  const response = await fetch(resolved);
  if (!response.ok) throw new Error(`Registry returned ${response.status}: ${resolved.pathname}`);
  const source = await response.json();
  const items = [...(source.items || [])];
  for (const include of source.include || []) items.push(...await loadRegistry(new URL(include, resolved).href, new Set(seen)));
  return items;
}

try {
  state.items = await loadRegistry("../registry.json");
} catch (error) {
  console.warn(error);
  state.items = fallback;
  document.querySelector("#source-status").textContent = "Offline fallback catalog";
}

render();
