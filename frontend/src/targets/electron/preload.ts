import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("platformAdapter", {
  showDirectoryPicker: () => ipcRenderer.invoke("showDirectoryPicker"),
  handleExit: (callback: () => void) => ipcRenderer.on("exit", callback),
});
