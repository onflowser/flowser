import { Injectable, Logger } from "@nestjs/common";
import { ContractsService } from "../../accounts/services/contracts.service";
import { AccountsService } from "../../accounts/services/accounts.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { BlocksService } from "../../blocks/blocks.service";
import { EventsService } from "../../events/events.service";
import { KeysService } from "../../accounts/services/keys.service";
import { AccountStorageService } from "../../accounts/services/storage.service";

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  constructor(
    private contractsService: ContractsService,
    private accountsService: AccountsService,
    private blocksService: BlocksService,
    private transactionsService: TransactionsService,
    private eventsService: EventsService,
    private accountKeysService: KeysService,
    private accountStorageService: AccountStorageService
  ) {}

  async removeBlockchainData() {
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
}
