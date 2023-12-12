import {
  FlowAccountStorageService,
  FlowGatewayService,
  FlowIndexerService,
  FlowSnapshotsEvent,
  FlowSnapshotsService,
  IFlowserLogger,
} from '@onflowser/core';
import {
  AsyncIntervalScheduler,
  FlowCliService,
  FlowConfigEvent,
  FlowConfigService,
  FlowEmulatorService,
  FlowInteractionsService,
  GoBindingsService,
  ProcessManagerService,
  WalletService,
} from '@onflowser/nodejs';
import path from 'path';
import crypto from 'crypto';
import { app, BrowserWindow, dialog } from 'electron';
import { FlowserWorkspace } from '@onflowser/api';
import { HttpService } from '@onflowser/core/src/http.service';
import { WorkspaceEvent, WorkspaceService } from './workspace.service';
import { BlockchainIndexService } from './blockchain-index.service';
import { FileStorageService } from './file-storage.service';
import { indexSyncIntervalInMs } from '../renderer/ipc-index-cache';
import { isErrorWithMessage } from '../utils';
import { resolveHtmlPath } from '../main/util';
import { DependencyManagerService } from './dependency-manager.service';

// Root service that ties all the pieces together and orchestrates them.
export class FlowserAppService {
  public readonly flowGatewayService: FlowGatewayService;
  public readonly flowIndexerService: FlowIndexerService;
  public readonly flowAccountStorageService: FlowAccountStorageService;
  public readonly processManagerService: ProcessManagerService;
  public readonly flowEmulatorService: FlowEmulatorService;
  public readonly workspaceService: WorkspaceService;
  public readonly goBindingsService: GoBindingsService;
  public readonly flowInteractionsService: FlowInteractionsService;
  public readonly flowCliService: FlowCliService;
  public readonly walletService: WalletService;
  public readonly blockchainIndexService: BlockchainIndexService;
  public readonly flowSnapshotsService: FlowSnapshotsService;
  public readonly flowConfigService: FlowConfigService;
  public readonly dependencyManagerService: DependencyManagerService;
  private readonly flowSnapshotsStorageService: FileStorageService;
  private readonly walletStorageService: FileStorageService;
  private processingScheduler: AsyncIntervalScheduler;
  private httpService: HttpService;

  constructor(
    private readonly logger: IFlowserLogger,
    private readonly window: BrowserWindow,
  ) {
    this.httpService = new HttpService(logger);
    this.flowGatewayService = new FlowGatewayService(this.httpService);
    this.flowAccountStorageService = new FlowAccountStorageService(
      this.flowGatewayService,
    );
    this.goBindingsService = new GoBindingsService({
      binDirPath:
        process.env.NODE_ENV === 'development'
          ? path.join(__dirname, '../../../../', 'packages', 'nodejs', 'bin')
          : process.resourcesPath,
    });
    this.flowInteractionsService = new FlowInteractionsService(
      this.goBindingsService,
    );
    this.processManagerService = new ProcessManagerService(this.logger, {
      // We are manually handling shutdown before the app closes
      gracefulShutdown: true,
    });
    this.flowCliService = new FlowCliService(this.processManagerService);
    this.flowEmulatorService = new FlowEmulatorService(
      this.processManagerService,
    );
    this.flowSnapshotsStorageService = new FileStorageService();
    this.flowSnapshotsService = new FlowSnapshotsService(
      this.flowSnapshotsStorageService,
      this.httpService,
    );
    this.workspaceService = new WorkspaceService(
      this.flowEmulatorService,
      new FileStorageService('flowser-workspaces.json'),
    );
    this.blockchainIndexService = new BlockchainIndexService();
    this.flowIndexerService = new FlowIndexerService(
      this.logger,
      this.blockchainIndexService.indexes.transaction,
      this.blockchainIndexService.indexes.account,
      this.blockchainIndexService.indexes.block,
      this.blockchainIndexService.indexes.event,
      this.blockchainIndexService.indexes.contract,
      this.blockchainIndexService.indexes.accountKey,
      this.blockchainIndexService.indexes.accountStorage,
      this.flowAccountStorageService,
      this.flowGatewayService,
      this.flowInteractionsService,
    );
    this.flowConfigService = new FlowConfigService(this.logger);
    this.walletStorageService = new FileStorageService();
    this.walletService = new WalletService(
      this.flowCliService,
      this.flowGatewayService,
      this.walletStorageService,
    );
    this.dependencyManagerService = new DependencyManagerService(
      this.flowCliService,
    );
    this.processingScheduler = new AsyncIntervalScheduler({
      name: 'Blockchain processing',
      pollingIntervalInMs: indexSyncIntervalInMs,
      functionToExecute: () => this.flowIndexerService.processBlockchainData(),
    });
    this.registerListeners();
  }

  public isCleanupComplete(): boolean {
    return this.processManagerService.isStoppedAll();
  }

  public async cleanup(): Promise<void> {
    this.processingScheduler.stop();
    await this.processManagerService.stopAll();
  }

