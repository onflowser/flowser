import { contextBridge } from 'electron';
import { electronInvokers } from './ipc/invokers';

contextBridge.exposeInMainWorld('electron', electronInvokers);

export type ElectronInvokers = typeof electronInvokers;
