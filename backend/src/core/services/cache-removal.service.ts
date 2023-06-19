import { Injectable, Logger } from "@nestjs/common";
import { ContractsService } from "../../accounts/services/contracts.service";
import { AccountsService } from "../../accounts/services/accounts.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { BlocksService } from "../../blocks/blocks.service";
import { EventsService } from "../../events/events.service";
import { KeysService } from "../../accounts/services/keys.service";
import { AccountStorageService } from "../../accounts/services/storage.service";

/**
 * Our Sqlite database acts as a cache for blockchain related data,
 * which is project-based and should be revalidated (repopulated) in some cases.
 *
 * In the future we could avoid this pattern, by implementing multi-tenancy:
 * https://www.notion.so/flowser/Multitenant-architecture-9bbc3053cade47f2bf1867626a54e074?pvs=4
 */
@Injectable()
export class CacheRemovalService {
  private readonly logger = new Logger(CacheRemovalService.name);
  constructor(
    private contractsService: ContractsService,
    private accountsService: AccountsService,
    private blocksService: BlocksService,
    private transactionsService: TransactionsService,
    private eventsService: EventsService,
    private accountKeysService: KeysService,
    private accountStorageService: AccountStorageService
  ) {}

  async removeAll() {
    try {
      // Remove contracts before removing accounts, because of the foreign key constraint.
      await Promise.all([
        this.contractsService.removeAll(),
        this.accountKeysService.removeAll(),
        this.accountStorageService.removeAll(),
        this.transactionsService.removeAll(),
        this.eventsService.removeAll(),
      ]);
      await Promise.all([
        this.accountsService.removeAll(),
        this.blocksService.removeAll(),
      ]);
    } catch (e) {
      this.logger.error("Failed to remove other data", e);
      throw e;
    }
  }

  async removeByBlockIds(blockIds: string[]) {
    try {
      // Remove contracts before removing accounts, because of the foreign key constraint.
      await Promise.all([
        this.contractsService.removeByBlockIds(blockIds),
        this.accountKeysService.removeByBlockIds(blockIds),
        this.accountStorageService.removeAll(),
        this.transactionsService.removeByBlockIds(blockIds),
        this.eventsService.removeByBlockIds(blockIds),
      ]);
      await Promise.all([
        this.accountsService.removeByBlockIds(blockIds),
        this.blocksService.removeByBlockIds(blockIds),
      ]);
    } catch (e) {
      this.logger.error("Failed to remove other data", e);
      throw e;
    }
  }
}
