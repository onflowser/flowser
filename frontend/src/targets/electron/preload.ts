import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("platformAdapter", {
  showDirectoryPicker: () => ipcRenderer.invoke("showDirectoryPicker"),
});
