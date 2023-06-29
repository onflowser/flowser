import { TransportService } from "./transports/transport.service";
import { HttpTransportService } from "./transports/http-transport.service";
import { ProjectsService } from "./projects.service";
import { CommonService } from "./common.service";
import { AccountsService } from "./accounts.service";
import { BlocksService } from "./blocks.service";
import { ContractsService } from "./contracts.service";
import { EventsService } from "./events.service";
import { ProcessesService } from "./processes.service";
import { StorageService } from "./storage.service";
import { TransactionsService } from "./transactions.service";
import { SnapshotService } from "./snapshots.service";
import { AnalyticsService } from "./analytics.service";
import { WalletService } from "./wallet.service";

export class ServiceRegistry {
  private static instance: ServiceRegistry | undefined;
  public projectsService: ProjectsService;
  public commonService: CommonService;
  public accountsService: AccountsService;
  public blocksService: BlocksService;
  public contractsService: ContractsService;
  public eventsService: EventsService;
  public processesService: ProcessesService;
  public storageService: StorageService;
  public transactionsService: TransactionsService;
  public snapshotService: SnapshotService;
  public analyticsService: AnalyticsService;
  public walletService: WalletService;

  constructor(private readonly transport: TransportService) {
    this.projectsService = new ProjectsService(transport);
    this.commonService = new CommonService(transport);
    this.accountsService = new AccountsService(transport);
    this.blocksService = new BlocksService(transport);
    this.contractsService = new ContractsService(transport);
    this.eventsService = new EventsService(transport);
    this.processesService = new ProcessesService(transport);
    this.storageService = new StorageService(transport);
    this.transactionsService = new TransactionsService(transport);
    this.storageService = new StorageService(transport);
    this.snapshotService = new SnapshotService(transport);
    this.walletService = new WalletService(transport);
    this.analyticsService = new AnalyticsService();
  }

  static getInstance(transport?: TransportService): ServiceRegistry {
    const defaultTransportService = new HttpTransportService();
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(
        transport ?? defaultTransportService
      );
    }
    return ServiceRegistry.instance;
  }
}
