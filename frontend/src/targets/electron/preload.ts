import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("platformAdapter", {
  showDirectoryPicker: () => ipcRenderer.invoke("showDirectoryPicker"),
  handleExit: (callback: () => void) => ipcRenderer.on("exit", callback),
  handleUpdateDownloadStart: (callback: () => void) =>
    ipcRenderer.on("update-download-start", callback),
  handleUpdateDownloadEnd: (callback: () => void) =>
    ipcRenderer.on("update-download-end", callback),
  handleUpdateDownloadProgress: (callback: (percentage: number) => void) =>
    ipcRenderer.on("update-download-progress", (percentage) =>
      callback(percentage as unknown as number)
    ),
});
