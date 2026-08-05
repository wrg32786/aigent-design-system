const fallback = [
  {
    name: "studio-core",
    title: "Studio Core",
    description: "Product context, semantic tokens, motion, the AIgent design skill, and deterministic planning.",
    type: "registry:item",
  },
  {
    name: "inspiration-intelligence",
    title: "Inspiration Intelligence",
    description: "URL forensics, Design DNA, multi-source synthesis, influence ledgers, originality review, and the Inspiration Lab.",
    type: "registry:item",
  },
  {
    name: "immersive-sales-deck",
    title: "Immersive Sales Deck",
    description: "A guided cinematic argument with explicit chapter navigation and keyboard control.",
    type: "registry:block",
  },
  {
    name: "command-center-interface",
    title: "Command Center Interface",
    description: "A complete operator workspace with queue, working detail, mobile rail, and command palette.",
    type: "registry:block",
  },
  {
    name: "threejs-product-stage",
    title: "Three.js Product Stage",
    description: "Progressive live 3D with a complete static fallback and device-aware loading.",
    type: "registry:block",
  },
  {
    name: "design-intelligence",
    title: "Design Intelligence",
    description: "Deterministic layout, typography, motion, interface, and component-source decisions.",
    type: "registry:item",
  },
  {
    name: "patterns-core",
    title: "Cinematic Patterns",
    description: "Framework-neutral guided deck, command palette, focus reveal, scene stage, and object stage.",
    type: "registry:item",
  },
  {
    name: "creative-production",
    title: "Creative Production",
    description: "Asset sourcing, generation, rendering, licensing, optimization, and mobile fallbacks.",
    type: "registry:item",
  },
  {
    name: "quality-suite",
    title: "Quality Suite",
    description: "Design, inspiration, asset, registry, eval, browser, and screenshot verification.",
    type: "registry:item",
  },
  {
    name: "vision-critic",
    title: "AIgent Vision Critic",
    description: "Annotated rendered captures, structured aesthetic critique, visual comparison, and the final completion gate.",
    type: "registry:item",
  },
];

const categories = {
  all: "All systems",
  page: "Pages & decks",
  interface: "Interfaces",
  pattern: "Patterns",
  intelligence: "Design brain",
  inspiration: "Inspiration",
  production: "Production",
  quality: "Quality",
};

const previews = {
  "cinematic-page": "../templates/modular-scroll-starter/",
  "immersive-sales-deck": "../templates/immersive-sales-deck/",
  "command-center-interface": "../templates/command-center-interface/",
  "threejs-product-stage": "../templates/threejs-product-stage/",
  "design-vault": "./",
  "inspiration-intelligence": "../inspiration/lab/",
};

const state = { items: [], category: "all", query: "" };
const itemsNode = document.querySelector("#items");
const countNode = document.querySelector("#count");
const emptyNode = document.querySelector("#empty");
const filtersNode = document.querySelector("#filters");
const searchNode = document.querySelector("#search");

function categoryFor(item) {
  if (/inspiration/.test(item.name)) return "inspiration";
  if (/deck|page|threejs-product|cinematic-page/.test(item.name)) return "page";
  if (/command-center|interface/.test(item.name)) return "interface";
  if (/pattern/.test(item.name)) return "pattern";
  if (/intelligence|skill|studio-core|full-studio/.test(item.name)) return "intelligence";
  if (/production|case-studies/.test(item.name)) return "production";
  if (/quality|vault|resolver|resolve/.test(item.name)) return "quality";
  return "pattern";
}

function installCommand(item) {
  return `pnpm dlx shadcn@latest add wrg32786/aigent-design-system/${item.name}`;
}

function createFilter(id, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.category = id;
  button.setAttribute("aria-pressed", String(id === "all"));
  button.addEventListener("click", () => {
    state.category = id;
    for (const sibling of filtersNode.querySelectorAll("button")) {
      sibling.setAttribute("aria-pressed", String(sibling === button));
    }
    render();
  });
  return button;
}

for (const [id, label] of Object.entries(categories)) {
  filtersNode.append(createFilter(id, label));
}

searchNode.addEventListener("input", () => {
  state.query = searchNode.value.trim().toLowerCase();
  render();
});

async function copyCommand(command, button) {
  try {
    await navigator.clipboard.writeText(command);
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  } catch {
    button.textContent = "Copy unavailable";
  }
}

function renderItem(item) {
  const article = document.createElement("article");
  article.className = "item";
  article.dataset.category = categoryFor(item);

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
  const command = installCommand(item);
  const commandLine = document.createElement("code");
  commandLine.className = "install-line";
  commandLine.textContent = command;
  const buttonRow = document.createElement("div");
  buttonRow.className = "item-buttons";
  const copy = document.createElement("button");
  copy.className = "copy";
  copy.type = "button";
  copy.textContent = "Copy install";
  copy.addEventListener("click", () => copyCommand(command, copy));
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
    return (
      (state.category === "all" || category === state.category)
      && (!state.query || searchable.includes(state.query))
    );
  });

  itemsNode.replaceChildren(...visible.map(renderItem));
  countNode.value = `${visible.length} of ${state.items.length} systems`;
  emptyNode.hidden = visible.length > 0;
}

async function loadRegistry(url, seen = new Set()) {
  const resolved = new URL(url, location.href);
  if (seen.has(resolved.href)) {
    throw new Error(`Registry include cycle: ${resolved.pathname}`);
  }
  seen.add(resolved.href);

  const response = await fetch(resolved);
  if (!response.ok) throw new Error(`Registry returned ${response.status}: ${resolved.pathname}`);
  const source = await response.json();
  const items = [...(source.items || [])];
  for (const include of source.include || []) {
    items.push(...await loadRegistry(new URL(include, resolved).href, new Set(seen)));
  }
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
