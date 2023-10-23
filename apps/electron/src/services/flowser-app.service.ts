import {
  FlowAccountStorageService,
  FlowGatewayService,
  FlowIndexerService,
  FlowSnapshotsService,
  IFlowserLogger,
  InMemoryIndex,
} from '@onflowser/core';
import {
  FlowAccount,
  FlowAccountStorage,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowTransaction,
} from '@onflowser/api';
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
  private scheduler: AsyncIntervalScheduler;

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
    this.processManagerService = new ProcessManagerService();
    this.flowCliService = new FlowCliService(this.processManagerService);
    this.flowEmulatorService = new FlowEmulatorService(
      this.processManagerService,
    );
    this.flowSnapshotsService = new FlowSnapshotsService();
    this.workspaceService = new WorkspaceService(this.flowEmulatorService);
    this.blockchainIndexService = new BlockchainIndexService({
      transaction: new InMemoryIndex<FlowTransaction>(),
      block: new InMemoryIndex<FlowBlock>(),
      account: new InMemoryIndex<FlowAccount>(),
      event: new InMemoryIndex<FlowEvent>(),
      contract: new InMemoryIndex<FlowContract>(),
      accountStorage: new InMemoryIndex<FlowAccountStorage>(),
    });
    this.flowIndexerService = new FlowIndexerService(
      this.logger,
      this.blockchainIndexService.indexes.transaction,
      this.blockchainIndexService.indexes.account,
      this.blockchainIndexService.indexes.block,
      this.blockchainIndexService.indexes.event,
      this.blockchainIndexService.indexes.contract,
      this.blockchainIndexService.indexes.accountStorage,
      this.flowAccountStorageService,
      this.flowGatewayService,
      this.flowInteractionsService,
    );
    this.flowConfigService = new FlowConfigService(this.logger);
    this.walletService = new WalletService(
      this.logger,
      this.flowCliService,
      this.flowGatewayService,
      this.flowConfigService,
      this.blockchainIndexService.indexes.account,
    );
    this.scheduler = new AsyncIntervalScheduler({
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

  startProcessing() {
    return this.scheduler.start();
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

    if (workspace.emulator) {
      await this.flowEmulatorService.start({
        workspacePath: workspace.filesystemPath,
        config: workspace.emulator,
      });
    }

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
