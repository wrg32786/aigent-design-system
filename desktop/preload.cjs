const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, callback) {
  if (typeof callback !== "function") return () => {};
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld("aigentDesktop", Object.freeze({
  getState: () => ipcRenderer.invoke("desktop:get-state"),
  chooseWorkspace: () => ipcRenderer.invoke("desktop:choose-workspace"),
  saveConfig: (patch) => ipcRenderer.invoke("desktop:save-config", patch),
  refreshEnvironment: () => ipcRenderer.invoke("desktop:refresh-environment"),
  installAgent: (provider) => ipcRenderer.invoke("desktop:install-agent", provider),
  authenticateAgent: (provider) => ipcRenderer.invoke("desktop:authenticate-agent", provider),
  launchStudio: () => ipcRenderer.invoke("desktop:launch-studio"),
  stopStudio: () => ipcRenderer.invoke("desktop:stop-studio"),
  showSetup: (mode) => ipcRenderer.invoke("desktop:show-setup", mode),
  openWorkspace: () => ipcRenderer.invoke("desktop:open-workspace"),
  openLogs: () => ipcRenderer.invoke("desktop:open-logs"),
  openLink: (key) => ipcRenderer.invoke("desktop:open-link", key),
  exportDiagnostics: () => ipcRenderer.invoke("desktop:export-diagnostics"),
  repair: () => ipcRenderer.invoke("desktop:repair"),
  checkUpdates: () => ipcRenderer.invoke("desktop:check-updates"),
  restartToUpdate: () => ipcRenderer.invoke("desktop:restart-update"),
  removeAppData: () => ipcRenderer.invoke("desktop:remove-app-data"),
  onInstall: (callback) => subscribe("desktop:install", callback),
  onUpdate: (callback) => subscribe("desktop:update", callback),
}));
