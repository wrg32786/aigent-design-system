export const IMPROVE_ACTIONS = Object.freeze({
  bolder: {
    label: "Bolder",
    prompt: "Make the current design more distinctive and visually confident. Strengthen hierarchy, composition, typography, media, and one focal interaction without adding generic gradients, card clutter, gratuitous glow, or effects that do not earn their cost. Preserve product truth, working behavior, accessibility, and the established visual world. Run AIgent Taste on the changed surface, then check desktop and mobile.",
  },
  quieter: {
    label: "Quieter",
    prompt: "Make the current design calmer and more disciplined. Remove decorative competition, redundant containers, repeated motion, excess glow, and unnecessary visual noise while preserving the strongest focal idea, product clarity, accessibility, and useful interaction. Run AIgent Taste on the changed surface, then check desktop and mobile.",
  },
  delight: {
    label: "Delight",
    prompt: "Add one or two purposeful moments of delight that fit this product and visual world. Prefer meaningful feedback, continuity, media behavior, or a memorable interaction over decoration. Do not add generic confetti, bounce, card clutter, or repeated reveal effects. Preserve accessibility and reduced-motion meaning. Run AIgent Taste and verify the result in the browser.",
  },
  polish: {
    label: "Polish",
    prompt: "Give this working surface a final professional design pass without redesigning it. Fix the highest-value hierarchy, spacing, typography, alignment, responsive, interaction-state, media, and motion issues at their shared source. Preserve the chosen visual world and product truth. Run AIgent Taste, then Resolve, inspect desktop and mobile, and leave no obvious unfinished detail.",
  },
});

export function improvePrompt(action) {
  return IMPROVE_ACTIONS[action]?.prompt || "";
}

function installStyle() {
  if (document.querySelector("#aigent-improve-style")) return;
  const style = document.createElement("style");
  style.id = "aigent-improve-style";
  style.textContent = `
    .aigent-improve{display:grid;gap:8px;margin:10px 0 12px;padding:10px;border:1px solid color-mix(in srgb,var(--ds-color-rule,#6ff) 62%,transparent);background:color-mix(in srgb,var(--ds-color-surface,#07100f) 88%,transparent)}
    .aigent-improve-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.aigent-improve-head strong{font-size:.78rem}.aigent-improve-head small{opacity:.64}
    .aigent-improve-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.aigent-improve-actions button{min-width:0;padding-inline:8px}
    @media(max-width:900px){.aigent-improve-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.append(style);
}

export function initImproveActions() {
  const form = document.querySelector("#agent-form");
  const prompt = document.querySelector("#agent-prompt");
  if (!form || !prompt || document.querySelector("#aigent-improve")) return false;
  installStyle();
  const panel = document.createElement("section");
  panel.id = "aigent-improve";
  panel.className = "aigent-improve";
  panel.setAttribute("aria-label", "Creative direction shortcuts");
  panel.innerHTML = `<div class="aigent-improve-head"><strong>Improve</strong><small>Creative director shortcuts</small></div><div class="aigent-improve-actions"></div>`;
  const actions = panel.querySelector(".aigent-improve-actions");
  for (const [id, item] of Object.entries(IMPROVE_ACTIONS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet-button";
    button.dataset.improve = id;
    button.textContent = item.label;
    button.addEventListener("click", () => {
      prompt.value = item.prompt;
      prompt.dispatchEvent(new Event("input", { bubbles: true }));
      prompt.focus();
      form.requestSubmit();
    });
    actions.append(button);
  }
  form.before(panel);
  return true;
}

if (typeof document !== "undefined") initImproveActions();
