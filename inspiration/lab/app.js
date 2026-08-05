const dimensions = ["structure", "typography", "material", "motion", "interaction", "media"];
const transformations = {
  structure: "Change section order, grouping, and mobile topology for the target product.",
  typography: "Use a different family pairing, scale, measure, and delivery system.",
  material: "Rebuild palette, texture, rules, shadows, and radius from the target brand.",
  motion: "Change direction, timing, easing, subject, handoff, and reduced-motion state.",
  interaction: "Keep the task model; replace labels, states, information architecture, and control placement.",
  media: "Produce original assets with a different camera, lighting, grade, crop, and mobile derivative."
};
const state = { sources: [], assignments: {} };
const sourcesNode = document.querySelector("#sources");
const matrixNode = document.querySelector("#matrix");
const statusNode = document.querySelector("#status");
const ledger = document.querySelector("#ledger");
const ledgerList = document.querySelector("#ledger-list");

function summary(source) {
  return [source.structure?.topology, ...(source.typography?.categories || []), ...(source.material?.tags || []), ...(source.motion?.tags || [])].filter(Boolean).slice(0, 5).join(" · ");
}

function defaultAssignments() {
  const output = {};
  dimensions.forEach((dimension, index) => { output[dimension] = state.sources[Math.floor(index / 2) % state.sources.length].source.id; });
  return output;
}

function renderSources() {
  sourcesNode.replaceChildren(...state.sources.map((source) => {
    const article = document.createElement("article"); article.className = "source";
    const strong = document.createElement("strong"); strong.textContent = source.source.id.replaceAll("-", " ");
    const span = document.createElement("span"); span.textContent = summary(source);
    article.append(strong, span); return article;
  }));
}

function renderMatrix() {
  matrixNode.replaceChildren(...dimensions.map((dimension) => {
    const row = document.createElement("div"); row.className = "row"; row.dataset.dimension = dimension;
    const label = document.createElement("label"); label.htmlFor = `source-${dimension}`; label.textContent = dimension;
    const select = document.createElement("select"); select.id = `source-${dimension}`;
    for (const source of state.sources) { const option = document.createElement("option"); option.value = source.source.id; option.textContent = source.source.id.replaceAll("-", " "); select.append(option); }
    select.value = state.assignments[dimension]; select.addEventListener("change", () => { state.assignments[dimension] = select.value; ledger.hidden = true; validate(); });
    const textarea = document.createElement("textarea"); textarea.id = `transform-${dimension}`; textarea.value = transformations[dimension]; textarea.setAttribute("aria-label", `${dimension} required transformation`);
    row.append(label, select, textarea); return row;
  }));
  validate();
}

function validate() {
  const counts = Object.values(state.assignments).reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
  const over = [...counts.entries()].filter(([, count]) => count > 2);
  statusNode.textContent = over.length ? `Review: ${over.map(([id, count]) => `${id} owns ${count} dimensions`).join(", ")}` : "Ready: influence is distributed across references.";
  return over.length === 0;
}

function synthesize() {
  if (!validate()) { ledger.hidden = true; return; }
  const bySource = new Map(state.sources.map((source) => [source.source.id, []]));
  for (const dimension of dimensions) bySource.get(state.assignments[dimension]).push(dimension);
  ledgerList.replaceChildren(...[...bySource].map(([id, used]) => {
    const li = document.createElement("li"); const b = document.createElement("b"); b.textContent = id.replaceAll("-", " ");
    const span = document.createElement("span"); span.textContent = `${used.join(" + ") || "not assigned"}; excludes copy, assets, marks, source code, exact section order, exact type pairing, and exact keyframes.`;
    li.append(b, span); return li;
  }));
  ledger.hidden = false; statusNode.textContent = "Direction synthesized. Six transformations and source exclusions are recorded.";
}

document.querySelector("#synthesize").addEventListener("click", synthesize);
document.querySelector("#reset").addEventListener("click", () => { state.assignments = defaultAssignments(); renderMatrix(); ledger.hidden = true; });

try {
  const urls = ["../examples/editorial-reference.json", "../examples/immersive-reference.json", "../examples/interface-reference.json"];
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  if (responses.some((response) => !response.ok)) throw new Error("Example Design DNA could not be loaded.");
  state.sources = await Promise.all(responses.map((response) => response.json()));
  state.assignments = defaultAssignments(); renderSources(); renderMatrix();
} catch (error) { statusNode.textContent = error.message; }
