const shell = document.querySelector(".studio-shell");
const toggle = document.querySelector("#experience-toggle");
const projectSelect = document.querySelector("#project-select");
const guide = document.querySelector("#studio-guide");
const guideCreate = document.querySelector("#guide-create-project");
const STORAGE_KEY = "aigent-studio-experience";

function activeProjectId() {
  return projectSelect?.value || [...(projectSelect?.options || [])].find((option) => option.value)?.value || "";
}

function setExperience(next, persist = true) {
  const experience = next === "advanced" ? "advanced" : "simple";
  shell.dataset.experience = experience;
  toggle.textContent = experience === "simple" ? "Advanced" : "Simple";
  toggle.setAttribute("aria-pressed", String(experience === "advanced"));
  toggle.title = experience === "simple" ? "Show advanced design and developer controls" : "Return to the simplified workflow";
  if (persist) localStorage.setItem(STORAGE_KEY, experience);

  if (experience === "simple") {
    const selectedLeft = shell.dataset.leftTab;
    const selectedRight = shell.dataset.rightTab;
    if (selectedLeft === "library") document.querySelector('[data-left-tab="layers"]')?.click();
    if (["comments", "history"].includes(selectedRight)) document.querySelector('[data-right-tab="inspector"]')?.click();
  }
}

function syncProjectState() {
  const hadProject = shell.dataset.hasProject === "true";
  const hasProject = Boolean(activeProjectId());
  shell.dataset.hasProject = String(hasProject);
  if (guide) guide.hidden = hasProject;

  if (!hadProject && hasProject && shell.dataset.experience === "simple") {
    document.querySelector('[data-right-tab="agent"]')?.click();
  }
}

toggle?.addEventListener("click", () => {
  setExperience(shell.dataset.experience === "simple" ? "advanced" : "simple");
});

guideCreate?.addEventListener("click", () => document.querySelector("#new-project")?.click());
projectSelect?.addEventListener("change", syncProjectState);

if (projectSelect) {
  new MutationObserver(syncProjectState).observe(projectSelect, { childList: true, subtree: true, attributes: true });
}

setExperience(localStorage.getItem(STORAGE_KEY) || "simple", false);
syncProjectState();
