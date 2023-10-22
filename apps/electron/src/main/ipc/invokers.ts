import { ipcRenderer } from 'electron';
import { FlowserWorkspace } from '@onflowser/api';
import {
  ExecuteScriptRequest,
  IFlowService,
  IInteractionService,
  IWorkspaceService,
  SendTransactionRequest,
} from '@onflowser/ui/src/contexts/service-registry.context';
import { FlowserIpcEvent } from './events';
import { FlowserIndexes } from '../../services/flowser-app.service';

const flow: IFlowService = {
  getIndexOfAddress: (address: string) =>
    ipcRenderer.invoke(FlowserIpcEvent.FLOW_GET_INDEX_OF_ADDRESS, address),
  getFlowCliInfo: () => ipcRenderer.invoke(FlowserIpcEvent.FLOW_GET_CLI_INFO),
  sendTransaction: (
    request: SendTransactionRequest,
  ): Promise<{ transactionId: string }> =>
    ipcRenderer.invoke(FlowserIpcEvent.FLOW_SEND_TRANSACTION, request),
  executeScript: (request: ExecuteScriptRequest): Promise<any> =>
    ipcRenderer.invoke(FlowserIpcEvent.FLOW_EXECUTE_SCRIPT, request),
  createAccount: () => ipcRenderer.invoke(FlowserIpcEvent.FLOW_CREATE_ACCOUNT),
};

const interactions: IInteractionService = {
  parse: (sourceCode: string) =>
    ipcRenderer.invoke(FlowserIpcEvent.INTERACTIONS_PARSE, sourceCode),
  getTemplates: () =>
    ipcRenderer.invoke(FlowserIpcEvent.INTERACTIONS_LIST_TEMPLATES),
};

const workspaces: IWorkspaceService = {
  open: (id: string) => ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_OPEN, id),
  close: (id: string) =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_CLOSE, id),
  list: () => ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_LIST),
  create: (createdWorkspace: FlowserWorkspace) =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_CREATE, createdWorkspace),
  update: (updatedWorkspace: FlowserWorkspace) =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_UPDATE, updatedWorkspace),
  findById: (id: string) =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_FIND_BY_ID, id),
  remove: (id: string) =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_REMOVE, id),
  getDefaultSettings: () =>
    ipcRenderer.invoke(FlowserIpcEvent.WORKSPACES_DEFAULT_SETTINGS),
};

export const electronInvokers = {
  platformAdapter: {
    showDirectoryPicker: () => ipcRenderer.invoke('showDirectoryPicker'),
    handleExit: (callback: () => void) => ipcRenderer.on('exit', callback),
    handleUpdateDownloadStart: (callback: () => void) =>
      ipcRenderer.on('update-download-start', callback),
    handleUpdateDownloadEnd: (callback: () => void) =>
      ipcRenderer.on('update-download-end', callback),
    handleUpdateDownloadProgress: (callback: (percentage: number) => void) =>
      ipcRenderer.on('update-download-progress', (event, value) =>
        callback(value as unknown as number),
      ),
  },
  interactions,
  workspaces,
  indexes: {
    getAll: (indexName: keyof FlowserIndexes) =>
      ipcRenderer.invoke(FlowserIpcEvent.INDEX_GET_ALL, indexName),
  },
  flow,
};
