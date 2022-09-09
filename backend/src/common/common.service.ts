import { Injectable, Logger } from "@nestjs/common";
import { ContractsService } from "../accounts/services/contracts.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { TransactionsService } from "../transactions/transactions.service";
import { BlocksService } from "../blocks/blocks.service";
import { EventsService } from "../events/events.service";
import { LogsService } from "../logs/logs.service";
import { KeysService } from "../accounts/services/keys.service";
import { AccountStorageService } from "../accounts/services/storage.service";

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  constructor(
    private contractsService: ContractsService,
    private accountsService: AccountsService,
    private blocksService: BlocksService,
    private transactionsService: TransactionsService,
    private eventsService: EventsService,
    private logsService: LogsService,
    private accountKeysService: KeysService,
    private accountStorageService: AccountStorageService
  ) {}

  async removeBlockchainData() {
    // Remove contracts before removing accounts, because of the foreign key constraint.
    try {
      await Promise.all([
        this.contractsService.removeAll(),
        this.accountKeysService.removeAll(),
        this.accountStorageService.removeAll(),
      ]);
    } catch (e) {
      this.logger.error("Failed to remove account relations data", e);
    }
    try {
      await Promise.all([
        this.accountsService.removeAll(),
        this.blocksService.removeAll(),
        this.eventsService.removeAll(),
        this.logsService.removeAll(),
        this.transactionsService.removeAll(),
      ]);
    } catch (e) {
      // TODO(milestone-x): Data removal fails when reverting to snapshot (QueryFailedError: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed)
      this.logger.error("Failed to remove other data", e);
      throw e;
    }
  }
}
