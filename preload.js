const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mojiStorage", {
  getDataDir: () => ipcRenderer.invoke("storage:get-data-dir"),
  chooseDataDir: () => ipcRenderer.invoke("storage:choose-data-dir"),
  readWorkspace: () => ipcRenderer.invoke("storage:read-workspace"),
  saveWorkspace: (state) => ipcRenderer.invoke("storage:save-workspace", state),
});
