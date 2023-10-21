// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'index:get-all';

const electronHandler = {
  platformAdapter: {
    showDirectoryPicker: () => ipcRenderer.invoke('showDirectoryPicker'),
    handleExit: (callback: () => void) => ipcRenderer.on('exit', callback),
    handleUpdateDownloadStart: (callback: () => void) =>
      ipcRenderer.on('update-download-start', callback),
    handleUpdateDownloadEnd: (callback: () => void) =>
      ipcRenderer.on('update-download-end', callback),
    handleUpdateDownloadProgress: (callback: (percentage: number) => void) =>
      ipcRenderer.on('update-download-progress', (event, value) =>
        callback(value as unknown as number)
      ),
  },
  ipcRenderer: {
    invoke(channel: Channels, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
