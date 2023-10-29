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
  FlowConfigService,
  FlowEmulatorService,
  FlowInteractionsService,
  GoBindingsService,
  ProcessManagerService,
  WalletService,
} from '@onflowser/nodejs';
import path from 'path';
import { WorkspaceEvent, WorkspaceService } from './workspace.service';
import { BlockchainIndexService } from './blockchain-index.service';
import { FileStorageService } from './file-storage.service';

// Root service that ties all the pieces together and orchestrates them.
export class FlowserAppService {
  static instance: FlowserAppService;
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
  public readonly logger: IFlowserLogger;
  public readonly blockchainIndexService: BlockchainIndexService;
  public readonly flowSnapshotsService: FlowSnapshotsService;
  public readonly flowConfigService: FlowConfigService;
  private readonly flowSnapshotsStorageService: FileStorageService;
  private readonly walletStorageService: FileStorageService;
  private processingScheduler: AsyncIntervalScheduler;

  constructor() {
    this.flowGatewayService = new FlowGatewayService();
    this.logger = new WebLogger();
    this.flowAccountStorageService = new FlowAccountStorageService(
      this.flowGatewayService,
    );
    this.goBindingsService = new GoBindingsService({
      // TODO(restructure): Test if this works on windows/linux
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
    this.processingScheduler = new AsyncIntervalScheduler({
      name: 'Blockchain processing',
      pollingIntervalInMs: 500,
      functionToExecute: () => this.flowIndexerService.processBlockchainData(),
    });
    this.registerListeners();
  }

  static create(): FlowserAppService {
    if (!this.instance) {
      this.instance = new FlowserAppService();
    }
    return this.instance;
  }

  public isCleanupComplete(): boolean {
    return this.processManagerService.isStoppedAll();
  }

  public async cleanup(): Promise<void> {
    this.processingScheduler.stop();
    await this.processManagerService.stopAll();
  }

  private registerListeners() {
    this.workspaceService.on(
      WorkspaceEvent.WORKSPACE_OPEN,
      this.onWorkspaceOpen.bind(this),
    );
    this.workspaceService.on(
      WorkspaceEvent.WORKSPACE_CLOSE,
      this.onWorkspaceClose.bind(this),
    );
    this.flowSnapshotsService.on(
      FlowSnapshotsEvent.ROLLBACK_TO_HEIGHT,
      this.onRollbackToBlockHeight.bind(this),
    );
    this.flowSnapshotsService.on(
      FlowSnapshotsEvent.JUMP_TO,
      this.onRollbackToBlockHeight.bind(this),
    );
  }

  private async onRollbackToBlockHeight() {
    this.blockchainIndexService.clear();
    await this.walletService.synchronizeIndex();
  }

  private async onWorkspaceOpen(workspaceId: string) {
    const workspace = await this.workspaceService.findByIdOrThrow(workspaceId);

    await this.flowConfigService.configure({
      workspacePath: workspace.filesystemPath,
    });

    this.flowGatewayService.configure({
      restServerAddress: 'http://localhost:8888',
      flowJSON: this.flowConfigService.getFlowJSON(),
    });

    this.processingScheduler.start();

    if (workspace.emulator) {
      await this.flowEmulatorService.start({
        workspacePath: workspace.filesystemPath,
        config: workspace.emulator,
      });
    }

    // Separately store of each workspaces' data.
    this.flowSnapshotsStorageService.setFileName(
      `flowser-snapshots-${workspaceId}.json`,
    );
    await this.flowSnapshotsService.synchronizeIndex();

    this.walletStorageService.setFileName(`flowser-wallet-${workspaceId}.json`);
    await this.walletService.synchronizeIndex();

    if (workspace.emulator) {
      this.flowSnapshotsService.configure({
        adminServerPort: workspace.emulator.adminServerPort,
      });
    } else {
      this.flowSnapshotsService.configure({
        adminServerPort:
          this.flowEmulatorService.getDefaultConfig().adminServerPort,
      });
    }
  }

  private async onWorkspaceClose() {
    await this.flowEmulatorService.stopAndCleanup();
    this.blockchainIndexService.clear();
    this.processingScheduler.stop();
  }
}

class WebLogger implements IFlowserLogger {
  debug(message: any): void {
    console.debug(message);
  }

  error(message: any, error?: unknown): void {
    console.error(message, error);
  }

  log(message: any): void {
    console.log(message);
  }

  verbose(message: any): void {
    console.debug(message);
  }

  warn(message: any): void {
    console.warn(message);
  }
}