  public async openTemporaryWorkspace(): Promise<void> {
    const { hasSwitch, getSwitchValue } = app.commandLine;

    // This flag must stay unchanged, since Flow CLI depends on it.
    const workspacePathFlag = 'project-path';

    const shouldOpenWorkspace = hasSwitch(workspacePathFlag);

    if (shouldOpenWorkspace) {
      const filesystemPath = getSwitchValue(workspacePathFlag);
      const parsedPath = path.parse(filesystemPath);
      // We need to use URL friendly format,
      // since workspace IDs are used in URLs as parameters.
      const id = crypto
        .createHash('sha256')
        .update(path.normalize(filesystemPath))
        .digest()
        .toString('base64url');

      await this.workspaceService.createTemporary({
        id,
        name: parsedPath.name,
        filesystemPath,
        emulator: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.workspaceService.open(id);

      // Our react-router instance is configured to use hash-based navigation:
      // https://reactrouter.com/en/main/routers/create-hash-router.
      await this.window.loadURL(
        `${resolveHtmlPath('index.html')}#/projects/${id}`,
      );
    }
  }

  private registerListeners() {
    this.workspaceService.on(
      WorkspaceEvent.WORKSPACE_OPEN,
      this.handleListenerError(
        this.onWorkspaceOpen.bind(this),
        'Failed to open workspace',
      ).bind(this),
    );
    this.workspaceService.on(
      WorkspaceEvent.WORKSPACE_CLOSE,
      this.handleListenerError(
        this.onWorkspaceClose.bind(this),
        'Failed to close workspace',
      ).bind(this),
    );
    this.workspaceService.on(
      WorkspaceEvent.WORKSPACE_UPDATE,
      this.handleListenerError(
        this.onWorkspaceUpdate.bind(this),
        'Failed to update workspace',
      ).bind(this),
    );
    this.flowSnapshotsService.on(
      FlowSnapshotsEvent.ROLLBACK_TO_HEIGHT,
      this.handleListenerError(
        this.onRollbackToBlockHeight.bind(this),
        'Failed to rollback to height',
      ).bind(this),
    );
    this.flowSnapshotsService.on(
      FlowSnapshotsEvent.JUMP_TO,
      this.handleListenerError(
        this.onRollbackToBlockHeight.bind(this),
        'Failed to jump to snapshot',
      ).bind(this),
    );
    this.flowConfigService.on(
      FlowConfigEvent.FLOW_JSON_UPDATE,
      this.handleListenerError(
        this.onFlowJsonUpdate.bind(this),
        'Failed to reload flow config',
      ).bind(this),
    );
  }

  private handleListenerError(
    listener: (...args: any[]) => Promise<void>,
    errorMessage: string,
  ) {
    return async (...args: unknown[]) => {
      try {
        await listener(...args);
      } catch (error) {
        this.logger.error(error);
        const result = await dialog.showMessageBox(this.window, {
          message: errorMessage,
          detail: isErrorWithMessage(error) ? error.message : undefined,
          type: 'error',
          buttons: ['Restart app'],
        });
        const quitClicked = result.response === 0;
        if (quitClicked) {
          app.relaunch();
          app.quit();
        }
      }
    };
  }

  private async onFlowJsonUpdate() {
    const openWorkspace = await this.workspaceService.getOpenWorkspace();

    if (openWorkspace) {
      this.flowGatewayService.configure({
        flowJSON: this.flowConfigService.getFlowJSON(),
        restServerAddress: `http://localhost:${
          openWorkspace.emulator?.restServerPort ?? 8888
        }`,
      });
    }
  }

  private async onRollbackToBlockHeight() {
    this.blockchainIndexService.clear();
    await this.walletService.synchronizeIndex();
  }

  private async onWorkspaceUpdate(workspaceId: string) {
    const workspace = await this.workspaceService.findByIdOrThrow(workspaceId);

    await this.flowEmulatorService.stopAndCleanup();

    await this.startAndReindexEmulator(workspace);
  }

  private async onWorkspaceOpen(workspaceId: string) {
    const workspace = await this.workspaceService.findByIdOrThrow(workspaceId);

    await this.flowConfigService.configure({
      workspacePath: workspace.filesystemPath,
    });

    // Separately store of each workspaces' data.
    this.flowSnapshotsStorageService.setFileName(
      `flowser-snapshots-${workspaceId}.json`,
    );

    this.walletStorageService.setFileName(`flowser-wallet-${workspaceId}.json`);

    await this.startAndReindexEmulator(workspace);
  }

  private async startAndReindexEmulator(workspace: FlowserWorkspace) {
    if (workspace.emulator) {
      // TODO: Sometimes when we restart the emulator,
      //  it complains that port 8080 is already taken.
      await this.flowEmulatorService.start({
        workspacePath: workspace.filesystemPath,
        config: workspace.emulator,
      });
    }

    this.flowGatewayService.configure({
      flowJSON: this.flowConfigService.getFlowJSON(),
      restServerAddress: `http://localhost:${
        workspace.emulator?.restServerPort ??
        this.flowEmulatorService.getDefaultConfig().restServerPort
      }`,
    });

    this.flowSnapshotsService.configure({
      adminServerPort:
        workspace.emulator?.adminServerPort ??
        this.flowEmulatorService.getDefaultConfig().adminServerPort,
    });

    this.blockchainIndexService.clear();
    this.processingScheduler.start();

    await this.walletService.synchronizeIndex();
    await this.flowSnapshotsService.synchronizeIndex();
  }

  private async onWorkspaceClose() {
    await this.flowEmulatorService.stopAndCleanup();
    this.blockchainIndexService.clear();
    this.processingScheduler.stop();
  }
}
