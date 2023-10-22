import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { FlowserWorkspace } from '@onflowser/api';
import { FlowserIpcEvent } from './events';
import {
  FlowserAppService,
  FlowserIndexes,
} from '../../services/flowser-app.service';

export function registerHandlers(flowserAppService: FlowserAppService) {
  const { workspaceService, indexes, flowInteractionsService } =
    flowserAppService;

  // Workspaces
  ipcMain.handle(FlowserIpcEvent.WORKSPACES_LIST, () =>
    workspaceService.list(),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_REMOVE,
    (e: IpcMainInvokeEvent, id: string) => workspaceService.remove(id),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_CLOSE,
    (e: IpcMainInvokeEvent, id: string) => workspaceService.close(id),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_OPEN,
    (e: IpcMainInvokeEvent, id: string) => workspaceService.open(id),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_CREATE,
    (e: IpcMainInvokeEvent, createdWorkspace: FlowserWorkspace) =>
      workspaceService.create(createdWorkspace),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_UPDATE,
    (e: IpcMainInvokeEvent, updatedWorkspace: FlowserWorkspace) =>
      workspaceService.update(updatedWorkspace),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_FIND_BY_ID,
    (e: IpcMainInvokeEvent, id: string) => workspaceService.findById(id),
  );
  ipcMain.handle(
    FlowserIpcEvent.WORKSPACES_DEFAULT_SETTINGS,
    (e: IpcMainInvokeEvent) => workspaceService.getDefaultSettings(),
  );

  // Indexes
  ipcMain.handle(
    FlowserIpcEvent.INDEX_GET_ALL,
    (event: IpcMainInvokeEvent, indexName: keyof FlowserIndexes) =>
      indexes[indexName].findAll(),
  );

  // Interactions
  ipcMain.handle(
    FlowserIpcEvent.INTERACTIONS_PARSE,
    (event: IpcMainInvokeEvent, sourceCode: string) =>
      flowInteractionsService.parse(sourceCode),
  );
  ipcMain.handle(
    FlowserIpcEvent.INTERACTIONS_LIST_TEMPLATES,
    async (event: IpcMainInvokeEvent) => {
      // There will be only 1 open workspace for now.
      // TODO(restructure): Handle this differently
      const openWorkspaces = await workspaceService.getOpenWorkspaces();
      return flowInteractionsService.getTemplates({
        // TODO(restructure): Move `workingDirectoryPath` to top-level
        workspacePath: openWorkspaces[0].emulator!.workingDirectoryPath,
      });
    },
  );

}
