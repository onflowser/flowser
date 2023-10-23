import {
  FlowAccountStorageService,
  FlowGatewayService,
  FlowIndexerService,
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

// TODO(restructure): Should this be more like a service registry instead?
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
  private readonly flowConfigService: FlowConfigService;
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
      async (workspaceId) => {
        const workspace =
          await this.workspaceService.findByIdOrThrow(workspaceId);
        if (workspace.emulator) {
          await this.flowEmulatorService.start({
            workspacePath: workspace.filesystemPath,
            config: workspace.emulator,
          });
        }
      },
    );
    this.workspaceService.on(WorkspaceEvent.WORKSPACE_CLOSE, async () => {
      await this.flowEmulatorService.stopAndCleanup();
      this.blockchainIndexService.clear();
    });
  }

  configure() {
    this.flowGatewayService.configure({
      restServerAddress: 'http://localhost:8888',
      flowJSON: {
        contracts: {
          ExampleNFT: 'cadence/contracts/exampleNFT/ExampleNFT.cdc',
          FungibleToken: {
            source: '',
            aliases: {
              emulator: 'ee82856bf20e2aa6',
            },
          },
          MetadataViews: {
            source: '',
            aliases: {
              emulator: 'f8d6e0586b0a20c7',
            },
          },
          NonFungibleToken: {
            source: '',
            aliases: {
              emulator: 'f8d6e0586b0a20c7',
            },
          },
          ViewResolver: 'cadence/contracts/standards/ViewResolver.cdc',
        },
        networks: {
          emulator: '127.0.0.1:3569',
          mainnet: 'access.mainnet.nodes.onflow.org:9000',
          sandboxnet: 'access.sandboxnet.nodes.onflow.org:9000',
          testnet: 'access.devnet.nodes.onflow.org:9000',
        },
        accounts: {
          default: {
            address: 'f669cb8d41ce0c74',
            key: '2e09fac1b3b8e128c67b2e57ba59ec8506ff8326053812135a954b4d3291096f',
          },
          'emulator-account': {
            address: 'f8d6e0586b0a20c7',
            key: 'd2c3686da84d61c13627bdf2127866fe358165734f5470be792e6771901d2856',
          },
          exampleNFT: {
            address: '192440c99cb17282',
            key: '58cfc56dcbbfa8bfb7b9898586793b0710dfebe8a0358774044968abc9acc8c2',
          },
          standards: {
            address: 'fd43f9148d4b725d',
            key: '28946711cc802634ca4520c0f8b113e065c519dc02306a05ecb204a896ee80ed',
          },
          '0x01cf0e2f2f715450': {
            address: '0x01cf0e2f2f715450',
            key: '95b367208187ecc83a3e6c9aba61ad0edc00af3e0d678c60b39fe13ccfc5d75b',
          },
          '0x179b6b1cb6755e31': {
            address: '0x179b6b1cb6755e31',
            key: 'f1f066337d4e853311807fd94bed599739d7cede8c6e6585414703eb0e0345ed',
          },
        },
        deployments: {
          emulator: {
            default: [],
            exampleNFT: ['ExampleNFT'],
            standards: ['ViewResolver'],
          },
        },
      },
    });
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
