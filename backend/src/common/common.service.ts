import { Injectable } from "@nestjs/common";
import { ContractsService } from "../accounts/services/contracts.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { TransactionsService } from "../transactions/transactions.service";
import { BlocksService } from "../blocks/blocks.service";
import { EventsService } from "../events/events.service";
import { LogsService } from "../logs/logs.service";

@Injectable()
export class CommonService {
  constructor(
    private contractsService: ContractsService,
    private accountsService: AccountsService,
    private blocksService: BlocksService,
    private transactionsService: TransactionsService,
    private eventsService: EventsService,
    private logsService: LogsService
  ) {}

  async getCounters() {
    const [log, accounts, blocks, transactions, events, contracts] =
      await Promise.all([
        this.logsService.countAll(),
        this.accountsService.countAll(),
        this.blocksService.countAll(),
        this.transactionsService.countAll(),
        this.eventsService.countAll(),
        this.contractsService.countAll(),
      ]);
    return {
      log,
      accounts,
      blocks,
      transactions,
      events,
      contracts,
    };
  }
}
