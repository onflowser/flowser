import { dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import { FlowserWorkspace, ManagedProcess } from '@onflowser/api';
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

export function registerHandlers(appService: FlowserAppService) {
  const {
    workspaceService,
    blockchainIndexService,
    flowInteractionsService,
    flowCliService,
    flowConfigService,
    goBindingsService,
    flowGatewayService,
    walletService,
    flowSnapshotsService,
    processManagerService,
    dependencyManagerService,
  } = appService;

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
    // These are invoked from main process and handled in renderer,
    // so we don't need to implement the invoking logic here.
    APP_EXIT(): any {},
    APP_LOG(): any {},
    APP_UPDATE_END(): any {},
    APP_UPDATE_PROGRESS(): any {},
    APP_UPDATE_START(): any {},

    APP_DEPENDENCY_ERRORS_LIST: () =>
      dependencyManagerService.validateDependencies(),

    APP_DIRECTORY_PICKER_SHOW: () => showDirectoryPicker(),

    WORKSPACES_CLOSE: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.close(id),
    WORKSPACES_OPEN: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.open(id),
    WORKSPACES_CREATE: (
      e: IpcMainInvokeEvent,
      createdWorkspace: FlowserWorkspace,
    ) => workspaceService.create(createdWorkspace),
    WORKSPACES_UPDATE: (
      e: IpcMainInvokeEvent,
      updatedWorkspace: FlowserWorkspace,
    ) => workspaceService.update(updatedWorkspace),
    WORKSPACES_LIST: () => workspaceService.findAll(),
    WORKSPACES_FIND_BY_ID: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.findById(id),
    WORKSPACES_REMOVE: (e: IpcMainInvokeEvent, id: string) =>
      workspaceService.remove(id),
    WORKSPACES_DEFAULT_SETTINGS: (e: IpcMainInvokeEvent) =>
      workspaceService.getDefaultSettings(),

    INDEX_GET_ALL: (
      event: IpcMainInvokeEvent,
      indexName: keyof BlockchainIndexes,
    ) => blockchainIndexService.indexes[indexName].findAll(),

    INTERACTIONS_PARSE: (event: IpcMainInvokeEvent, sourceCode: string) =>
      flowInteractionsService.parse(sourceCode),
    INTERACTIONS_LIST_TEMPLATES: async () => {
      const openWorkspace = await workspaceService.getOpenWorkspaceOrThrow();
      return flowInteractionsService.getTemplates({
        workspacePath: openWorkspace.filesystemPath,
      });
    },

    FLOW_ACCOUNT_GET_INDEX: (
      event: IpcMainInvokeEvent,
      chainID: string,
      address: string,
    ) =>
      goBindingsService.getIndexOfAddress({
        hexAddress: address,
        chainId: chainID,
      }),
    FLOW_CLI_GET_INFO: () => flowCliService.getVersion(),
    FLOW_CONFIG_GET_CONTRACTS: () => flowConfigService.getContracts(),
    FLOW_CONFIG_GET_ACCOUNTS: () => flowConfigService.getAccounts(),
    FLOW_TRANSACTION_SEND: (
      event: IpcMainInvokeEvent,
      request: SendTransactionRequest,
    ) => walletService.sendTransaction(request),
    FLOW_SCRIPT_EXECUTE: (
      event: IpcMainInvokeEvent,
      request: ExecuteScriptRequest,
    ) => flowGatewayService.executeScript(request),

    WALLET_KEY_LIST: () => walletService.listKeyPairs(),
    WALLET_ACCOUNT_CREATE: async () => {
      const openWorkspace = await workspaceService.getOpenWorkspaceOrThrow();
      return walletService.createAccount({
        workspacePath: openWorkspace.filesystemPath,
      });
    },

    SNAPSHOTS_LIST: () => flowSnapshotsService.findAll(),
    SNAPSHOTS_CREATE: (event: IpcMainInvokeEvent, name: string) =>
      flowSnapshotsService.create(name),
    SNAPSHOTS_JUMP_TO: (event: IpcMainInvokeEvent, id: string) =>
      flowSnapshotsService.jumpTo(id),
    SNAPSHOTS_ROLLBACK_TO_HEIGHT: (event: IpcMainInvokeEvent, height: number) =>
      flowSnapshotsService.rollbackToHeight(height),

    PROCESS_LOGS_LIST: (event: IpcMainInvokeEvent, processId: string) => {
      try {
        return processManagerService.findAllLogsByProcess(processId);
      } catch (error) {
        // Return no logs, if process not found
        return [];
      }
    },
    PROCESS_LIST: () =>
      processManagerService.getAll().map(
        (process): ManagedProcess => ({
          id: process.id,
          state: process.state,
          name: process.options.name,
          command: process.options.command,
          createdAt: process.createdAt,
          updatedAt: process.updatedAt,
        }),
      ),
  };

  for (const eventName in handlers) {
    const handler = handlers[eventName as FlowserIpcEvent];

    ipcMain.handle(eventName, handler);
  }
}
