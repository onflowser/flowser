import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { FlowserWorkspace } from '@onflowser/api';
import { FlowserIpcEvent } from './events';
import { FlowserAppService } from '../../services/flowser-app.service';

export function registerHandlers(flowserAppService: FlowserAppService) {
  const { workspaceService } = flowserAppService;

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
}
