import { dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import { FlowserWorkspace } from '@onflowser/api';
import {
  ExecuteScriptRequest,
  SendTransactionRequest,
} from '@onflowser/ui/src/contexts/service-registry.context';
import { FlowserIpcEvent } from './events';
import { FlowserAppService } from '../../services/flowser-app.service';
import { BlockchainIndexes } from '../../services/blockchain-index.service';

type EventListener = (
  event: IpcMainInvokeEvent,
  ...args: any[]
) => Promise<any> | any;

export function registerHandlers() {
  const {
    workspaceService,
    blockchainIndexService,
    flowInteractionsService,
    flowCliService,
    goBindingsService,
    flowGatewayService,
    walletService,
    flowSnapshotsService,
    processManagerService,
  } = FlowserAppService.create();

  async function showDirectoryPicker() {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });
    if (result.canceled) {
      return undefined;
    }
    return result.filePaths[0];
  }

  const handlers: Record<FlowserIpcEvent, EventListener> = {
    [FlowserIpcEvent.APP_DIRECTORY_PICKER_SHOW]: (e: IpcMainInvokeEvent) =>
      showDirectoryPicker(),

    [FlowserIpcEvent.WORKSPACES_CLOSE]: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.close(id),
    [FlowserIpcEvent.WORKSPACES_OPEN]: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.open(id),
    [FlowserIpcEvent.WORKSPACES_CREATE]: (
      e: IpcMainInvokeEvent,
      createdWorkspace: FlowserWorkspace,
    ) => workspaceService.create(createdWorkspace),
    [FlowserIpcEvent.WORKSPACES_UPDATE]: (
      e: IpcMainInvokeEvent,
      updatedWorkspace: FlowserWorkspace,
    ) => workspaceService.update(updatedWorkspace),
    [FlowserIpcEvent.WORKSPACES_LIST]: () => workspaceService.findAll(),
    [FlowserIpcEvent.WORKSPACES_FIND_BY_ID]: (
      e: IpcMainInvokeEvent,
      id: string,
    ) => workspaceService.findById(id),
    [FlowserIpcEvent.WORKSPACES_REMOVE]: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.remove(id),
    [FlowserIpcEvent.WORKSPACES_DEFAULT_SETTINGS]: (e: IpcMainInvokeEvent) =>
      workspaceService.getDefaultSettings(),

    [FlowserIpcEvent.INDEX_GET_ALL]: (
      event: IpcMainInvokeEvent,
      indexName: keyof BlockchainIndexes,
    ) => blockchainIndexService.indexes[indexName].findAll(),

    [FlowserIpcEvent.INTERACTIONS_PARSE]: (
      event: IpcMainInvokeEvent,
      sourceCode: string,
    ) => flowInteractionsService.parse(sourceCode),
    [FlowserIpcEvent.INTERACTIONS_LIST_TEMPLATES]: async (
      event: IpcMainInvokeEvent,
    ) => {
      // There will be only 1 open workspace for now.
      // TODO(restructure): Handle this differently
      const openWorkspaces = await workspaceService.getOpenWorkspaces();
      return flowInteractionsService.getTemplates({
        workspacePath: openWorkspaces[0].filesystemPath,
      });
    },

    [FlowserIpcEvent.FLOW_ACCOUNT_GET_INDEX]: (
      event: IpcMainInvokeEvent,
      address: string,
    ) =>
      goBindingsService.getIndexOfAddress({
        hexAddress: address,
        chainId: 'flow-emulator',
      }),
    [FlowserIpcEvent.FLOW_CLI_GET_INFO]: (event: IpcMainInvokeEvent) =>
      flowCliService.getVersion(),
    [FlowserIpcEvent.FLOW_TRANSACTION_SEND]: (
      event: IpcMainInvokeEvent,
      request: SendTransactionRequest,
    ) => walletService.sendTransaction(request),
    [FlowserIpcEvent.FLOW_SCRIPT_EXECUTE]: (
      event: IpcMainInvokeEvent,
      request: ExecuteScriptRequest,
    ) => flowGatewayService.executeScript(request),

    [FlowserIpcEvent.WALLET_KEY_LIST]: (event: IpcMainInvokeEvent) =>
      walletService.listKeyPairs(),
    [FlowserIpcEvent.WALLET_ACCOUNT_CREATE]: async (
      event: IpcMainInvokeEvent,
    ) => {
      // There will be only 1 open workspace for now.
      // TODO(restructure): Handle this differently
      const openWorkspaces = await workspaceService.getOpenWorkspaces();
      return walletService.createAccount({
        workspacePath: openWorkspaces[0].filesystemPath,
      });
    },

    [FlowserIpcEvent.SNAPSHOTS_LIST]: (event: IpcMainInvokeEvent) =>
      flowSnapshotsService.findAll(),
    [FlowserIpcEvent.SNAPSHOTS_CREATE]: (
      event: IpcMainInvokeEvent,
      name: string,
    ) => flowSnapshotsService.create(name),
    [FlowserIpcEvent.SNAPSHOTS_JUMP_TO]: (
      event: IpcMainInvokeEvent,
      id: string,
    ) => flowSnapshotsService.jumpTo(id),
    [FlowserIpcEvent.SNAPSHOTS_ROLLBACK_TO_HEIGHT]: (
      event: IpcMainInvokeEvent,
      height: number,
    ) => flowSnapshotsService.rollbackToHeight(height),

    [FlowserIpcEvent.PROCESS_LOGS_LIST]: (
      event: IpcMainInvokeEvent,
      processId: string,
    ) => processManagerService.findAllLogsByProcess(processId),
  };

  for (const eventName in handlers) {
    const handler = handlers[eventName as FlowserIpcEvent];

    ipcMain.handle(eventName, handler);
  }
}
