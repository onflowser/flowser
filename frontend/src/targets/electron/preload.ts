import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("platformAdapter", {
  showDirectoryPicker: () => ipcRenderer.invoke("showDirectoryPicker"),
  handleExit: (callback: () => void) => ipcRenderer.on("exit", callback),
  handleUpdateDownloadStart: (callback: () => void) =>
    ipcRenderer.on("update-download-projects", callback),
  handleUpdateDownloadEnd: (callback: () => void) =>
    ipcRenderer.on("update-download-end", callback),
  handleUpdateDownloadProgress: (callback: (percentage: number) => void) =>
    ipcRenderer.on("update-download-progress", (event, value) =>
      callback(value as unknown as number)
    ),
});
